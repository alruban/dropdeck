import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

type Order = {
  id: string;
  tags: string[]
  line_items: {
    selling_plan_allocation: {
      selling_plan: {
        options: {
          name: string;
          position: number;
          value: string;
        }[];
      }
    }
  }[]
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  // Verify webhook
  const rawBody = await request.text();
  const hmac = request.headers.get("x-shopify-hmac-sha256");
  const topic = request.headers.get("x-shopify-topic");
  const shop = request.headers.get("x-shopify-shop-domain");

  if (!hmac || !topic || !shop) {
    return json({ error: "Missing required headers" }, { status: 400 });
  }

  // Verify webhook authenticity
  const isValid = await authenticate.webhook(request);
  if (!isValid) {
    return json({ error: "Invalid webhook signature" }, { status: 401 });
  }

  // Parse the order data
  const order = JSON.parse(rawBody) as Order;

  // Check if any line items are preorders
  const isPreorder = (order as Order).line_items.some((item: any) => {
    return item.selling_plan_allocation.selling_plan.options.some((option: any) => option.value === "Dropdeck Preorder")
  });

  if (isPreorder) {
    // Add preorder tag to the order
    const mutation = `
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
    `;

    const variables = {
      input: {
        id: order.id,
        tags: [...(order.tags || []), "preorder"]
      }
    };

    const response = await admin.graphql(mutation, {
      variables,
    });

    console.log("WEBHOOK",response)

    const responseJson = await response.json();

    if (responseJson.data?.orderUpdate?.userErrors?.length > 0) {
      console.error("Error updating order:", responseJson.data.orderUpdate.userErrors);
      return json({ error: "Failed to update order" }, { status: 500 });
    }
  }

  return json({ success: true });
};

// Add default export to ensure Remix recognizes this as a route
export default function Webhook() {
  return null;
}
