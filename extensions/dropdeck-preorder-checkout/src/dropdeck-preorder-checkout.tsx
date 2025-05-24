import {
  reactExtension,
  useApi,
  Text,
  useCartLineTarget,
  useCustomer,
  useTranslate,
  useEmail,
  BlockStack
} from "@shopify/ui-extensions-react/checkout";
import { parseISOStringIntoFormalDate } from "../../../shared/tools/date-tools";
import { type CustomerOrder, type GetCustomerOrdersResponse, type GetCustomerResponse } from "../../../app/routes/app.api-checkout";
import { useEffect, useState } from "react";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.cart-line-item.render-after", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const cartLine = useCartLineTarget();
  const customer = useCustomer();
  const email = useEmail();
  const { sessionToken } = useApi()

  // States
  const [customerId, setCustomerId] = useState<string | null>(customer && customer.id ? customer.id : null);
  const [preorderData, setPreorderData] = useState<{
    sellingPlanGroupId: string,
    sellingPlanId: string,
    releaseDate: string,
    unitsPerCustomer: number,
  } | null>(null);
  const [hasExceededLimit, setHasExceededLimit] = useState<boolean>(false);
  const [unitsBoughtInPreviousOrders, setUnitsBoughtInPreviousOrders] = useState<number>(0);
  const preorderProductId = cartLine.merchandise.product.id;
  const unitsInThisOrder = cartLine.quantity;

  function determineIfCustomerHasExceededPreorderLimit(customerOrders: CustomerOrder[]) {
    const _unitsBoughtInPreviousOrders = customerOrders.reduce((total, order) =>
      total + order.node.lineItems.edges.reduce((orderTotal, lineItem) => {
        const isDropdeckPreorder = lineItem.node.customAttributes.some(
          attr => attr.key === "_dropdeck_preorder" && attr.value === "true"
        );
        const isMatchingProduct = lineItem.node.product.id === preorderProductId;
        return isDropdeckPreorder && isMatchingProduct
          ? orderTotal + lineItem.node.quantity
          : orderTotal;
      }, 0)
    , 0);

    setUnitsBoughtInPreviousOrders(_unitsBoughtInPreviousOrders);
    const unitsAssociatedWithCustomer = _unitsBoughtInPreviousOrders + unitsInThisOrder;
    if (unitsAssociatedWithCustomer > preorderData.unitsPerCustomer) {
      setHasExceededLimit(true);
    }
  }

  useEffect(() => {
    // Handle Data
    const preorderData = cartLine.attributes.find((attr) => attr.key === "_dropdeck_preorder_data");
    if (!preorderData) return;
    const preorderJson = JSON.parse(preorderData.value);
    if (!preorderJson) return;
    setPreorderData(preorderJson);
  }, [cartLine])

  useEffect(() => {
    async function getCustomer(email: string, successCallback: (customerId: string) => void) {
      const token = await sessionToken.get();

      fetch(
        `${process.env.APP_URL}/app/api-checkout`,
        {
          method: "POST",
          body: JSON.stringify({
            customerEmail: email,
            target: "get-customer",
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((res) => res.json() as Promise<GetCustomerResponse>)
        .then((res: GetCustomerResponse) => {
          const customerId = res.data.data.customers.edges[0].node.id;
          successCallback(customerId);
        })
        .catch((err) => console.error(err))
    }

    async function getCustomerOrders(id: string, successCallback: (customerOrders: CustomerOrder[]) => void) {
      const token = await sessionToken.get();

      fetch(
        `${process.env.APP_URL}/app/api-checkout`,
        {
          method: "POST",
          body: JSON.stringify({
            customerId: id,
            target: "get-customer-orders",
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
        .then((res) => res.json() as Promise<GetCustomerOrdersResponse>)
        .then((res: GetCustomerOrdersResponse) => {
          const customerOrders = res.data.data.customer.orders.edges;
          successCallback(customerOrders);
        })
        .catch((err) => console.error(err))
    }

    if (preorderData) {
      if (!customerId) {
        getCustomer(email, (newCustomerId) => {
          if (newCustomerId !== customerId) {
            setCustomerId(newCustomerId);
            getCustomerOrders(newCustomerId, (newCustomerOrders) => {
              determineIfCustomerHasExceededPreorderLimit(newCustomerOrders)
            })
          }
        });
      } else {
        getCustomerOrders(customerId, (newCustomerOrders) => {
          determineIfCustomerHasExceededPreorderLimit(newCustomerOrders)
        })
      }
    }
  }, [preorderData, customerId])

  if (!preorderData) return null;

  return (
    <BlockStack spacing="none">
      <Text appearance="subdued" size="small" >
        {translate("ships_on_or_after", {
          date: parseISOStringIntoFormalDate(preorderData.releaseDate),
        })}
      </Text>
      {preorderData.unitsPerCustomer > 0 && (
        <Text appearance="subdued" size="small" >
          {translate("units_per_customer", {
            total_units: String(preorderData.unitsPerCustomer)
          })}
        </Text>
      )}
      {hasExceededLimit ? (
        <>
          <Text appearance="critical" size="small" >
            {translate("preorder_limit_exceeded")}
          </Text>
          <Text appearance="critical" size="small" >
            Units bought in previous orders: {unitsBoughtInPreviousOrders}
          </Text>
          <Text appearance="critical" size="small" >
            Units in this order: {unitsInThisOrder}
          </Text>
        </>
      ) : (
        <Text appearance="success" size="small">
          Not exceeded
        </Text>
      )}
    </BlockStack>
  );
}