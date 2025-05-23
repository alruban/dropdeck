import { type ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { type AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/admin/types";

type RequestBody = {
  target: 'checkout-interaction' | 'product-interaction';
  customerId?: string;
  variantId?: string;
}

export async function action({ request }: ActionFunctionArgs) {
  const { admin } = await authenticate.public.appProxy(request);
  if (!admin) return new Response();

  const body = await request.json();
  const { target } = body;

  // Handle different paths
  switch (target) {
    case 'checkout-interaction':
      return handleCheckoutInteraction(body, admin);
    case 'product-interaction':
      return handleProductInteraction(body, admin);
    default:
      return false;
  }
}

async function handleProductInteraction(body: RequestBody, admin: AdminApiContextWithoutRest
) {
  const { variantId } = body;

  const response = await admin.graphql(
    `#graphql
    query getProductVariant($id: ID!) {
      productVariant(id: $id) {
        product {
          id
          variants(first: 250) {
            edges {
              node {
                id
                availableForSale
                inventoryPolicy
                inventoryQuantity
              }
            }
          }
          sellingPlanGroupsCount {
            count
          }
          sellingPlanGroups(first: 100) {
            edges {
              node {
                id
                merchantCode
                sellingPlans(first: 1) {
                  edges {
                    node {
                      id
                      deliveryPolicy {
                        ... on SellingPlanFixedDeliveryPolicy {
                          fulfillmentExactTime
                        }
                      }
                      metafields(first: 1, namespace: "dropdeck_preorder") {
                        edges {
                          node {
                            key
                            value
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`,
    {
      variables: {
        id: `gid://shopify/ProductVariant/${variantId}`
      }
    }
  );

  return json(await response.json());
}

async function handleCheckoutInteraction(body: RequestBody, admin: AdminApiContextWithoutRest) {
  const { customerId } = body;

  const response = await admin.graphql(
    `#graphql
    query getCustomerData($customerId: ID!) {
      customer(id: $customerId) {
        orders(first: 40) {
          edges {
            node {
              lineItems (first: 100) {
                edges {
                  node {
                    product {
                      id
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`,
    {
      variables: {
        id: `gid://shopify/Customer/${customerId}`
      }
    }
  );

  return json(await response.json());
}