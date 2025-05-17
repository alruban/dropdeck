import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  DataTable,
  Badge,
  Button,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

interface SellingPlan {
  name: string;
  merchantCode: string;
  deliveryDate: string;
  status: string;
}

interface SellingPlanNode {
  name: string;
  merchantCode: string;
  sellingPlans: {
    edges: Array<{
      node: {
        deliveryPolicy?: {
          fulfillmentExactTime: string;
        };
      };
    }>;
  };
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(
    `#graphql
    query {
      sellingPlanGroups(first: 50) {
        edges {
          node {
            id
            name
            merchantCode
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
    }`
  );

  const responseJson = await response.json();
  return json(responseJson);
};

export default function Index() {
  const { data } = useLoaderData<typeof loader>();
  const sellingPlans: SellingPlan[] = data.sellingPlanGroups.edges.map(({ node }: { node: SellingPlanNode }) => ({
    name: node.name,
    merchantCode: node.merchantCode,
    deliveryDate: node.sellingPlans.edges[0]?.node.deliveryPolicy?.fulfillmentExactTime || 'Not set',
    status: 'Active',
  }));

  return (
    <Page>
      <TitleBar title="Dropdeck Preorder Plans" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingMd">
                    Preorder Selling Plans
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Manage your preorder selling plans and their configurations.
                  </Text>
                </BlockStack>
                <DataTable
                  columnContentTypes={[
                    'text',
                    'text',
                    'text',
                    'text',
                    'text',
                  ]}
                  headings={[
                    'Plan Name',
                    'Merchant Code',
                    'Delivery Date',
                    'Status',
                    'Actions',
                  ]}
                  rows={sellingPlans.map((plan: SellingPlan) => [
                    plan.name,
                    plan.merchantCode,
                    plan.deliveryDate,
                    plan.status,
                    'Edit',
                  ])}
                />
              </BlockStack>
            </Card>
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
                      <Badge>{sellingPlans.length.toString()}</Badge>
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
