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
import { useLoaderData, useNavigation } from "@remix-run/react";
import SellingPlanGroupsTable from "./components/selling-plan-groups-table";
import { useState } from "react";
import { CREATE_SP_GROUP_MUTATION, createSPGroupVariables } from "@shared/mutations/create-sp-group";
import { DELETE_SP_GROUP_MUTATION, deleteSPGroupVariables } from "@shared/mutations/delete-sp-group";
import { GET_SP_GROUPS_QUERY } from "@shared/queries/get-sp-groups";
import CreateSellingPlanGroupModal from "./components/create-selling-plan-group-modal";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(GET_SP_GROUPS_QUERY);

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
    const productIds = formData.get("productIds");
    if (!productIds) return json({ error: "No product id(s) provided" }, { status: 400 });

    const response = await admin.graphql(
      CREATE_SP_GROUP_MUTATION,
      {
        variables: createSPGroupVariables(String(productIds).split(","), String(expectedFulfillmentDate), Number(unitsPerCustomer), Number(totalUnitsAvailable)),
      }
    )

    const responseJson = await response.json();
    console.log(responseJson)
    return json(responseJson);
  }

  const deleteSellingPlanGroup = async () => {
    const sellingPlanGroupId = formData.get("sellingPlanGroupId");
    if (!sellingPlanGroupId) return json({ error: "No selling plan group id provided" }, { status: 400 });

    const response = await admin.graphql(
      DELETE_SP_GROUP_MUTATION,
      {
        variables: deleteSPGroupVariables(String(sellingPlanGroupId)),
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

  return (
    <Page>
      <TitleBar title="Dropdeck" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <SellingPlanGroupsTable sellingPlanGroupResponse={sellingPlanGroupResponse} />
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

      <CreateSellingPlanGroupModal
        createPlanModalOpen={createPlanModalOpen}
        setCreatePlanModalOpen={setCreatePlanModalOpen}
        isLoading={isLoading}
      />
    </Page>
  );
}
