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
  type CustomerOrder,
  type GetCustomerOrdersResponse,
  type GetCustomerResponse,
} from "../../../app/routes/app.api-checkout";
import { useEffect, useState } from "react";

// 1. Choose an extension target
export default reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <Extension />,
);

function Extension() {
  const translate = useTranslate();
  const cartLine = useCartLineTarget();
  const customer = useCustomer();
  const email = useEmail();
  const { sessionToken } = useApi();

  // States
  const [customerId, setCustomerId] = useState<string | null>(
    customer && customer.id ? customer.id : null,
  );
  const [preorderData, setPreorderData] = useState<{
    sellingPlanGroupId: string;
    sellingPlanId: string;
    releaseDate: string;
    unitsPerCustomer: number;
  } | null>(null);
  const [hasExceededLimit, setHasExceededLimit] = useState<boolean>(false);
  const [unitsInPreviousOrders, setUnitsInPreviousOrders] = useState<number>(0);
  const preorderProductId = cartLine.merchandise.product.id;
  const unitsInThisOrder = cartLine.quantity;

  function determineIfLimitExceeded(
    customerOrders: CustomerOrder[],
  ) {
    const _unitsBoughtInPreviousOrders = customerOrders.reduce(
      (total, order) =>
        total +
        order.node.lineItems.edges.reduce((orderTotal, lineItem) => {
          const isDropdeckPreorder = lineItem.node.customAttributes.some(
            (attr) =>
              attr.key === "_dropdeck_preorder" && attr.value === "true",
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
  }

  useEffect(() => {
    // Handle Data
    const preorderData = cartLine.attributes.find(
      (attr) => attr.key === "_dropdeck_preorder_data",
    );
    if (!preorderData) return;
    const preorderJson = JSON.parse(preorderData.value);
    if (!preorderJson) return;
    setPreorderData(preorderJson);
  }, [cartLine]);

  useEffect(() => {
    async function getCustomer(
      email: string,
      successCallback: (customerId: string) => void,
    ) {
      const token = await sessionToken.get();

      fetch(`${process.env.APP_URL}/app/api-checkout`, {
        method: "POST",
        body: JSON.stringify({
          customerEmail: email,
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
      id: string,
      successCallback: (customerOrders: CustomerOrder[]) => void,
    ) {
      const token = await sessionToken.get();

      fetch(`${process.env.APP_URL}/app/api-checkout`, {
        method: "POST",
        body: JSON.stringify({
          customerId: id,
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

    if (preorderData) {
      if (!customerId) {
        console.log(1);
        getCustomer(email, (newCustomerId) => {
          if (newCustomerId !== customerId) {
            setCustomerId(newCustomerId);
            getCustomerOrders(newCustomerId, (newCustomerOrders) => {
              determineIfLimitExceeded(newCustomerOrders);
            });
          }
        });
      } else {
        console.log(2);
        getCustomerOrders(customerId, (newCustomerOrders) => {
          determineIfLimitExceeded(newCustomerOrders);
        });
      }
    }
  }, [preorderData, customerId]);

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (canBlockProgress && preorderData && hasExceededLimit) {
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
        reason: "Preorder limit exceeded.",
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
