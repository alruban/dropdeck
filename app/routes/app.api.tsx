import { type ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  console.log('------------CALL-------------', request);
  const { admin } = await authenticate.public.appProxy(request);
  if (!admin) return new Response();

  const body = await request.json();
  const variantId = body.variantId;

  console.log('------------PRODUCT ID-------------', variantId);

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
                      metafields(first: 2, namespace: "dropdeck_preorder") {
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

  console.log('------------RESSSSPPPONNSEEE-------------', response);

  return json(await response.json());
}