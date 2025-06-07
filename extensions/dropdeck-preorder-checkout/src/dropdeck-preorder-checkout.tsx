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

type LineItemPreorderData = {
  releaseDate: string;
  unitsPerCustomer: number;
};

function Extension() {
  const translate = useTranslate();
  const cartLine = useCartLineTarget();
  const email = useEmail();
  const { sessionToken } = useApi();

  // States
  const [lineItemPreorderData, setLineItemPreorderData] = useState<{
    releaseDate: string;
    unitsPerCustomer: number;
    hasExceededLimit: boolean;
    unitsInPreviousOrders: number;
    isLoading: boolean;
  } | null>(null);

  useEffect(() => {
    /* Check to see if the product is a preorder product */
    async function checkIfPreorder(
      productId: string,
      successCallback: (lineItemPreorderData: LineItemPreorderData) => void
    ) {
      const token = await sessionToken.get();

      fetch("https://dropdeck-five.vercel.app/app/api-checkout", {
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

          const lineItemPreorderData = {
            releaseDate:
              sellingPlanGroup.node.sellingPlans.nodes[0].deliveryPolicy
                .fulfillmentExactTime,
            unitsPerCustomer: Number(
              sellingPlanGroup.node.sellingPlans.nodes[0].metafields.edges.find(
                (metafield) => metafield.node.key === "units_per_customer",
              )?.node.value,
            ),
          };

          successCallback(lineItemPreorderData);
        })
        .catch((err) => console.error(err));
    }

    // If it is a preorder product, set the preorder data
    checkIfPreorder(
      cartLine.merchandise.product.id,
      (lineItemPreorderData) => {
        setLineItemPreorderData({
          releaseDate: lineItemPreorderData.releaseDate,
          unitsPerCustomer: lineItemPreorderData.unitsPerCustomer,
          hasExceededLimit: false,
          unitsInPreviousOrders: 0,
          isLoading: true,
        })
      }
    );
  }, []);

  useEffect(() => {
    // Item is not a preorder product, so we can stop here.
    if (!lineItemPreorderData) return;

    // If it is a preorder product, we continue and determine if the customer has exceeded the limit.
    // Get the customer's id from the entered email (if it exists)
    async function getCustomer(
      customerEmail: string,
      successCallback: (customerId: string) => void,
    ) {
      const token = await sessionToken.get();

      fetch("https://dropdeck-five.vercel.app/app/api-checkout", {
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

      fetch("https://dropdeck-five.vercel.app/app/api-checkout", {
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

    if (email && email.length > 0) {
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

          setLineItemPreorderData({
            ...lineItemPreorderData,
            unitsInPreviousOrders: _unitsBoughtInPreviousOrders,
            hasExceededLimit: (_unitsBoughtInPreviousOrders + cartLine.quantity) > lineItemPreorderData.unitsPerCustomer,
            isLoading: false,
          });
        });
      });
    }
  }, [lineItemPreorderData, email, cartLine.quantity, cartLine.merchandise.product.id, sessionToken]);

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    if (lineItemPreorderData && lineItemPreorderData.isLoading) {
      return {
        behavior: "block",
        reason: "loading",
      };
    }

    // Block if the user has exceeded the preorder limit for this product.
    if (canBlockProgress && lineItemPreorderData && lineItemPreorderData.hasExceededLimit) {
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

    return {
      behavior: "allow",
    };
  });

  if (lineItemPreorderData) {
    return (
      <BlockStack spacing="none">
        {/* Info */}
        <Text appearance="subdued" size="small">
          {translate("line_item.ships_on_or_after", {
            date: parseISOStringIntoFormalDate(lineItemPreorderData.releaseDate),
          })}
        </Text>
        {lineItemPreorderData.unitsPerCustomer > 0 && (
          <Text appearance="subdued" size="small">
            {translate("line_item.units_per_customer", {
              total_units: String(lineItemPreorderData.unitsPerCustomer),
            })}
          </Text>
        )}

        {/* Error */}
        {lineItemPreorderData.hasExceededLimit && (
          <>
            <Text appearance="critical" size="small">
              {translate("line_item.error_preorder_limit_exceeded.message")}
            </Text>
            {lineItemPreorderData.unitsInPreviousOrders > 0 && (
              <Text appearance="critical" size="small">
                {translate(
                  "line_item.error_preorder_limit_exceeded.units_bought_in_previous_orders",
                  {
                    units: lineItemPreorderData.unitsInPreviousOrders,
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
