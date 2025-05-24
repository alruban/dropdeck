import {
  reactExtension,
  useApi,
  Text,
  useCartLineTarget,
  useCustomer,
  useTranslate,
  useEmail
} from "@shopify/ui-extensions-react/checkout";
import { parseISOStringIntoFormalDate } from "../../../shared/tools/date-tools";

// 1. Choose an extension target
export default reactExtension("purchase.checkout.cart-line-item.render-after", () => (
  <Extension />
));

function Extension() {
  const translate = useTranslate();
  const cartLine = useCartLineTarget();
  const customer = useCustomer();
  const email = useEmail();
  const { shop, sessionToken } = useApi()

  // Handle Data
  const preorderData = cartLine.attributes.find((attr) => attr.key === "_dropdeck_preorder_data");
  if (!preorderData) return null;
  const preorderJson = JSON.parse(preorderData.value);
  if (!preorderJson) return null;

  async function getCustomer(email: string) {
    const token = await sessionToken.get();

    const fetchOptions = {
      method: "POST",
      body: JSON.stringify({
        customerEmail: email,
        target: "get-customer",
      }),
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    console.log("Fetching customer...")

    fetch(`${process.env.APP_URL}/app/checkout`, fetchOptions)
      .then((res) => res.json())
      .then((data) => {
        console.log("Data", data)
      })
      .catch((err) => {
        console.error("ERROR HERE", err)
      })
  }

  const { releaseDate, unitsPerCustomer } = preorderJson;

  console.log("email", email)
  console.log("customer", customer)

  if (!customer) {
    console.log("shop", shop)
    console.log("getCustomer")
    getCustomer(email);
  } else {
    console.log("getCustomerOrders")
  }


  // fetch("/apps/px", fetchOptions)
  //   .then((res) => res.json())
  //   .then((res) => {
  //     console.log(res)
  //   })
  //   .catch((err) => {
  //     console.error(err)
  //   })

  return (
    <Text appearance="subdued" size="small" >
      {translate("shipsOnOrAfter", {
        date: parseISOStringIntoFormalDate(releaseDate),
      })}
    </Text>
  );
}