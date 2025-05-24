import { data, json, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate, unauthenticated } from "../shopify.server";
import { type AdminApiContextWithoutRest } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/clients/admin/types";
import { EnsureCORSFunction } from "node_modules/@shopify/shopify-app-remix/dist/ts/server/authenticate/helpers/ensure-cors-headers";

type RequestBody = {
  target: "get-customer" | "get-customer-orders" | "product-interaction";
  customerEmail?: string;
  customerId?: string;
  variantId?: string;
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept, Authorization",
  "Access-Control-Allow-Credentials": "true",
};

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.json();
  const { target } = body;

  // Authenticate Checkout Request
  const { sessionToken, cors } = await authenticate.public.checkout(request);
  const { admin } = await unauthenticated.admin(sessionToken.dest);

  switch (target) {
    case "get-customer":
      console.log("GET CUSTOMER RUNNING....");
      return getCustomer(body, admin);
    case "get-customer-orders":
      console.log("GET CUSTOMER ORDERS RUNNING....");
      return getCustomerOrders(body, admin);
    default:
      console.log("DEFAULT RUNNING....");
      return cors(
        data(
          {
            body: body,
            sessionToken: sessionToken.dest,
          },
          {
            status: 200,
            headers: corsHeaders,
          },
        ),
      );
  }
}

async function getCustomer(
  body: RequestBody,
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

  const responseData = await response.json();
  return data(responseData);
}

async function getCustomerOrders(
  body: RequestBody,
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
        id: `gid://shopify/Customer/${customerId}`,
      },
    },
  );

  const responseData = await response.json();
  return data(responseData);
}
