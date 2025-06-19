import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

type DropdeckSellingPlanGroupsResponse = {
  data: {
    sellingPlanGroups: {
      edges: {
        node: {
          id: string;
        };
      }[];
    };
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, session, topic, admin } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  // Delete all preorder selling plan groups for the shop.
  const dropdeckSellingPlanGroups = await admin?.graphql(
    `
    #graphql
    query getDropdeckSellingPlanGroups($query: String!) {
      sellingPlanGroups(first: 250, query: $query) {
        edges {
          node {
            id
          }
        }
      }
    }
    `,
    {
      variables: {
        query: "app_id:DROPDECK_PREORDER",
      }
    }
  );

  const dropdeckSellingPlanGroupsJson = await dropdeckSellingPlanGroups?.json() as DropdeckSellingPlanGroupsResponse;

  if (dropdeckSellingPlanGroupsJson && dropdeckSellingPlanGroupsJson.data) {
    for (const sellingPlanGroup of dropdeckSellingPlanGroupsJson.data.sellingPlanGroups.edges) {
      await admin?.graphql(
        `
        #graphql
        mutation sellingPlanGroupDelete($id: ID!) {
          sellingPlanGroupDelete(id: $id) {
            deletedSellingPlanGroupId
            userErrors {
              field
              message
            }
          }
        }
        `,
        {
          variables: {
            id: sellingPlanGroup.node.id,
          },
        },
      );
    }
  }

  if (session) {
    // Webhook requests can trigger multiple times and after an app has already been uninstalled.
    // If this webhook already ran, the session may have been deleted previously.

    // Delete all sessions for the shop.
    await db.session.deleteMany({ where: { shop } });
  }

  return new Response("OK", { status: 200 });
};
