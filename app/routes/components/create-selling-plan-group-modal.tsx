import { useSubmit } from "@remix-run/react";
import { BlockStack, Divider, Modal, Text, TextField, InlineStack, Tag, Button } from "@shopify/polaris";
import { useTranslation } from "../../hooks/useTranslation";
import { useState, useCallback } from "react";
import DateField from "./date-field";
import { useAppBridge } from "@shopify/app-bridge-react";

interface Product {
  id: string;
  title: string;
  images: { url: string }[];
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

  const confirmCreate = () => {
    const formData = new FormData();
    formData.set("expectedFulfillmentDate", new Date().toISOString());
    formData.set("unitsPerCustomer", unitsPerCustomer);
    formData.set("totalUnitsAvailable", totalUnitsAvailable);
    formData.set("productIds", JSON.stringify(selectedProducts.map(p => p.id)));

    submit(formData, { method: "POST" });
    setCreatePlanModalOpen(false);
  };

  const handleProductSelect = useCallback(async () => {
    try {
      const selection = await shopify.resourcePicker({
        type: 'product',
        multiple: true
      });

      if (selection) {
        const newProducts = selection.map(product => ({
          id: product.id,
          title: product.title,
          images: [] // ResourcePicker doesn't provide images in the selection
        }));
        setSelectedProducts(newProducts);
      }
    } catch (error) {
      console.error('Error selecting products:', error);
    }
  }, [shopify]);

  const removeProduct = useCallback((productId: string) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  }, [selectedProducts]);

  return (
    <>
      <Modal
        open={createPlanModalOpen}
        onClose={() => setCreatePlanModalOpen(false)}
        title={t("create_plan.title")}
        primaryAction={{
          content: t("create_plan.create"),
          destructive: true,
          onAction: confirmCreate,
          loading: isLoading,
          disabled: selectedProducts.length === 0,
        }}
        secondaryActions={[
          {
            content: t("create_plan.cancel"),
            onAction: () => setCreatePlanModalOpen(false),
          },
        ]}
      >
        <Modal.Section>
          <BlockStack gap="500">
            <Text as="p">{t("create_plan.description")}</Text>

            <Divider />

            <BlockStack gap="500">
              <DateField />

              <BlockStack gap="200">
                <Text as="h3" variant="headingMd">Selected Products</Text>
                <InlineStack gap="200" wrap={false}>
                  {selectedProducts.map((product) => (
                    <Tag
                      key={product.id}
                      onRemove={() => removeProduct(product.id)}
                    >
                      {product.title}
                    </Tag>
                  ))}
                </InlineStack>
                <Button onClick={handleProductSelect}>
                  Add Products
                </Button>
              </BlockStack>

              <TextField
                type="number"
                autoComplete="off"
                label={t("create_plan.units_per_customer")}
                value={unitsPerCustomer.toString()}
                onChange={(newUnitsPerCustomer) => setUnitsPerCustomer(newUnitsPerCustomer)}
                min={0}
              />

              <TextField
                type="number"
                autoComplete="off"
                label={t("create_plan.total_units_available")}
                value={totalUnitsAvailable.toString()}
                onChange={(newTotalUnitsAvailable) => setTotalUnitsAvailable(newTotalUnitsAvailable)}
                min={0}
              />
            </BlockStack>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
