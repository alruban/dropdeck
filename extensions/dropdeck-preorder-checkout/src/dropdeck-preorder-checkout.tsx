import {
  reactExtension,
  useApi,
  Text,
  useCartLineTarget,
  useCustomer,
  useTranslate,
  useEmail,
  BlockStack,
  Divider,
  BlockSpacer
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

  function determineIfCustomerHasExceededPreorderLimit(customerOrders: CustomerOrder[]) {
    const preorderProductGid = cartLine.merchandise.product.id;
    const preorderProductId = preorderProductGid;
    console.log("preorderLineItemId", preorderProductId)

    let instancesOfPreorderProductInCustomerOrders = 0;
    for (const order of customerOrders) {
      for (const lineItem of order.node.lineItems.edges) {
        const isDropdeckPreorder = lineItem.node.customAttributes.find((attr) => attr.key === "_dropdeck_preorder" && attr.value === "true");
        const isMatchingProduct = lineItem.node.product.id === preorderProductId;

        if (isDropdeckPreorder && isMatchingProduct) {
          instancesOfPreorderProductInCustomerOrders += lineItem.node.quantity;
        }
      }
    }

    console.log("XX", instancesOfPreorderProductInCustomerOrders)
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
    if (preorderData) return;

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
  }, [customerId])

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
    </BlockStack>
  );
}