import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Badge,
  Button,
  Modal
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import SellingPlanGroups from "./components/selling-plan-groups";
import { useState } from "react";
import { parseISOStringIntoFormalDate } from "shared";

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

  const createSellingPlanGroup = async () => {
    const expectedFulfillmentDate = formData.get("expectedFulfillmentDate");
    if (!expectedFulfillmentDate) return json({ error: "No expected fulfillment date provided" }, { status: 400 });
    const unitsPerCustomer = formData.get("unitsPerCustomer");
    if (!unitsPerCustomer) return json({ error: "No units per customer provided" }, { status: 400 });
    const totalUnitsAvailable = formData.get("totalUnitsAvailable");
    if (!totalUnitsAvailable) return json({ error: "No total units available provided" }, { status: 400 });
    const productId = formData.get("productId");
    if (!productId) return json({ error: "No product id provided" }, { status: 400 });

    const date = parseISOStringIntoFormalDate(expectedFulfillmentDate as string);

    const response = await admin.graphql(
      `
        #graphql
        mutation sellingPlanGroupCreate($input: SellingPlanGroupInput!, $resources: SellingPlanGroupResourceInput) {
          sellingPlanGroupCreate(input: $input, resources: $resources) {
            sellingPlanGroup {
              id
              description
              sellingPlans(first: 1) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        variables: {
          input: {
            name: "Preorder",
            description: `Expected to ship on or after ${date}, ${unitsPerCustomer} units per customer, ${totalUnitsAvailable} units available.`,
            merchantCode: "Dropdeck Preorder",
            options: ["Preorder"],
            sellingPlansToCreate: [
              {
                name: "Preorder",
                options: ["Preorder"],
                category: "PRE_ORDER",
                description: `Expected to ship on or after ${date}`,
                billingPolicy: {
                  fixed: {
                    checkoutCharge: {
                      type: "PERCENTAGE",
                      value: {
                        percentage: 100
                      }
                    },
                    remainingBalanceChargeTrigger: "NO_REMAINING_BALANCE"
                  },
                },
                deliveryPolicy: {
                  fixed: {
                    fulfillmentExactTime: expectedFulfillmentDate, // When fulfillment is expected
                    fulfillmentTrigger: "EXACT_TIME"
                  },
                },
                metafields: [
                  {
                    value: String(unitsPerCustomer),
                    type: "number_integer",
                    namespace: "dropdeck_preorder",
                    key: "units_per_customer"
                  },
                  {
                    value: String(totalUnitsAvailable),
                    type: "number_integer",
                    namespace: "dropdeck_preorder",
                    key: "total_units_available"
                  }
                ]
              }
            ]
          },
          resources: {
            productIds: [productId],
          }
        }
      }
    )
  }

  const deleteSellingPlanGroup = async () => {
    const sellingPlanGroupId = formData.get("sellingPlanGroupId");
    if (!sellingPlanGroupId) return json({ error: "No selling plan group id provided" }, { status: 400 });

    const response = await admin.graphql(
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
          id: sellingPlanGroupId,
        },
      },
    );

    const responseJson = await response.json();
    return json(responseJson);

  }

  switch (request.method) {
    case "POST":
      return createSellingPlanGroup();
    case "DELETE":
      return deleteSellingPlanGroup();
    default:
      return json({ error: "Invalid request" }, { status: 400 });
  }
};

export default function Index() {
  const { data } = useLoaderData<typeof loader>();
  const sellingPlanGroupResponse = data as SellingPlanGroupResponse;
  const navigation = useNavigation();

  // States
  const [createPlanModalOpen, setCreatePlanModalOpen] = useState(false);

  const isLoading = navigation.state === "submitting";

  const confirmCreate = () => {
    // const formData = new FormData();
    // formData.append("sellingPlanId", selectedPlanGroup.id);
    // submit(formData, { method: "DELETE" });
    // setDeleteModalOpen(false);
    // setSelectedPlanGroup(null);
  };

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
                    <Button
                      variant="primary"
                      onClick={() => setCreatePlanModalOpen(true)}
                    >
                      Create New Preorder Plan
                    </Button>

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

      {/* Create Plan Modal */}
      <Modal
        open={createPlanModalOpen}
        onClose={() => setCreatePlanModalOpen(false)}
        title="Create Preorder Plan"
        primaryAction={{
          content: "Create",
          destructive: true,
          onAction: confirmCreate,
          loading: isLoading,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setCreatePlanModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            XX Create Preorder Plan Modal Content
          </Text>
        </Modal.Section>
      </Modal>
    </Page>
  );
}
