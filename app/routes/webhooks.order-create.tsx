import { data } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

type Order = {
  id: string;
  tags: string[];
  product: {
    selling_plan_groups: {
      app_id: string;
    }[];
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload, session, admin } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  // Parse the order data
  // Check if any line items are preorders
  const isPreorder = (payload as Order).product.selling_plan_groups.some((selling_plan_group) => {
    return selling_plan_group.app_id === "DROPDECK_PREORDER";
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
      return data({ error: "Failed to update order" }, { status: 500 });
    }
  }

  return data({ success: true });
};

// Add default export to ensure Remix recognizes this as a route
export default function Webhook() {
  return null;
}
