import { data, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate, unauthenticated } from "../shopify.server";
import { type AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/admin/types";

export type SellingPlanGroupEdge = {
  node: {
    appId: string;
    sellingPlans: {
      nodes: [
        {
          deliveryPolicy: {
            fulfillmentExactTime: string;
          };
          metafields: {
            edges: [
              {
                node: {
                  key: string;
                  value: string;
                };
              },
            ];
          };
        },
      ];
    };
  };
};

export type GetPreorderDataResponse = {
  data: {
    data: {
      product: {
        sellingPlanGroups: {
          edges: SellingPlanGroupEdge[];
        };
      };
    };
  };
  init: ResponseInit | null;
  type: string;
};

export type CustomerOrderLineItem = {
  node: {
    id: string;
    title: string;
    quantity: number;
    sellingPlan: {
      name: string;
      sellingPlanId: string;
    };
    product: {
      id: string;
      sellingPlanGroups: {
        edges: SellingPlanGroupEdge[];
      };
    };
  };
};

export type CustomerOrder = {
  node: {
    lineItems: {
      edges: CustomerOrderLineItem[];
    };
  };
};

export type GetCustomerOrdersResponse = {
  data: {
    data: {
      customer: {
        orders: {
          edges: CustomerOrder[];
        };
      };
    };
  };
  init: ResponseInit | null;
  type: string;
};

export type GetCustomerResponse = {
  data: {
    data: {
      customers: {
        edges: {
          node: {
            id: string;
          };
        }[];
      };
    };
  };
  init: ResponseInit | null;
  type: string;
};

type CheckoutRequestBody = {
  target: "get-customer" | "get-customer-orders" | "get-preorder-data";
  customerEmail?: string;
  customerId?: string;
  productId?: string;
};

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { target } = body;

  // Authenticate Checkout Request
  const { sessionToken } = await authenticate.public.checkout(request);
  const { admin } = await unauthenticated.admin(sessionToken.dest);

  switch (target) {
    case "get-preorder-data":
      return getPreorderData(body, admin);
    case "get-customer":
      return getCustomer(body, admin);
    case "get-customer-orders":
      return getCustomerOrders(body, admin);
    default:
      return data(
        {
          body: body,
          message: "No target found.",
        },
        {
          status: 200,
        },
      );
  }
}

async function getCustomer(
  body: CheckoutRequestBody,
  admin: AdminApiContextWithoutRest,
) {
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
        email: customerEmail,
      },
    },
  );

  return data(await response.json()) as GetCustomerResponse;
}

async function getCustomerOrders(
  body: CheckoutRequestBody,
  admin: AdminApiContextWithoutRest,
) {
  const { customerId } = body;

  const response = await admin.graphql(
    `#graphql
    query getCustomerOrders($customerId: ID!, $query: String!) {
      customer(id: $customerId) {
        orders(first: 50, query: $query) {
          edges {
            node {
              lineItems (first: 30) {
                edges {
                  node {
                    quantity
                    product {
                      sellingPlanGroups(first: 3) {
                        edges {
                          node {
                            appId
                            sellingPlans(first: 1) {
                              nodes {
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
              }
            }
          }
        }
      }
    }`,
    {
      variables: {
        customerId,
        query: 'tag:"Dropdeck Preorder"',
      },
    },
  );

  return data(await response.json()) as GetCustomerOrdersResponse;
}

async function getPreorderData(
  body: CheckoutRequestBody,
  admin: AdminApiContextWithoutRest,
) {
  const { productId } = body;

  const response = await admin.graphql(
    `#graphql
    query GetPreorderData($productId: ID!) {
      product(id: $productId) {
        sellingPlanGroups(first: 3) {
          edges {
            node {
              appId
              sellingPlans(first: 1) {
                nodes {
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
    }`,
    {
      variables: {
        productId,
      },
    },
  );

  return data(await response.json()) as GetCustomerOrdersResponse;
}
