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

type EditSellingPlanGroupModalProps = {
  targetSellingPlanGroup: SellingPlanGroup | null;
  editPlanModalOpen: boolean;
  setEditPlanModalOpen: (open: boolean) => void;
  isLoading: boolean;
}

interface Product {
  id: string;
  title: string;
}

export default function EditSellingPlanGroupModal({
  targetSellingPlanGroup,
  editPlanModalOpen,
  setEditPlanModalOpen,
  isLoading,
}: EditSellingPlanGroupModalProps) {
  const submit = useSubmit();
  const { t } = useTranslation();

  const initialExpectedFulfillmentDate = targetSellingPlanGroup?.sellingPlans.edges[0].node.deliveryPolicy.fulfillmentExactTime ? new Date(targetSellingPlanGroup.sellingPlans.edges[0].node.deliveryPolicy.fulfillmentExactTime) : getTomorrow();
  const initialUnitsPerCustomer = targetSellingPlanGroup?.sellingPlans.edges[0].node.metafields.edges.find(metafield => metafield.node.key === "units_per_customer")?.node.value || "0";
  const initialTotalUnitsAvailable = targetSellingPlanGroup?.sellingPlans.edges[0].node.metafields.edges.find(metafield => metafield.node.key === "total_units_available")?.node.value || "0";
  const initialSelectedProducts = targetSellingPlanGroup?.products.edges.map(edge => ({
    id: edge.node.id,
    title: edge.node.title
  })) || [];

  // States
  const [expectedFulfillmentDate, setExpectedFulfillmentDate] = useState<Date>(initialExpectedFulfillmentDate);
  const [unitsPerCustomer, setUnitsPerCustomer] = useState(initialUnitsPerCustomer); // 0 means unlimited
  const [totalUnitsAvailable, setTotalUnitsAvailable] = useState(initialTotalUnitsAvailable); // 0 means unlimited
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(initialSelectedProducts);

  const confirmEdit = () => {
    const formData = new FormData();
    formData.set("expectedFulfillmentDate", expectedFulfillmentDate?.toISOString());
    formData.set("unitsPerCustomer", unitsPerCustomer);
    formData.set("totalUnitsAvailable", totalUnitsAvailable);
    formData.set(
      "productIds",
      selectedProducts.map((p) => p.id).join(",")
    );

    submit(formData, { method: "POST" });
    setEditPlanModalOpen(false);
  };

  return (
    <>
      <Modal
        open={editPlanModalOpen}
        onClose={() => setEditPlanModalOpen(false)}
        title={t("edit_selling_plan_group_modal.title")}
        primaryAction={{
          content: t("edit_selling_plan_group_modal.edit"),
          destructive: true,
          onAction: confirmEdit,
          loading: isLoading,
          disabled: selectedProducts.length === 0,
        }}
        secondaryActions={[
          {
            content: t("edit_selling_plan_group_modal.cancel"),
            onAction: () => setEditPlanModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="500">
            <Text as="p">
              {t("edit_selling_plan_group_modal.description")}
            </Text>

            <Divider />

            <SellingPlanGroupForm
              onUnitsPerCustomerChange={setUnitsPerCustomer}
              onTotalUnitsAvailableChange={setTotalUnitsAvailable}
              onSelectedProductsChange={setSelectedProducts}
              onExpectedFulfillmentDateChange={setExpectedFulfillmentDate}
              initialUnitsPerCustomer={initialUnitsPerCustomer}
              initialTotalUnitsAvailable={initialTotalUnitsAvailable}
              initialSelectedProducts={initialSelectedProducts}
              initialExpectedFulfillmentDate={initialExpectedFulfillmentDate}
            />
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
