import crypto from "crypto";

/**
 * Verifies the HMAC signature of a Shopify webhook request.
 * @param request The incoming webhook request
 * @param shopifySecret Your app's Shopify API secret
 * @returns Promise<boolean> true if the signature is valid, false otherwise
 */
export async function verifyShopifyWebhook(request: Request, shopifySecret: string): Promise<boolean> {
  const hmacHeader = request.headers.get("X-Shopify-Hmac-Sha256");
  if (!hmacHeader) return false;

  const body = await request.text();
  const digest = crypto
    .createHmac("sha256", shopifySecret)
    .update(body, "utf8")
    .digest("base64");

  // Use timingSafeEqual to prevent timing attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
  } catch {
    return false;
  }
}
