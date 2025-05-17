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

            <BlockStack gap="500">
              <DateField
                onChange={setExpectedFulfillmentDate}
                label={t("create_selling_plan_group_modal.expected_fulfillment_date")}
              />

              <TextField
                type="number"
                autoComplete="off"
                label={t("create_selling_plan_group_modal.units_per_customer")}
                value={unitsPerCustomer}
                onChange={(newUnitsPerCustomer) => {
                  const value = parseInt(newUnitsPerCustomer);
                  if (value >= 0) {
                    setUnitsPerCustomer(newUnitsPerCustomer);
                  }
                }}
                min={0}
              />

              <TextField
                type="number"
                autoComplete="off"
                label={t(
                  "create_selling_plan_group_modal.total_units_available",
                )}
                value={totalUnitsAvailable}
                onChange={(newTotalUnitsAvailable) => {
                  const value = parseInt(newTotalUnitsAvailable);
                  if (value >= 0) {
                    setTotalUnitsAvailable(newTotalUnitsAvailable);
                  }
                }}
                min={0}
              />

              <BlockStack gap={selectedProducts.length > 0 ? "500" : "200"}>
                <BlockStack gap="200">
                  <Text as="p">
                    {selectedProducts.length > 0
                      ? t("create_selling_plan_group_modal.select_products")
                      : t("create_selling_plan_group_modal.no_selected_products")}
                  </Text>

                  {selectedProducts.length > 0 && <InlineStack gap="200" wrap={true}>
                    {selectedProducts.map((product) => (
                      <Tag
                        key={product.id}
                        onRemove={() => removeProduct(product.id)}
                      >
                        {product.title}
                      </Tag>
                    ))}
                  </InlineStack>}
                </BlockStack>

                <Box maxWidth="200px">
                  <Button
                    onClick={handleProductSelect}
                    variant="primary"
                    fullWidth={false}
                  >
                    {selectedProducts.length > 0
                      ? t(
                          "create_selling_plan_group_modal.add_or_remove_products",
                        )
                      : t("create_selling_plan_group_modal.add_products")}
                  </Button>
                </Box>
              </BlockStack>
            </BlockStack>
          </BlockStack>
        </Modal.Section>
      </Modal>
    </>
  );
}
