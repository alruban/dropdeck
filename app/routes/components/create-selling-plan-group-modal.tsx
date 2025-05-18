import { useSubmit } from "@remix-run/react";
import {
  BlockStack,
  Divider,
  Modal,
  Text
} from "@shopify/polaris";
import { useTranslation } from "../../hooks/useTranslation";
import { useState } from "react";
import { getTomorrow } from "@shared/tools/date-tools";
import SellingPlanGroupForm from "./selling-plan-group-form";

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
  const { t } = useTranslation();

  // States
  const [expectedFulfillmentDate, setExpectedFulfillmentDate] = useState<Date>(getTomorrow());
  const [unitsPerCustomer, setUnitsPerCustomer] = useState("0"); // 0 means unlimited
  const [totalUnitsAvailable, setTotalUnitsAvailable] = useState("0"); // 0 means unlimited
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const confirmCreate = () => {
    const formData = new FormData();
    formData.set("expectedFulfillmentDate", expectedFulfillmentDate?.toISOString());
    formData.set("unitsPerCustomer", unitsPerCustomer);
    formData.set("totalUnitsAvailable", totalUnitsAvailable);
    formData.set(
      "productIds",
      selectedProducts.map((p) => p.id).join(",")
    );

    submit(formData, { method: "POST" });
    setCreatePlanModalOpen(false);
  };

  return (
    <>
      <Modal
        open={createPlanModalOpen}
        onClose={() => setCreatePlanModalOpen(false)}
        title={t("create_selling_plan_group_modal.title")}
        primaryAction={{
          content: t("create_selling_plan_group_modal.create"),
          destructive: true,
          onAction: confirmCreate,
          loading: isLoading,
          disabled: selectedProducts.length === 0,
        }}
        secondaryActions={[
          {
            content: t("create_selling_plan_group_modal.cancel"),
            onAction: () => setCreatePlanModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="500">
            <Text as="p">
              {t("create_selling_plan_group_modal.description")}
            </Text>

            <Divider />

            <SellingPlanGroupForm
              onUnitsPerCustomerChange={setUnitsPerCustomer}
              onTotalUnitsAvailableChange={setTotalUnitsAvailable}
              onSelectedProductsChange={setSelectedProducts}
              onExpectedFulfillmentDateChange={setExpectedFulfillmentDate}
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
