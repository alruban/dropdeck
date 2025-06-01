import {
  reactExtension,
  useApi,
  Text,
  useCartLineTarget,
  useCustomer,
  useTranslate,
  useEmail,
  BlockStack,
  useBuyerJourneyIntercept,
} from "@shopify/ui-extensions-react/checkout";
import { parseISOStringIntoFormalDate } from "../../../shared/tools/date-tools";
import {
  type GetPreorderDataResponse,
  type CustomerOrder,
  type GetCustomerOrdersResponse,
  type GetCustomerResponse,
  type CustomerOrderLineItem,
} from "../../../app/routes/app.api-checkout";
import { useEffect, useState } from "react";

// 1. Choose an extension target
export default reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <Extension />,
);

type PreorderData = {
  releaseDate: string;
  unitsPerCustomer: number;
}

function Extension() {
  const translate = useTranslate();
  const cartLine = useCartLineTarget();
  const customer = useCustomer();
  const email = useEmail();
  const { sessionToken } = useApi();

  // States
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [customerId, setCustomerId] = useState<string | null>(
    customer && customer.id ? customer.id : null,
  );
  const [preorderData, setPreorderData] = useState<PreorderData | null>(null);
  const [hasExceededLimit, setHasExceededLimit] = useState<boolean>(false);
  const [unitsInPreviousOrders, setUnitsInPreviousOrders] = useState<number>(0);
  const preorderProductId = cartLine.merchandise.product.id;
  const unitsInThisOrder = cartLine.quantity;

  function determineIfLimitExceeded(
    customerOrders: CustomerOrder[],
  ) {
    const _unitsBoughtInPreviousOrders = customerOrders.reduce(
      (total, order: CustomerOrder) =>
        total +
        order.node.lineItems.edges.reduce((orderTotal, lineItem: CustomerOrderLineItem) => {
          const isDropdeckPreorder = lineItem.node.product.sellingPlanGroups.edges.some(
            (sellingPlanGroup) => sellingPlanGroup.node.appId === "DROPDECK_PREORDER"
          );
          const isMatchingProduct =
            lineItem.node.product.id === preorderProductId;
          return isDropdeckPreorder && isMatchingProduct
            ? orderTotal + lineItem.node.quantity
            : orderTotal;
        }, 0),
      0,
    );

    setUnitsInPreviousOrders(_unitsBoughtInPreviousOrders);
    const unitsAssociatedWithCustomer =
      _unitsBoughtInPreviousOrders + unitsInThisOrder;

    if (unitsAssociatedWithCustomer > preorderData.unitsPerCustomer) {
      setHasExceededLimit(true);
    }

    setIsLoading(false);
  }

  useEffect(() => {
    async function getPreorderData(
      productId: string,
      successCallback: (preorderData: PreorderData) => void,
    ) {
      const token = await sessionToken.get();

      fetch(`${process.env.APP_URL}/app/api-checkout`, {
        method: "POST",
        body: JSON.stringify({
          productId,
          target: "get-preorder-data",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json() as Promise<GetPreorderDataResponse>)
        .then((res: GetPreorderDataResponse) => {
          const { sellingPlanGroups } = res.data.data.product;

          const sellingPlanGroup = sellingPlanGroups.edges.find(
            (sellingPlanGroup) => sellingPlanGroup.node.appId === "DROPDECK_PREORDER"
          );

          if (sellingPlanGroup) {
            successCallback({
              releaseDate: sellingPlanGroup.node.sellingPlans.nodes[0].deliveryPolicy.fulfillmentExactTime,
              unitsPerCustomer: Number(sellingPlanGroup.node.sellingPlans.nodes[0].metafields.edges.find(
                (metafield) => metafield.node.key === "units_per_customer"
              )?.node.value),
            });
          } else {
            throw new Error("Fatal error: No selling plan group found for preorder product.");
          }
        })
        .catch((err) => console.error(err));
    }

    async function getCustomer(
      customerEmail: string,
      successCallback: (customerId: string) => void,
    ) {
      const token = await sessionToken.get();

      fetch(`${process.env.APP_URL}/app/api-checkout`, {
        method: "POST",
        body: JSON.stringify({
          customerEmail,
          target: "get-customer",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json() as Promise<GetCustomerResponse>)
        .then((res: GetCustomerResponse) => {
          const customerId = res.data.data.customers.edges[0].node.id;
          successCallback(customerId);
        })
        .catch((err) => console.error(err));
    }

    async function getCustomerOrders(
      customerId: string,
      successCallback: (customerOrders: CustomerOrder[]) => void,
    ) {
      const token = await sessionToken.get();

      fetch(`${process.env.APP_URL}/app/api-checkout`, {
        method: "POST",
        body: JSON.stringify({
          customerId,
          target: "get-customer-orders",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json() as Promise<GetCustomerOrdersResponse>)
        .then((res: GetCustomerOrdersResponse) => {
          const customerOrders = res.data.data.customer.orders.edges;
          successCallback(customerOrders);
        })
        .catch((err) => console.error(err));
    }

    getPreorderData(preorderProductId, (sellingPlanGroups) => {
      setPreorderData(sellingPlanGroups);

      if (preorderData) {
        if (!customerId) {
          getCustomer(email, (newCustomerId) => {
            if (newCustomerId !== customerId) {
              setCustomerId(newCustomerId);
              getCustomerOrders(newCustomerId, (newCustomerOrders) => {
                determineIfLimitExceeded(newCustomerOrders);
              });
            }
          });
        } else {
          getCustomerOrders(customerId, (newCustomerOrders) => {
            determineIfLimitExceeded(newCustomerOrders);
          });
        }
      }
    });
  }, [customerId]);

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if ((canBlockProgress && isLoading) || (canBlockProgress && preorderData && hasExceededLimit)) {

      let pageError;

      if (unitsInPreviousOrders > preorderData.unitsPerCustomer) {
        pageError = translate("page.error_preorder_limit_exceeded.message_remove_all_units", {
          product_name: cartLine.merchandise.title,
        });
      } else if (unitsInThisOrder + unitsInPreviousOrders > preorderData.unitsPerCustomer) {
        const unitsToRemove = unitsInThisOrder + unitsInPreviousOrders - preorderData.unitsPerCustomer;
        pageError = translate("page.error_preorder_limit_exceeded.message_reduce_units", {
          units: unitsToRemove,
        });
      }

      return {
        behavior: "block",
        reason: translate("page.error_preorder_limit_exceeded.reason"),
        errors: [
          {
            // In addition, show an error at the page level
            message: pageError
          },
        ],
      };
    }

    return {
      behavior: "allow",
    };
  });

  if (preorderData) {
    return (
      <BlockStack spacing="none">
        {/* Info */}
        <Text appearance="subdued" size="small">
          {translate("line_item.ships_on_or_after", {
            date: parseISOStringIntoFormalDate(preorderData.releaseDate),
          })}
        </Text>
        {preorderData.unitsPerCustomer > 0 && (
          <Text appearance="subdued" size="small">
            {translate("line_item.units_per_customer", {
              total_units: String(preorderData.unitsPerCustomer),
            })}
          </Text>
        )}

        {/* Error */}
        {hasExceededLimit && (
          <>
            <Text appearance="critical" size="small">
              {translate("line_item.error_preorder_limit_exceeded.message")}
            </Text>
            {unitsInPreviousOrders > 0 &&
              <Text appearance="critical" size="small">
                {translate("line_item.error_preorder_limit_exceeded.units_bought_in_previous_orders", {
                  units: unitsInPreviousOrders,
                })}
              </Text>
            }
            <Text appearance="critical" size="small">
              {translate("line_item.error_preorder_limit_exceeded.units_in_this_order", {
                units: unitsInThisOrder,
              })}
            </Text>
          </>
        )}
      </BlockStack>
    );
  } else {
    return null;
  }
}
