import { useSubmit } from "@remix-run/react";
import { BlockStack, DatePicker, Divider, Modal, Text, TextField } from "@shopify/polaris";

export default function CreateSellingPlanGroupModal({
  createPlanModalOpen,
  setCreatePlanModalOpen,
  isLoading,
}: {
  createPlanModalOpen: boolean;
  setCreatePlanModalOpen: (open: boolean) => void;
  isLoading: boolean;
}) {
  const submit = useSubmit();

  const confirmCreate = () => {
    const formData = new FormData();
    // const expectedFulfillmentDate = formData.get("expectedFulfillmentDate");
    // const unitsPerCustomer = formData.get("unitsPerCustomer");
    // const totalUnitsAvailable = formData.get("totalUnitsAvailable");
    // const productId = formData.get("productId");

    submit(formData, { method: "POST" });
    setCreatePlanModalOpen(false);
  };

  return (
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
        <BlockStack gap="500">
          <Text as="p">{i18n.translate("description")}</Text>

          <Divider />

          <BlockStack gap="500">
            <DatePicker
              label={i18n.translate("shipping_date")}
              value={releaseDate}
              onChange={(newDate) => {
                const date = String(newDate);
                setReleaseDate(date);
                validateDate(date);
              }}
              error={dateError}
            />

            <TextField
              type="number"
              autoComplete="off"
              label={i18n.translate("units_per_customer")}
              value={unitsPerCustomer}
              onChange={(newUnitsPerCustomer) => setUnitsPerCustomer(newUnitsPerCustomer)}
              min={0}
            />

            <TextField
              type="number"
              autoComplete="off"
              label={i18n.translate("total_units_available")}
              value={totalUnitsAvailable}
              onChange={(newTotalUnitsAvailable) => setTotalUnitsAvailable(newTotalUnitsAvailable)}
              min={0}
            />
          </BlockStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
