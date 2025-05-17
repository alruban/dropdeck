import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Badge,
  Button
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import SellingPlanGroups from "./components/selling-plan-groups";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(`
    #graphql
    query {
      sellingPlanGroups(first: 50) {
        edges {
          node {
            id
            name
            merchantCode
            products(first: 1) {
              edges {
                node {
                  title
                }
              }
            }
            sellingPlans(first: 10) {
              edges {
                node {
                  id
                  name
                  options
                  deliveryPolicy {
                    ... on SellingPlanFixedDeliveryPolicy {
                      fulfillmentExactTime
                    }
                  }
                  metafields(first: 10, namespace: "dropdeck_preorder") {
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
  `);

  const responseJson = await response.json();
  return json(responseJson);
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const sellingPlanId = formData.get("sellingPlanId");

  if (request.method === "DELETE" && sellingPlanId) {
    const response = await admin.graphql(
      `#graphql
      mutation sellingPlanGroupDelete($id: ID!) {
        sellingPlanGroupDelete(id: $id) {
          deletedSellingPlanGroupId
          userErrors {
            field
            message
          }
        }
      }`,
      {
        variables: {
          id: sellingPlanId,
        },
      },
    );

    const responseJson = await response.json();
    return json(responseJson);
  }

  return json({ error: "Invalid request" }, { status: 400 });
};

export default function Index() {
  const { data } = useLoaderData<typeof loader>();
  const sellingPlanGroupResponse = data as SellingPlanGroupResponse;

  return (
    <Page>
      <TitleBar title="Dropdeck" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <SellingPlanGroups sellingPlanGroupResponse={sellingPlanGroupResponse} />
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Quick Actions
                  </Text>
                  <BlockStack gap="200">
                    <Button variant="primary">Create New Preorder Plan</Button>
                    <Button>View All Products</Button>
                  </BlockStack>
                </BlockStack>
              </Card>
              <Card>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Statistics
                  </Text>
                  <BlockStack gap="200">
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Active Plans
                      </Text>
                      <Badge>{sellingPlanGroupResponse.sellingPlanGroups.edges.length.toString()}</Badge>
                    </InlineStack>
                    <InlineStack align="space-between">
                      <Text as="span" variant="bodyMd">
                        Products with Preorders
                      </Text>
                      <Badge>12</Badge>
                    </InlineStack>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
