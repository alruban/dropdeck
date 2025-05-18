import { useSubmit, useNavigation } from "@remix-run/react";
import {
  BlockStack,
  Button,
  ButtonGroup,
  Card,
  DataTable,
  Divider,
  InlineStack,
  Modal,
  type TableData,
  Text,
} from "@shopify/polaris";
import { useState } from "react";
import { parseISOStringIntoFormalDate } from "shared";
import EditSellingPlanGroupModal from "./edit-selling-plan-group-modal";
import { useTranslation } from "app/hooks/useTranslation";

type SellingPlanGroupsProps = {
  sellingPlanGroupResponse: SellingPlanGroupResponse;
};

export default function SellingPlanGroupsTable({
  sellingPlanGroupResponse,
}: SellingPlanGroupsProps) {
  const submit = useSubmit();
  const navigation = useNavigation();
  const { t } = useTranslation();

  // States
  const [editPlanModalOpen, setEditPlanModalOpen] = useState(false);
  const [selectedPlanGroup, setSelectedPlanGroup] =
    useState<SellingPlanGroup | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const hasSellingPlanGroups =
    sellingPlanGroupResponse.sellingPlanGroups.edges.length > 0;
  const isLoading = navigation.state === "submitting";

  const handleEdit = (planGroup: SellingPlanGroup) => {
    setSelectedPlanGroup(planGroup);
    setEditPlanModalOpen(true);
  };

  const handleDelete = (planGroup: SellingPlanGroup) => {
    setSelectedPlanGroup(planGroup);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (selectedPlanGroup) {
      const formData = new FormData();
      formData.append("sellingPlanGroupId", selectedPlanGroup.id);
      submit(formData, { method: "DELETE" });
      setDeleteModalOpen(false);
      setSelectedPlanGroup(null);
    }
  };

  const sellingPlanGroupsTable = () => {
    const rows = sellingPlanGroupResponse.sellingPlanGroups.edges.map((edge) => {
      const sellingPlanGroup = edge.node;
      const sellingPlan = sellingPlanGroup.sellingPlans.edges[0].node;
      if (!sellingPlanGroup || !sellingPlan) return null;

      const firstAssignedProductTitle = sellingPlanGroup.products.edges[0].node.title;
      const assignedProductsTitle = sellingPlanGroup.productsCount.count > 1 ? "Multiple Products" : firstAssignedProductTitle;

      return [
        assignedProductsTitle,
        parseISOStringIntoFormalDate(
          sellingPlan.deliveryPolicy.fulfillmentExactTime,
        ),
        <InlineStack key={sellingPlanGroup.id} align="end">
          <ButtonGroup>
          <Button
              size="slim"
              onClick={() => handleEdit(sellingPlanGroup)}
            >
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
    });

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
        <Divider/>
        <Text as="p">
          {t("selling_plan_groups_table.no_selling_plan_groups_found.description")}
        </Text>

        <Button variant="primary">
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
                {t("selling_plan_groups_table.selling_plan_groups_found.refresh")}
              </Button>
            </InlineStack>
            <Text variant="bodyMd" as="p">
              {t("selling_plan_groups_table.selling_plan_groups_found.description")}
            </Text>
          </BlockStack>
          {hasSellingPlanGroups ? sellingPlanGroupsTable() : noSellingPlanGroupsFound()}
        </BlockStack>
      </Card>

      {/* Delete Plan Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Preorder Plan"
        primaryAction={{
          content: "Delete",
          destructive: true,
          onAction: confirmDelete,
          loading: isLoading,
        }}
        secondaryActions={[
          {
            content: "Cancel",
            onAction: () => setDeleteModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <Text as="p">
            Are you sure you want to delete the preorder selling plan for the
            following products:
            {selectedPlanGroup?.products.edges.join(",")}"? This action cannot
            be undone.
          </Text>
        </Modal.Section>
      </Modal>

      <EditSellingPlanGroupModal
        targetSellingPlanGroup={selectedPlanGroup}
        editPlanModalOpen={editPlanModalOpen}
        setEditPlanModalOpen={setEditPlanModalOpen}
        isLoading={isLoading}
      />
    </>
  );
}
