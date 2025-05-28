import {
  BlockStack,
  Text,
  TextField,
  InlineStack,
  Tag,
  Button,
  Box,
  Checkbox,
  Banner,
} from "@shopify/polaris";
import { useTranslation } from "../../hooks/useTranslation";
import { useState, useCallback } from "react";
import DateField from "./date-field";
import { useAppBridge } from "@shopify/app-bridge-react";
import { getTomorrow } from "@shared/tools/date-tools";

interface SellingPlanGroupFormProps {
  onUnitsPerCustomerChange: (value: number) => void;
  onSelectedProductsChange: (products: Product[]) => void;
  onExpectedFulfillmentDateChange: (date: Date) => void;
  initialUnitsPerCustomer?: number;
  initialUnitsPerCustomerMin?: number;
  initialSelectedProducts?: Product[];
  initialExpectedFulfillmentDate?: Date;
}

export default function SellingPlanGroupForm({
  onUnitsPerCustomerChange,
  onSelectedProductsChange,
  onExpectedFulfillmentDateChange,
  initialUnitsPerCustomer = 0,
  initialUnitsPerCustomerMin = 0,
  initialSelectedProducts = [],
  initialExpectedFulfillmentDate = getTomorrow(),
}: SellingPlanGroupFormProps) {
  const { t } = useTranslation();
  const shopify = useAppBridge();

  // States
  const [enableUnitRestriction, setEnableUnitRestriction] = useState(initialUnitsPerCustomer > 0);
  const [unitsPerCustomer, setUnitsPerCustomer] = useState(initialUnitsPerCustomer);
  const [unitsPerCustomerMin, setUnitsPerCustomerMin] = useState(initialUnitsPerCustomerMin);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>(initialSelectedProducts);
  const [expectedFulfillmentDate, setExpectedFulfillmentDate] = useState<Date>(initialExpectedFulfillmentDate);

  const handleUnitsPerCustomerChange = useCallback((newValue: string) => {
    const value = parseInt(newValue);
    if (value >= 0) {
      setUnitsPerCustomer(value);
      onUnitsPerCustomerChange(value);
    }
  }, [onUnitsPerCustomerChange]);

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

  // Handle Unit Restriction Input/Appearance
  const handleEnableRestrictionChange = (newChecked: boolean) => {
    setEnableUnitRestriction(newChecked)

    let units;
    if (!newChecked) {
      units = 0;
    } else if (initialUnitsPerCustomer >= 1 || unitsPerCustomer >= 1) {
      units = initialUnitsPerCustomer > 1 ? initialUnitsPerCustomer : unitsPerCustomer;
    } else {
      units = 1;
    }

    setUnitsPerCustomer(units);
    setUnitsPerCustomerMin(newChecked ? 1 : 0);
    handleUnitsPerCustomerChange(String(units));
  };

  return (
    <BlockStack gap="500">
      <DateField
        onChange={handleExpectedFulfillmentDateChange}
        label={t("selling_plan_group_form.expected_fulfillment_date")}
        initialValue={expectedFulfillmentDate}
      />

      <Checkbox
        label={t("selling_plan_group_form.enable_unit_restriction")}
        checked={enableUnitRestriction}
        onChange={(newChecked) => handleEnableRestrictionChange(newChecked)}
      />

      {enableUnitRestriction && (
        <TextField
          type="number"
          autoComplete="off"
          label={t("selling_plan_group_form.units_per_customer")}
          value={String(unitsPerCustomer)}
          onChange={handleUnitsPerCustomerChange}
          min={unitsPerCustomerMin}
        />
      )}

      <BlockStack gap={selectedProducts.length > 0 ? "500" : "200"}>
        <BlockStack gap="200">
          <Text as="p">
            {selectedProducts.length > 0
              ? t("selling_plan_group_form.select_products")
              : t("selling_plan_group_form.no_selected_products")}
          </Text>

          {selectedProducts.length > 0 && (
            <InlineStack gap="200" wrap={true}>
              {selectedProducts.map((product) => (
                <Tag
                  key={product.id}
                  onRemove={() => removeProduct(product.id)}
                >
                  {product.title}
                </Tag>
              ))}
            </InlineStack>
          )}
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

        <Box paddingBlockStart="200">
          <Banner tone="info" title={t("selling_plan_group_form.notice_selling_plan_requirement")} />
        </Box>
      </BlockStack>
    </BlockStack>
  );
}
