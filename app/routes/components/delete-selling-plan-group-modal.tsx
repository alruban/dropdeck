import { useSubmit } from "@remix-run/react";
import {
  Modal,
  Text,
  BlockStack,
  Scrollable,
  Box,
} from "@shopify/polaris";
import { useTranslation } from "../../hooks/useTranslation";

type DeleteSellingPlanGroupModalProps = {
  selectedPlanGroup: SellingPlanGroup | null;
  setSelectedPlanGroup: (planGroup: SellingPlanGroup | null) => void;
  deletePlanModalOpen: boolean;
  setDeletePlanModalOpen: (open: boolean) => void;
  isLoading: boolean;
}

export default function DeleteSellingPlanGroupModal({
  selectedPlanGroup,
  setSelectedPlanGroup,
  deletePlanModalOpen,
  setDeletePlanModalOpen,
  isLoading,
}: DeleteSellingPlanGroupModalProps) {
  const submit = useSubmit();
  const { t } = useTranslation();

  const confirmDelete = () => {
    if (selectedPlanGroup) {
      const formData = new FormData();
      formData.append("sellingPlanGroupId", selectedPlanGroup.id);
      submit(formData, { method: "DELETE" });
      setDeletePlanModalOpen(false);
      setSelectedPlanGroup(null);
    }
  };

  return (
    <Modal
      open={deletePlanModalOpen}
      onClose={() => setDeletePlanModalOpen(false)}
      title={t("delete_selling_plan_group_modal.title")}
      primaryAction={{
        content: t("delete_selling_plan_group_modal.delete"),
        destructive: true,
        onAction: confirmDelete,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: t("delete_selling_plan_group_modal.cancel"),
          onAction: () => setDeletePlanModalOpen(false),
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="400">
          <Text as="p">
            {t("delete_selling_plan_group_modal.description")}
          </Text>
          <Box paddingBlock="100">
            <Scrollable style={{ maxHeight: "200px" }} shadow>
              <Box padding="400" borderRadius="200" borderColor="border" borderWidth="100">
                <BlockStack gap="200">
                  {selectedPlanGroup?.products.edges.map((edge) => (
                    <Text key={edge.node.id} as="p">
                      {edge.node.title}
                    </Text>
                  ))}
                </BlockStack>
              </Box>
            </Scrollable>
          </Box>
          <Text as="p">
            {t("delete_selling_plan_group_modal.warning")}
          </Text>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
