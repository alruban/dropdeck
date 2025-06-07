import { data, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { type AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/admin/types";

type ProductRequestBody = {
  target: 'get-preorder-data';
  customerEmail?: string;
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
    case 'get-preorder-data':
      return getPreorderData(body, admin);
    default:
      return data(
        {
          body: body,
          message: "No target found."
        },
        {
          status: 200
        },
      );
  }
}

async function getPreorderData(body: ProductRequestBody, admin: AdminApiContextWithoutRest) {
  const { variantId } = body;

  const response = await admin.graphql(
    `#graphql
    query getPreorderData($id: ID!) {
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
                appId
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

  return data(await response.json());
}
