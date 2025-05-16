import { ActionFunctionArgs, json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function action({ request }: ActionFunctionArgs) {
  console.log('------------CALL-------------', request);
  const { admin } = await authenticate.public.appProxy(request);
  if (!admin) return new Response();

  const body = await request.json();
  const productId = body.productId;

  console.log('------------PRODUCT ID-------------', productId);

  const response = await admin.graphql(
    `#graphql
    query sellingPlanGroups($id: ID!) {
      product(id: $id) {
        id
        sellingPlanGroupsCount {
          count
        }
        sellingPlanGroups(first: 100) {
          edges {
            node {
              id
              merchantCode
              sellingPlans(first:1) {
                edges{
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
    }`,
    {
      variables: {
        id: `gid://shopify/Product/${productId}`
      }
    }
  );

  console.log('------------RESSSSPPPONNSEEE-------------', response);

  return json(await response.json());
}