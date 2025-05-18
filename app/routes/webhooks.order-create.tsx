import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

type Order = {
  id: string;
  tags: string[];
  line_items: {
    properties: {
      name: string;
      value: string;
    }[]
  }[];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload, session, admin } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  // Parse the order data
  // Check if any line items are preorders
  const isPreorder = (payload as Order).line_items.some((item) => {
    return item.properties.some(
      (property: any) => property.name === "_dropdeck_preorder" && property.value === "true",
    );
  });

  if (isPreorder && session) {
    const response = await admin.graphql(
      `
        mutation orderUpdate($input: OrderInput!) {
          orderUpdate(input: $input) {
            order {
              id
              tags
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        variables: {
          input: {
            id: `gid://shopify/Order/${payload.id}`,
            tags: [...(payload.tags || []), "Dropdeck Preorder"],
          },
        },
      },
    );

    const responseJson = await response.json();

    if (responseJson.data?.orderUpdate?.userErrors?.length > 0) {
      console.error(
        "Error updating order:",
        responseJson.data.orderUpdate.userErrors,
      );
      return json({ error: "Failed to update order" }, { status: 500 });
    }
  }

  return json({ success: true });
};

// Add default export to ensure Remix recognizes this as a route
export default function Webhook() {
  return null;
}
