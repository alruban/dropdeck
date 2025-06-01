import { authenticate } from "app/shopify.server";

export const action = async ({ request }: { request: Request }) => {
  const { shop, topic } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  // No customer data is stored by this app. Nothing to delete.
  return new Response("OK", { status: 200 });
};
