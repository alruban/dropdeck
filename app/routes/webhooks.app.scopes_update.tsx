import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";
import { verifyShopifyWebhook } from "@shared/verifyShopifyWebhook";

export const action = async ({ request }: ActionFunctionArgs) => {
	const shopifySecret = process.env.SHOPIFY_API_SECRET || "";
	const isValid = await verifyShopifyWebhook(request, shopifySecret);
	if (!isValid) {
		return new Response("Invalid webhook signature", { status: 401 });
	}

	const { payload, session, topic, shop } = await authenticate.webhook(request);
	console.log(`Received ${topic} webhook for ${shop}`);

	const current = payload.current as string[];
	if (session) {
		await db.session.update({
			where: {
				id: session.id
			},
			data: {
				scope: current.toString(),
			},
		});
	}
	return new Response("OK", { status: 200 });
};
