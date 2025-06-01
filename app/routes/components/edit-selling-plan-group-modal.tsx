import { useSubmit } from "@remix-run/react";
import {
  BlockStack,
  Divider,
  Modal,
  Text
} from "@shopify/polaris";
import { useTranslation } from "../../hooks/useTranslation";
import { useState } from "react";
import { getTomorrow, parseISOStringIntoFormalDate } from "@shared/tools/date-tools";
import SellingPlanGroupForm from "./selling-plan-group-form";

type EditSellingPlanGroupModalProps = {
  selectedPlanGroup: SellingPlanGroup;
  editPlanModalOpen: boolean;
  setEditPlanModalOpen: (open: boolean) => void;
  isLoading: boolean;
}

export default function EditSellingPlanGroupModal({
  selectedPlanGroup,
  editPlanModalOpen,
  setEditPlanModalOpen,
  isLoading,
}: EditSellingPlanGroupModalProps) {
  const submit = useSubmit();
  const { t } = useTranslation();

  const initialExpectedFulfillmentDate = selectedPlanGroup.sellingPlans.edges[0].node.deliveryPolicy.fulfillmentExactTime ? new Date(selectedPlanGroup.sellingPlans.edges[0].node.deliveryPolicy.fulfillmentExactTime) : getTomorrow();
  const initialUnitsPerCustomer = Number(selectedPlanGroup.sellingPlans.edges[0].node.metafields.edges.find(metafield => metafield.node.key === "units_per_customer")?.node.value || "0");
  const initialSelectedProducts = selectedPlanGroup.products.edges.map(edge => ({
    id: edge.node.id,
    title: edge.node.title
  })) || [];

  // States
  const [expectedFulfillmentDate, setExpectedFulfillmentDate] = useState<Date>(initialExpectedFulfillmentDate);
  const [unitsPerCustomer, setUnitsPerCustomer] = useState(initialUnitsPerCustomer);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(initialSelectedProducts);

  const confirmEdit = () => {
    const formData = new FormData();
    formData.set("sellingPlanGroupId", String(selectedPlanGroup.id));
    formData.set("sellingPlanId", String(selectedPlanGroup.sellingPlans.edges[0].node.id));
    formData.set("expectedFulfillmentDate", expectedFulfillmentDate?.toISOString());
    formData.set("unitsPerCustomer", String(unitsPerCustomer));
    formData.set(
      "originalProductIds",
      initialSelectedProducts.map((p) => p.id).join(",")
    );
    formData.set(
      "newProductIds",
      selectedProducts.map((p) => p.id).join(",")
    );

    const descriptionForPlanWithNoUnitRestriction = t("sp_group.description_for_plan_with_no_unit_restriction", {
      date: parseISOStringIntoFormalDate(expectedFulfillmentDate?.toISOString())
    });

    const descriptionForPlanWithUnitRestriction = t("sp_group.description_for_plan_with_unit_restriction", {
      date: parseISOStringIntoFormalDate(expectedFulfillmentDate?.toISOString()),
      units: unitsPerCustomer
    });

    formData.set("descriptionForPlanWithNoUnitRestriction", descriptionForPlanWithNoUnitRestriction);
    formData.set("descriptionForPlanWithUnitRestriction", descriptionForPlanWithUnitRestriction);

    submit(formData, { method: "PATCH" });
    setEditPlanModalOpen(false);
  };

  return (
    <Modal
      open={editPlanModalOpen}
      onClose={() => setEditPlanModalOpen(false)}
      title={t("edit_selling_plan_group_modal.title")}
      primaryAction={{
        content: t("edit_selling_plan_group_modal.edit"),
        destructive: false,
        onAction: confirmEdit,
        loading: isLoading,
        disabled: selectedProducts.length === 0
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
            onSelectedProductsChange={setSelectedProducts}
            onExpectedFulfillmentDateChange={setExpectedFulfillmentDate}
            initialUnitsPerCustomer={initialUnitsPerCustomer}
            initialSelectedProducts={initialSelectedProducts}
            initialExpectedFulfillmentDate={initialExpectedFulfillmentDate}
          />
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
