import { verifyShopifyWebhook } from "@shared/verifyShopifyWebhook";

export const action = async ({ request }: { request: Request }) => {
  const shopifySecret = process.env.SHOPIFY_API_SECRET || "";
  const isValid = await verifyShopifyWebhook(request, shopifySecret);
  if (!isValid) {
    return new Response("Invalid webhook signature", { status: 401 });
  }
  // No customer data is stored by this app. Nothing to delete.
  return new Response("OK", { status: 200 });
};
