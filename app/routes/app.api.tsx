import { data, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import { type AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/admin/types";

type RequestBody = {
  target: 'get-customer' | 'get-customer-orders' | 'product-interaction';
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
    case 'get-customer':
      return getCustomer(body, admin);
    case 'get-customer-orders':
      return getCustomerOrders(body, admin);
    case 'product-interaction':
      return onPreorderProductInteraction(body, admin);
    default:
      return data(false, { status: 200 });
  }
}

async function onPreorderProductInteraction(body: RequestBody, admin: AdminApiContextWithoutRest) {
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

  return data(await response.json());
}

async function getCustomer(body: RequestBody, admin: AdminApiContextWithoutRest) {
  const { customerEmail } = body;

  const response = await admin.graphql(
    `#graphql
    query getCustomerId($email: String!) {
      customers (first: 1, query: $email) {
        edges {
          node {
            id
          }
        }
      }
    }`,
    {
      variables: {
        email: customerEmail
      }
    }
  );

  return data(await response.json());
}

async function getCustomerOrders(body: RequestBody, admin: AdminApiContextWithoutRest) {
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

  return data(await response.json());
}
