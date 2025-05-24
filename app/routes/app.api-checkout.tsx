import { data, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate, unauthenticated } from "../shopify.server";
import { type AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/admin/types";

type CheckoutRequestBody = {
  target: "get-customer" | "get-customer-orders"
  customerEmail?: string;
  customerId?: string;
  variantId?: string;
};

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { target } = body;

  // Authenticate Checkout Request
  const { sessionToken } = await authenticate.public.checkout(request);
  const { admin } = await unauthenticated.admin(sessionToken.dest);

  switch (target) {
    case "get-customer":
      return getCustomer(body, admin);
    case "get-customer-orders":
      return getCustomerOrders(body, admin);
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

  return data(await response.json());
}

async function getCustomerOrders(
  body: CheckoutRequestBody,
  admin: AdminApiContextWithoutRest,
) {
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
        id: customerId,
      },
    },
  );

  return data(await response.json());
}
