import {
  reactExtension,
  useApi,
  Text,
  useCartLineTarget,
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
};

function Extension() {
  const translate = useTranslate();
  const cartLine = useCartLineTarget();
  const email = useEmail();
  const { sessionToken } = useApi();

  // States
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [preorderData, setPreorderData] = useState<PreorderData | null>(null);
  const [hasExceededLimit, setHasExceededLimit] = useState<boolean>(false);
  const [unitsInPreviousOrders, setUnitsInPreviousOrders] = useState<number>(0);

  useEffect(() => {
    /* Check to see if the product is a preorder product */
    async function checkIfPreorder(
      productId: string,
      isPreorderCallback: (preorderData: PreorderData) => void,
      isNotPreorderCallback: () => void,
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
            (sellingPlanGroup) =>
              sellingPlanGroup.node.appId === "DROPDECK_PREORDER",
          );

          if (sellingPlanGroup) {
            isPreorderCallback({
              releaseDate:
                sellingPlanGroup.node.sellingPlans.nodes[0].deliveryPolicy
                  .fulfillmentExactTime,
              unitsPerCustomer: Number(
                sellingPlanGroup.node.sellingPlans.nodes[0].metafields.edges.find(
                  (metafield) => metafield.node.key === "units_per_customer",
                )?.node.value,
              ),
            });
          } else {
            isNotPreorderCallback();
          }
        })
        .catch((err) => console.error(err));
    }

    // If it is a preorder product, set the preorder data
    setIsLoading(true);
    checkIfPreorder(
      cartLine.merchandise.product.id,
      (sellingPlanGroups) => {
        setPreorderData(sellingPlanGroups);
      },
      () => {
        setIsLoading(false);
      },
    );
  }, []);

  useEffect(() => {
    // Item is not a preorder product, so we can stop here.
    if (!preorderData) return;

    setHasExceededLimit(false);
    setUnitsInPreviousOrders(0);

    // If it is a preorder product, we continue and determine if the customer has exceeded the limit.
    // Get the customer's id from the entered email (if it exists)
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
          const customers = res.data.data.customers.edges;
          if (customers.length === 0) return;
          const customerId = customers[0].node.id;
          successCallback(customerId);
        })
        .catch((err) => console.error(err));
    }

    /* Get the customer's orders from a customer id */
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

    getCustomer(email, (customerId) => {
      getCustomerOrders(customerId, (customerOrders) => {
        // Check a customer's previous orders for purchases of the preorder product.
        const _unitsBoughtInPreviousOrders = customerOrders.reduce(
          (total, order: CustomerOrder) =>
            total +
            order.node.lineItems.edges.reduce(
              (orderTotal, lineItem: CustomerOrderLineItem) => {
                const isDropdeckPreorder =
                  lineItem.node.product.sellingPlanGroups.edges.some(
                    (sellingPlanGroup) =>
                      sellingPlanGroup.node.appId === "DROPDECK_PREORDER",
                  );
                const isMatchingProduct =
                  lineItem.node.product.id === cartLine.merchandise.product.id;
                return isDropdeckPreorder && isMatchingProduct
                  ? orderTotal + lineItem.node.quantity
                  : orderTotal;
              },
              0,
            ),
          0,
        );

        setUnitsInPreviousOrders(_unitsBoughtInPreviousOrders);

        // Check if the customer has exceeded the limit in this current cart, and their previous orders.
        const unitsAssociatedWithCustomer =
          _unitsBoughtInPreviousOrders + cartLine.quantity;
        if (unitsAssociatedWithCustomer > preorderData.unitsPerCustomer) {
          setHasExceededLimit(true);
        }

        setIsLoading(false);
      });
    });
  }, [preorderData, email, cartLine.quantity, cartLine.merchandise.product.id, sessionToken]);

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    // Block if the user has exceeded the preorder limit for this product.
    if (
      canBlockProgress &&
      hasExceededLimit &&
      preorderData &&
      cartLine.quantity + unitsInPreviousOrders > preorderData.unitsPerCustomer
    ) {
      return {
        behavior: "block",
        reason: translate("page.error_preorder_limit_exceeded.reason"),
        errors: [
          {
            // In addition, show an error at the page level
            message: translate(
              "page.error_preorder_limit_exceeded.message_reduce_units",
              {
                title: cartLine.merchandise.title,
              },
            ),
          },
        ],
      };
    }

    // Block if the script is loading.
    if (canBlockProgress && isLoading) {
      return {
        behavior: "block",
        reason: "loading",
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
            {unitsInPreviousOrders > 0 && (
              <Text appearance="critical" size="small">
                {translate(
                  "line_item.error_preorder_limit_exceeded.units_bought_in_previous_orders",
                  {
                    units: unitsInPreviousOrders,
                  },
                )}
              </Text>
            )}
            <Text appearance="critical" size="small">
              {translate(
                "line_item.error_preorder_limit_exceeded.units_in_this_order",
                {
                  units: cartLine.quantity,
                },
              )}
            </Text>
          </>
        )}
      </BlockStack>
    );
  } else {
    return null;
  }
}
