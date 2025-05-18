import {
  BlockStack,
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

interface SellingPlanGroupFormProps {
  onUnitsPerCustomerChange: (value: string) => void;
  onTotalUnitsAvailableChange: (value: string) => void;
  onSelectedProductsChange: (products: Product[]) => void;
  onExpectedFulfillmentDateChange: (date: Date) => void;
  initialUnitsPerCustomer?: string;
  initialTotalUnitsAvailable?: string;
  initialSelectedProducts?: Product[];
  initialExpectedFulfillmentDate?: Date;
}

export default function SellingPlanGroupForm({
  onUnitsPerCustomerChange,
  onTotalUnitsAvailableChange,
  onSelectedProductsChange,
  onExpectedFulfillmentDateChange,
  initialUnitsPerCustomer = "0",
  initialTotalUnitsAvailable = "0",
  initialSelectedProducts = [],
  initialExpectedFulfillmentDate = getTomorrow(),
}: SellingPlanGroupFormProps) {
  const { t } = useTranslation();
  const shopify = useAppBridge();

  // States
  const [unitsPerCustomer, setUnitsPerCustomer] = useState(initialUnitsPerCustomer);
  const [totalUnitsAvailable, setTotalUnitsAvailable] = useState(initialTotalUnitsAvailable);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(initialSelectedProducts);
  const [expectedFulfillmentDate, setExpectedFulfillmentDate] = useState<Date>(initialExpectedFulfillmentDate);

  const handleUnitsPerCustomerChange = useCallback((newValue: string) => {
    const value = parseInt(newValue);
    if (value >= 0) {
      setUnitsPerCustomer(newValue);
      onUnitsPerCustomerChange(newValue);
    }
  }, [onUnitsPerCustomerChange]);

  const handleTotalUnitsAvailableChange = useCallback((newValue: string) => {
    const value = parseInt(newValue);
    if (value >= 0) {
      setTotalUnitsAvailable(newValue);
      onTotalUnitsAvailableChange(newValue);
    }
  }, [onTotalUnitsAvailableChange]);

  const handleExpectedFulfillmentDateChange = useCallback((date: Date) => {
    setExpectedFulfillmentDate(date);
    onExpectedFulfillmentDateChange(date);
  }, [onExpectedFulfillmentDateChange]);

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
      onSelectedProductsChange(newProducts);
    }
  }, [shopify, selectedProducts, onSelectedProductsChange]);

  const removeProduct = useCallback(
    (productId: string) => {
      const newProducts = selectedProducts.filter((p) => p.id !== productId);
      setSelectedProducts(newProducts);
      onSelectedProductsChange(newProducts);
    },
    [selectedProducts, onSelectedProductsChange],
  );

  return (
    <BlockStack gap="500">
      <DateField
        onChange={handleExpectedFulfillmentDateChange}
        label={t("selling_plan_group_form.expected_fulfillment_date")}
        initialValue={initialExpectedFulfillmentDate}
      />

      <TextField
        type="number"
        autoComplete="off"
        label={t("selling_plan_group_form.units_per_customer")}
        value={unitsPerCustomer}
        onChange={handleUnitsPerCustomerChange}
        min={0}
      />

      <TextField
        type="number"
        autoComplete="off"
        label={t(
          "selling_plan_group_form.total_units_available",
        )}
        value={totalUnitsAvailable}
        onChange={handleTotalUnitsAvailableChange}
        min={0}
      />

      <BlockStack gap={selectedProducts.length > 0 ? "500" : "200"}>
        <BlockStack gap="200">
          <Text as="p">
            {selectedProducts.length > 0
              ? t("selling_plan_group_form.select_products")
              : t("selling_plan_group_form.no_selected_products")}
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
                  "selling_plan_group_form.add_or_remove_products",
                )
              : t("selling_plan_group_form.add_products")}
          </Button>
        </Box>
      </BlockStack>
    </BlockStack>
  );
}
