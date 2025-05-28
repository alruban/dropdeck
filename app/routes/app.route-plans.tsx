import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  Page,
  Layout,
  BlockStack
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { data } from "@remix-run/node";
import { useLoaderData, useNavigation } from "@remix-run/react";
import SellingPlanGroupsTable from "./components/selling-plan-groups-table";
import { useState } from "react";
import { CREATE_SP_GROUP_MUTATION, createSPGroupVariables } from "@shared/mutations/create-sp-group";
import { DELETE_SP_GROUP_MUTATION, deleteSPGroupVariables } from "@shared/mutations/delete-sp-group";
import { GET_SP_GROUPS_QUERY } from "@shared/queries/get-sp-groups";
import CreateSellingPlanGroupModal from "./components/create-selling-plan-group-modal";
import QuickActions from "./components/quick-actions";
import Statistics from "./components/statistics";
import { UPDATE_SP_GROUP_MUTATION, updateSPGroupVariables } from "@shared/mutations/update-sp-group";
import { ADD_SP_GROUP_PRODUCTS_MUTATION, addSPGroupProductsVariables } from "@shared/mutations/add-sp-group-products";
import { REMOVE_SP_GROUP_PRODUCTS_MUTATION, removeSPGroupProductsVariables } from "@shared/mutations/remove-sp-group-products";
import { useTranslation } from "../hooks/useTranslation";
import { UPDATE_PRODUCT_SP_REQUIREMENT_MUTATION, updateProductSPRequirementVariables } from "@shared/mutations/update-product-sp-requirement";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(GET_SP_GROUPS_QUERY);
  return data(await response.json());
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();

  const createSellingPlanGroup = async () => {
    const expectedFulfillmentDate = formData.get("expectedFulfillmentDate");
    if (!expectedFulfillmentDate) return data({ error: "No expected fulfillment date provided" }, { status: 400 });
    const unitsPerCustomer = formData.get("unitsPerCustomer");
    if (!unitsPerCustomer) return data({ error: "No units per customer provided" }, { status: 400 });
    const productIds = formData.get("productIds");
    if (!productIds) return data({ error: "No product id(s) provided" }, { status: 400 });

    const productIdsArray = String(productIds).split(",");
    const promises = [];

    promises.push(admin.graphql(
      CREATE_SP_GROUP_MUTATION,
      createSPGroupVariables(
        String(productIds).split(","),
        String(expectedFulfillmentDate),
        Number(unitsPerCustomer)
      )
    ));

    for (const productId of productIdsArray) {
      promises.push(admin.graphql(
        UPDATE_PRODUCT_SP_REQUIREMENT_MUTATION,
        updateProductSPRequirementVariables(
          productId,
          true
        )
      ));
    }

    const responses = await Promise.all(promises);

    // Parse and check each response
    const parsedResponses = await Promise.all(responses.map(async (response, index) => {
      const json = await response.json();

      if (index === 0) {
        // First response is the selling plan group creation
        if (json.data.sellingPlanGroupCreate.userErrors.length > 0) {
          const errors = json.data.sellingPlanGroupCreate.userErrors.map((error: any) => error.message).join(", ");
          return { error: errors };
        }
      } else {
        // Other responses are product updates
        if (json.data.productUpdate.userErrors.length > 0) {
          const errors = json.data.productUpdate.userErrors.map((error: any) => error.message).join(", ");
          return { error: `Product ${productIdsArray[index - 1]}: ${errors}` };
        }
      }
      return json;
    }));

    // Check if any responses had errors
    const errors = parsedResponses
      .filter((r): r is { error: string } => 'error' in r)
      .map(r => r.error);
    if (errors.length > 0) {
      return data({ error: errors.join(", ") }, { status: 400 });
    }

    return data(parsedResponses);
  }

  const updateSellingPlanGroup = async () => {
    const sellingPlanGroupId = formData.get("sellingPlanGroupId");
    const sellingPlanId = formData.get("sellingPlanId");
    const expectedFulfillmentDate = formData.get("expectedFulfillmentDate");
    const unitsPerCustomer = formData.get("unitsPerCustomer");
    const originalProductIds = formData.get("originalProductIds");
    const newProductIds = formData.get("newProductIds");

    // Convert string arrays to actual arrays
    const originalProducts = String(originalProductIds).split(",").filter(id => id !== "");
    const newProducts = String(newProductIds).split(",").filter(id => id !== "");

    // Create Sets for efficient comparison
    const originalSet = new Set(originalProducts);
    const newSet = new Set(newProducts);

    // Products to add: in newSet but not in originalSet
    const productsToAdd = newProducts.filter(id => !originalSet.has(id));

    // Products to remove: in originalSet but not in newSet
    const productsToRemove = originalProducts.filter(id => !newSet.has(id));

    // First update the selling plan details
    const updateDetailsResponse = await admin.graphql(
      UPDATE_SP_GROUP_MUTATION,
      updateSPGroupVariables(
        String(sellingPlanGroupId),
        String(sellingPlanId),
        String(expectedFulfillmentDate),
        Number(unitsPerCustomer)
      )
    );

    // Then handle product changes if any
    const productUpdatePromises = [];

    if (productsToAdd.length > 0) {
      productUpdatePromises.push(
        admin.graphql(
          ADD_SP_GROUP_PRODUCTS_MUTATION,
          addSPGroupProductsVariables(
            String(sellingPlanGroupId),
            productsToAdd
          )
        )
      );

      // Set the selling plan requirement to true for the products to be added.
      for (const productId of productsToAdd) {
        productUpdatePromises.push(
          admin.graphql(
            UPDATE_PRODUCT_SP_REQUIREMENT_MUTATION,
            updateProductSPRequirementVariables(productId, true)
          )
        );
      }
    }

    if (productsToRemove.length > 0) {
      productUpdatePromises.push(
        admin.graphql(
          REMOVE_SP_GROUP_PRODUCTS_MUTATION,
          removeSPGroupProductsVariables(
            String(sellingPlanGroupId),
            productsToRemove
          )
        )
      );

      // Set the selling plan requirement to false for the products to be removed.
      for (const productId of productsToRemove) {
        productUpdatePromises.push(
          admin.graphql(
            UPDATE_PRODUCT_SP_REQUIREMENT_MUTATION,
            updateProductSPRequirementVariables(productId, false)
          )
        );
      }
    }

    // Wait for all updates to complete
    const [detailsResult, ...productResults] = await Promise.all([
      updateDetailsResponse,
      ...productUpdatePromises
    ]);

    return data({
      details: await detailsResult.json(),
      productUpdates: await Promise.all(productResults.map(r => r.json()))
    });
  }

  const deleteSellingPlanGroup = async () => {
    const sellingPlanGroupId = formData.get("sellingPlanGroupId");
    const productIds = formData.get("productIds");

    const productIdsArray = String(productIds).split(",");
    const promises = [];

    promises.push(admin.graphql(
      DELETE_SP_GROUP_MUTATION,
      deleteSPGroupVariables(String(sellingPlanGroupId))
    ));

    for (const productId of productIdsArray) {
      promises.push(admin.graphql(
        UPDATE_PRODUCT_SP_REQUIREMENT_MUTATION,
        updateProductSPRequirementVariables(
          productId,
          false
        )
      ));
    }

    const responses = await Promise.all(promises);

    // Parse and check each response
    const parsedResponses = await Promise.all(responses.map(async (response, index) => {
      const json = await response.json();

      if (index === 0) {
        // First response is the selling plan group deletion
        if (json.data.sellingPlanGroupDelete.userErrors.length > 0) {
          const errors = json.data.sellingPlanGroupDelete.userErrors.map((error: any) => error.message).join(", ");
          return { error: errors };
        }
      } else {
        // Other responses are product updates
        if (json.data.productUpdate.userErrors.length > 0) {
          const errors = json.data.productUpdate.userErrors.map((error: any) => error.message).join(", ");
          return { error: `Product ${productIdsArray[index - 1]}: ${errors}` };
        }
      }
      return json;
    }));

    // Check if any responses had errors
    const errors = parsedResponses
      .filter((r): r is { error: string } => 'error' in r)
      .map(r => r.error);
    if (errors.length > 0) {
      return data({ error: errors.join(", ") }, { status: 400 });
    }

    return data(parsedResponses);
  }

  switch (request.method) {
    case "POST":
      return createSellingPlanGroup();
    case "PATCH":
      return updateSellingPlanGroup();
    case "DELETE":
      return deleteSellingPlanGroup();
    default:
      return data({ error: "Invalid request" }, { status: 400 });
  }
};

export default function Index() {
  const { data } = useLoaderData<typeof loader>();
  const sellingPlanGroupResponse = data as SellingPlanGroupResponse;
  const navigation = useNavigation();
  const { t } = useTranslation();

  // States
  const [createPlanModalOpen, setCreatePlanModalOpen] = useState(false);

  const isLoading = navigation.state === "submitting";

  return (
    <Page>
      <TitleBar title={t("plans.title")} />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <SellingPlanGroupsTable
              sellingPlanGroupResponse={sellingPlanGroupResponse}
              createPreorderPlan={() => setCreatePlanModalOpen(true)}
            />
          </Layout.Section>
          <Layout.Section variant="oneThird">
            <BlockStack gap="500">
              <QuickActions onCreatePreorderPlanClick={() => setCreatePlanModalOpen(true)} />
              <Statistics sellingPlanGroupResponse={sellingPlanGroupResponse} />
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
