import { useSubmit, useNavigation } from "@remix-run/react";
import {
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  DataTable,
  Divider,
  InlineStack,
  type TableData,
  Text,
} from "@shopify/polaris";
import { useState } from "react";
import { parseISOStringIntoFormalDate } from "shared";
import EditSellingPlanGroupModal from "./edit-selling-plan-group-modal";
import { useTranslation } from "app/hooks/useTranslation";
import DeleteSellingPlanGroupModal from "./delete-selling-plan-group-modal";

type SellingPlanGroupsProps = {
  sellingPlanGroupResponse: SellingPlanGroupResponse;
  createPreorderPlan: () => void;
};

export default function SellingPlanGroupsTable({
  sellingPlanGroupResponse,
  createPreorderPlan,
}: SellingPlanGroupsProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const { t } = useTranslation();

  // States
  const [editPlanModalOpen, setEditPlanModalOpen] = useState(false);
  const [deletePlanModalOpen, setDeletePlanModalOpen] = useState(false);
  const [selectedPlanGroup, setSelectedPlanGroup] =
    useState<SellingPlanGroup | null>(null);

  const { sellingPlanGroups }  = sellingPlanGroupResponse.data;
  const hasSellingPlanGroups = sellingPlanGroups.edges.length > 0;
  const isLoading = navigation.state === "submitting";

  const handleEdit = (planGroup: SellingPlanGroup) => {
    setSelectedPlanGroup(planGroup);
    setEditPlanModalOpen(true);
  };

  const handleDelete = (planGroup: SellingPlanGroup) => {
    setSelectedPlanGroup(planGroup);
    setDeletePlanModalOpen(true);
  };

  const sellingPlanGroupsTable = () => {
    const rows = sellingPlanGroups.edges.map(
      (edge) => {
        const sellingPlanGroup = edge.node;
        const sellingPlan = sellingPlanGroup.sellingPlans.edges[0];
        if (!sellingPlanGroup || !sellingPlan) return null;

        let assignedProductsTitle = t(
          "selling_plan_groups_table.assigned_products_title.none",
        );
        const firstAssignedProduct = sellingPlanGroup.products.edges[0];

        if (
          firstAssignedProduct &&
          sellingPlanGroup.productsCount.count === 1
        ) {
          assignedProductsTitle = firstAssignedProduct.node.title;
        } else if (sellingPlanGroup.productsCount.count > 1) {
          assignedProductsTitle = t(
            "selling_plan_groups_table.assigned_products_title.multiple",
            {
              count: sellingPlanGroup.productsCount.count,
            },
          );
        }

        return [
          assignedProductsTitle,
          parseISOStringIntoFormalDate(
            sellingPlan.node.deliveryPolicy.fulfillmentExactTime,
          ),
          <InlineStack key={sellingPlanGroup.id} align="end">
            <ButtonGroup>
              <Button size="slim" onClick={() => handleEdit(sellingPlanGroup)}>
                {t("selling_plan_groups_table.actions.edit")}
              </Button>
              <Button
                size="slim"
                variant="plain"
                tone="critical"
                onClick={() => handleDelete(sellingPlanGroup)}
                disabled={isLoading}
              >
                {t("selling_plan_groups_table.actions.delete")}
              </Button>
            </ButtonGroup>
          </InlineStack>,
        ];
      },
    );

    return (
      <DataTable
        columnContentTypes={["text", "text", "text"]}
        headings={[
          t("selling_plan_groups_table.headings.assigned_products"),
          t("selling_plan_groups_table.headings.expected_fulfillment_date"),
          <Text as="span" key="actions" alignment="end">
            {t("selling_plan_groups_table.headings.actions")}
          </Text>,
        ]}
        stickyHeader={true}
        rows={rows as TableData[][]}
        verticalAlign="middle"
      />
    );
  };

  const noSellingPlanGroupsFound = () => {
    return (
      <BlockStack gap="500">
        <Divider />
        <Text as="p">
          {t(
            "selling_plan_groups_table.no_selling_plan_groups_found.description",
          )}
        </Text>

        <Button variant="primary" onClick={createPreorderPlan}>
          {t("selling_plan_groups_table.no_selling_plan_groups_found.create")}
        </Button>
      </BlockStack>
    );
  };

  return (
    <>
      <Card>
        <BlockStack gap="500">
          <BlockStack gap="200">
            <InlineStack align="space-between">
              <Text as="h2" variant="headingMd">
                {t("selling_plan_groups_table.selling_plan_groups_found.title")}
              </Text>
              <Button
                onClick={() => submit(null, { method: "get" })}
                loading={navigation.state === "loading"}
              >
                {t(
                  "selling_plan_groups_table.selling_plan_groups_found.refresh",
                )}
              </Button>
            </InlineStack>
            <Text variant="bodyMd" as="p">
              {t(
                "selling_plan_groups_table.selling_plan_groups_found.description",
              )}
            </Text>
          </BlockStack>
          {hasSellingPlanGroups
            ? sellingPlanGroupsTable()
            : noSellingPlanGroupsFound()}
        </BlockStack>
      </Card>

      <DeleteSellingPlanGroupModal
        selectedPlanGroup={selectedPlanGroup}
        setSelectedPlanGroup={setSelectedPlanGroup}
        deletePlanModalOpen={deletePlanModalOpen}
        setDeletePlanModalOpen={setDeletePlanModalOpen}
        isLoading={isLoading}
      />

      {selectedPlanGroup && (
        <EditSellingPlanGroupModal
          selectedPlanGroup={selectedPlanGroup}
          editPlanModalOpen={editPlanModalOpen}
          setEditPlanModalOpen={setEditPlanModalOpen}
          isLoading={isLoading}
        />
      )}
    </>
  );
}
