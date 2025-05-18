import { useSubmit } from "@remix-run/react";
import {
  Modal,
  Text
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
          onAction: () => setDeletePlanModalOpen(false),
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
  );
}
