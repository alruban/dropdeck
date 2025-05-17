import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
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
  Modal,
  ButtonGroup,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { useLoaderData, useSubmit, useNavigation } from "@remix-run/react";
import { useState } from "react";

const  parseISOStringIntoFormalDate = (isoString: string): string => {
  const dateObj = new Date(isoString);
  const day = dateObj.getDate();
  const month = dateObj.toLocaleString('default', { month: 'long' });
  const year = dateObj.getFullYear();

  // Add ordinal suffix to day
  const ordinal = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `${day}${ordinal(day)} ${month} ${year}`;
};

interface SellingPlan {
  id: string;
  name: string;
  merchantCode: string;
  deliveryDate: string;
  status: string;
}

interface SellingPlanNode {
  id: string;
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

  const response = await admin.graphql(`
    #graphql
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
      }
    );

    const responseJson = await response.json();
    return json(responseJson);
  }

  return json({ error: "Invalid request" }, { status: 400 });
};

export default function Index() {
  const { data } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SellingPlan | null>(null);

  const sellingPlans: SellingPlan[] = data.sellingPlanGroups.edges.map(({ node }: { node: SellingPlanNode }) => ({
    id: node.id,
    name: node.name,
    merchantCode: node.merchantCode,
    deliveryDate: node.sellingPlans.edges[0]?.node.deliveryPolicy?.fulfillmentExactTime || 'Not set',
    status: 'Active',
  }));

  const handleDelete = (plan: SellingPlan) => {
    setSelectedPlan(plan);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPlan) {
      const formData = new FormData();
      formData.append("sellingPlanId", selectedPlan.id);
      submit(formData, { method: "DELETE" });
      setDeleteModalOpen(false);
      setSelectedPlan(null);
    }
  };

  const isLoading = navigation.state === "submitting";

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
                    'Product',
                    'Merchant Code',
                    'Delivery Date',
                    'Status',
                    'Actions',
                  ]}
                  rows={sellingPlans.map((plan: SellingPlan) => [
                    plan.name,
                    plan.merchantCode,
                    parseISOStringIntoFormalDate(plan.deliveryDate),
                    plan.status,
                    <ButtonGroup key={plan.id}>
                      <Button size="slim">Edit</Button>
                      <Button
                        size="slim"
                        variant="plain"
                        tone="critical"
                        onClick={() => handleDelete(plan)}
                        disabled={isLoading}
                      >
                        Delete
                      </Button>
                    </ButtonGroup>,
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

      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Preorder Plan"
        primaryAction={{
          content: 'Delete',
          destructive: true,
          onAction: confirmDelete,
          loading: isLoading,
        }}
        secondaryActions={[
          {
            content: 'Cancel',
            onAction: () => setDeleteModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            Are you sure you want to delete the preorder plan "{selectedPlan?.name}"? This action cannot be undone.
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
