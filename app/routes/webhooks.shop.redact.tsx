import { verifyShopifyWebhook } from "@shared/tools/verify-shopify-webhook";

export const action = async ({ request }: { request: Request }) => {
  const isValid = await verifyShopifyWebhook(request);
  if (!isValid) {
    return new Response("Invalid webhook signature", { status: 401 });
  }
  // No customer data is stored by this app. Nothing to delete.
  return new Response("OK", { status: 200 });
};
