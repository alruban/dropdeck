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
  Text,
} from "@shopify/polaris";
import { useState } from "react";
import { parseISOStringIntoFormalDate } from "shared";
import EditSellingPlanGroupModal from "./edit-selling-plan-group-modal";

type SellingPlanGroupsProps = {
  sellingPlanGroupResponse: SellingPlanGroupResponse;
};

export default function SellingPlanGroupsTable({
  sellingPlanGroupResponse,
}: SellingPlanGroupsProps) {
  const submit = useSubmit();
  const navigation = useNavigation();

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
              Edit
            </Button>
            <Button
              size="slim"
              variant="plain"
              tone="critical"
              onClick={() => handleDelete(sellingPlanGroup)}
              disabled={isLoading}
            >
              Delete
            </Button>
          </ButtonGroup>
        </InlineStack>,
      ];
    });

    return (
      <DataTable
        columnContentTypes={["text", "text", "text"]}
        headings={[
          "Assigned Product(s)",
          "Release Date",
          <Text as="span" key="actions" alignment="end">
            Actions
          </Text>,
        ]}
        stickyHeader={true}
        rows={rows}
        verticalAlign="middle"
      />
    );
  };

  const noSellingPlanGroupsFound = () => {
    return (
      <BlockStack gap="500">
        <Divider/>
        <Text as="p">
          It looks like you don't have any preorder selling plans configured. To configure a preorder selling plan, click the button below.
        </Text>

        <Button variant="primary">Create New Preorder Plan</Button>
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
                Preorder Plans
              </Text>
              <Button
                onClick={() => submit(null, { method: "get" })}
                loading={navigation.state === "loading"}
              >
                Refresh
              </Button>
            </InlineStack>
            <Text variant="bodyMd" as="p">
              Manage your preorder selling plans and their configurations.
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
