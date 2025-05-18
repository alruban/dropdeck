import { useSubmit } from "@remix-run/react";
import {
  BlockStack,
  Divider,
  Modal,
  Text,
  TextField,
  InlineStack,
  Tag,
  Button,
  Box,
} from "@shopify/polaris";
import { useTranslation } from "../../hooks/useTranslation";
import { useState, useCallback } from "react";
import DateField from "./date-field";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getTomorrow } from "@shared/tools/date-tools";
import SellingPlanGroupForm from "./selling-plan-group-form";

interface Product {
  id: string;
  title: string;
}

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
  const shopify = useAppBridge();

  // States
  const [unitsPerCustomer, setUnitsPerCustomer] = useState("0"); // 0 means unlimited
  const [totalUnitsAvailable, setTotalUnitsAvailable] = useState("0"); // 0 means unlimited
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  const [expectedFulfillmentDate, setExpectedFulfillmentDate] = useState<Date>(getTomorrow());

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

  const handleProductSelect = useCallback(async () => {
    const selection = await shopify.resourcePicker({
      type: "product",
      multiple: true,
      filter: {
        hidden: true,
        variants: false,
        draft: true,
        archived: false,
      },
      selectionIds: selectedProducts.map((product) => ({
        id: product.id,
      })),
    });

    if (selection) {
      const newProducts = selection.map((product) => ({
        id: product.id,
        title: product.title,
      }));
      setSelectedProducts(newProducts);
    }
  }, [shopify, selectedProducts]);

  const removeProduct = useCallback(
    (productId: string) => {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== productId));
    },
    [selectedProducts],
  );

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
