import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

type Order = {
  id: string;
  tags: string[];
  line_items: {
    selling_plan_allocation: {
      selling_plan: {
        options: {
          name: string;
          position: number;
          value: string;
        }[];
      };
    };
  }[];
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload, admin } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  // Parse the order data
  // Check if any line items are preorders
  const isPreorder = (payload as Order).line_items.some((item: any) => {
    return item.selling_plan_allocation.selling_plan.options.some(
      (option: any) => option.value === "Dropdeck Preorder",
    );
  });

  console.log("IS PREORDER", isPreorder);

  if (isPreorder) {
    const response = await admin?.graphql(
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
            id: payload.id,
            tags: [...(payload.tags || []), "preorder"],
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
