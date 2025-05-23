import {
  reactExtension,
  Text,
  useCartLineTarget,
  useTranslate
} from "@shopify/ui-extensions-react/checkout";
import { parseISOStringIntoFormalDate } from "../../../shared/tools/date-tools";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.cart-line-item.render-after", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const cartLine = useCartLineTarget();

  // Handle Data
  const preorderData = cartLine.attributes.find((attr) => attr.key === "_dropdeck_preorder_data");
  if (!preorderData) return null;
  const preorderJson = JSON.parse(preorderData.value);
  if (!preorderJson) return null;

  const { releaseDate, unitsPerCustomer } = preorderJson;

  // Handle UI
  const fetchOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      variantId: this.vId,
      target: "product-interaction",
    }),
  };

  fetch("/apps/px", fetchOptions)
    .then((res) => res.json())
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
    })

  return (
    <Text appearance="subdued" size="small" >
      {translate("shipsOnOrAfter", {
        date: parseISOStringIntoFormalDate(releaseDate),
      })}
    </Text>
  );
}