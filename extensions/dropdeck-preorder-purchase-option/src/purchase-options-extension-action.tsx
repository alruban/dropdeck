import {
  AdminAction,
  useApi,
  Button,
  Text,
  BlockStack,
  DateField,
  Divider,
  NumberField,
  Badge,
  Link,
  Checkbox,
  Banner
} from '@shopify/ui-extensions-react/admin';

import { useEffect, useState } from 'react';

import { createISOString, getOneMonthAhead, parseISOString, parseISOStringIntoFormalDate } from '../../../shared/tools/date-tools';
import { type ActionExtensionApi } from '@shopify/ui-extensions/admin';
import { CREATE_SP_GROUP_MUTATION, createSPGroupVariables } from '../../../shared/mutations/create-sp-group';
import { UPDATE_SP_GROUP_MUTATION, updateSPGroupVariables } from '../../../shared/mutations/update-sp-group.js';
import { type GetSPGroupResponse, GET_SP_GROUP_QUERY, getSPGroupVariables } from '../../../shared/queries/get-sp-group.js';
import { GET_SHOP_QUERY, type GetShopResponse } from '../../../shared/queries/get-shop';
import { GET_PRODUCT_ID_FROM_VARIANT_QUERY, type GetProductIdFromVariantResponse } from '../../../shared/queries/get-product-id-from-variant';
import { UPDATE_PRODUCT_SP_REQUIREMENT_MUTATION, updateProductSPRequirementVariables } from '../../../shared/mutations/update-product-sp-requirement';

import { isDevelopment } from '../../../shared/tools/is-development';

type Props = {
  extension: "admin.product-purchase-option.action.render" | "admin.product-variant-purchase-option.action.render";
  context: "product" | "product-variant";
}

export default function PurchaseOptionsActionExtension({ extension, context }: Props) {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const { i18n, close, data, query } = useApi(extension) as ActionExtensionApi<typeof extension>;
  const ids = data.selected?.[0] as {
    id: string;
    sellingPlanId: string;
  }; // sellingPlanId isn't in the docs, but it is returned and we need it when we update a selling plan.

  // States
  const [targetId, setTargetId] = useState<string | undefined>(ids.id);
  const sellingPlanGroupId = ids.sellingPlanId;
  const [intent, setIntent] = useState<"creating" | "updating">("creating");
  const [isLoading, setIsLoading] = useState(false);
  const [dateError, setDateError] = useState<string | undefined>(undefined);
  const [shopifyDomain, setShopifyDomain] = useState<string | undefined>(undefined);

  const [sellingPlanId, setSellingPlanId] = useState<string | undefined>(undefined);
  const [expectedFulfillmentDate, setExpectedFulfillmentDate] = useState(getOneMonthAhead().toISOString().split('T')[0]);// Returns YYYY-MM-DD format
  const [enableUnitRestriction, setEnableUnitRestriction] = useState(false);
  const [initialUnitsPerCustomer, setInitialUnitsPerCustomer] = useState(enableUnitRestriction ? 1 : 0);
  const [unitsPerCustomer, setUnitsPerCustomer] = useState(enableUnitRestriction ? 1 : 0);
  const [unitsPerCustomerMin, setUnitsPerCustomerMin] = useState(enableUnitRestriction ? 1 : 0);
  const [affectedProducts, setAffectedProducts] = useState<{
    id: string;
    title: string;
  }[]>([]);

  //  Get the shopify domain
  useEffect(() => {
    query(GET_SHOP_QUERY)
    .then((res: GetShopResponse) => {
      isDevelopment && console.log("Retrieved the shopify domain:", res);
      setShopifyDomain(res.data.shop.myshopifyDomain);
    })
    .catch((error) => {
      isDevelopment && console.log("Failed to retrieve the shopify domain:", error);
      console.error(error);
    });
  }, [query]);

  //  If the user has opened a product-varaint modal, get the variant's product id.
  useEffect(() => {
    if (context === "product-variant") {
      query(GET_PRODUCT_ID_FROM_VARIANT_QUERY, {
        variables: {
          id: targetId
        }
      })
      .then((res: GetProductIdFromVariantResponse) => {
        isDevelopment && console.log("Retrieved the product id of the variant:", res);
        setTargetId(res.data.productVariant.product.id);
      })
      .catch((error) => {
        isDevelopment && console.log("Failed to retrieve the product id of the variant:", error);
        console.error(error);
      });
    }
  }, []);

  //  Get the selling plan group
  useEffect(() => {
    if (sellingPlanGroupId.length === 0) return;
    setIntent("updating");
    setIsLoading(true);

    query(
      GET_SP_GROUP_QUERY,
      getSPGroupVariables(sellingPlanGroupId)
    )
    .then((res: GetSPGroupResponse) => {
      const { sellingPlanGroup } = res.data;

      if (sellingPlanGroup) {
        const sellingPlanId = sellingPlanGroup.sellingPlans.edges[0].node.id;
        const expectedFulfillmentDate = parseISOString(sellingPlanGroup.sellingPlans.edges[0].node.deliveryPolicy.fulfillmentExactTime).date;
        const unitsPerCustomer = Number(sellingPlanGroup.sellingPlans.edges[0].node.metafields.edges.find((metafield) => metafield.node.key === "units_per_customer")?.node.value);
        const affectedProducts = sellingPlanGroup.products.edges.map((product) => (targetId !== product.node.id ? {
          id: product.node.id,
          title: product.node.title
        } : null)).filter((product) => product !== null)

        isDevelopment && console.log("Selling plan group retrieved:", sellingPlanGroup);

        setSellingPlanId(sellingPlanId);
        setExpectedFulfillmentDate(expectedFulfillmentDate);
        setAffectedProducts(affectedProducts);
        setInitialUnitsPerCustomer(unitsPerCustomer);
        setUnitsPerCustomer(unitsPerCustomer);
        setEnableUnitRestriction(unitsPerCustomer > 0);
      } else {
        isDevelopment && console.log("Failed to retrieve selling plan group:", res);
      }
    })
    .catch((error) => {
      isDevelopment && console.log("Failed to retrieve selling plan group:", error);
      console.error(error);
    })
    .finally(() => {
      setIsLoading(false);
    });
  }, [query, sellingPlanGroupId]);

  const create = () => {
    if (targetId.length === 0) return;
    if (!validateDate(expectedFulfillmentDate)) return;
    setIsLoading(true);
    const isoString = createISOString(expectedFulfillmentDate);

    const promises = [];

    const descriptionForPlanWithNoUnitRestriction = i18n.translate("sp_group.description_for_plan_with_no_unit_restriction", {
      date: parseISOStringIntoFormalDate(expectedFulfillmentDate)
    });

    const descriptionForPlanWithUnitRestriction = i18n.translate("sp_group.description_for_plan_with_unit_restriction", {
      date: parseISOStringIntoFormalDate(expectedFulfillmentDate),
      units: unitsPerCustomer
    });

    // Create the selling plan group.
    promises.push(query(
      CREATE_SP_GROUP_MUTATION,
      createSPGroupVariables(
        isoString,
        unitsPerCustomer,
        descriptionForPlanWithNoUnitRestriction,
        descriptionForPlanWithUnitRestriction,
        "EXACT_TIME",
        "ON_SALE",
        [targetId],
        undefined
      )
    ));

    // Set the selling plan requirement to true for the product.
    promises.push(query(
      UPDATE_PRODUCT_SP_REQUIREMENT_MUTATION,
      updateProductSPRequirementVariables(
        targetId,
        true
      )
    ))

    Promise.all(promises)
    .then((response) => {
      isDevelopment && console.log("Selling plan group created:", response);
    })
    .catch((error) => {
      isDevelopment && console.log("Failed to create selling plan group", error);
      console.error(error);
    }).finally(() => {
      setIsLoading(false);
      close();
    });
  }

  const update = () => {
    if (sellingPlanGroupId.length === 0) return;
    if (!validateDate(expectedFulfillmentDate)) return;
    setIsLoading(true);

    const promises = [];

    const descriptionForPlanWithNoUnitRestriction = i18n.translate("sp_group.description_for_plan_with_no_unit_restriction", {
      date: parseISOStringIntoFormalDate(expectedFulfillmentDate)
    });

    const descriptionForPlanWithUnitRestriction = i18n.translate("sp_group.description_for_plan_with_unit_restriction", {
      date: parseISOStringIntoFormalDate(expectedFulfillmentDate),
      units: unitsPerCustomer
    });

    // Update the selling plan group.
    promises.push(query(
      UPDATE_SP_GROUP_MUTATION,
      updateSPGroupVariables(
        sellingPlanGroupId,
        sellingPlanId,
        createISOString(expectedFulfillmentDate),
        unitsPerCustomer,
        descriptionForPlanWithNoUnitRestriction,
        descriptionForPlanWithUnitRestriction,
        "EXACT_TIME",
        "ON_SALE",
      )
    ));

    // Set the selling plan requirement to true for the product.
    promises.push(query(
      UPDATE_PRODUCT_SP_REQUIREMENT_MUTATION,
      updateProductSPRequirementVariables(
        targetId,
        true
      )
    ))

    Promise.all(promises)
    .then((response) => {
      isDevelopment && console.log("Selling plan group updated:", response);
    })
    .catch((error) => {
      isDevelopment && console.log("Failed to update selling plan group", error);
      console.error(error);
    }).finally(() => {
      setIsLoading(false);
      close();
    });
  }

  const validateDate = (date: string) => {
    const selectedDate = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      setDateError(i18n.translate("error_date_must_be_future"));
      return false;
    }
    setDateError(undefined);
    return true;
  };

  // Handle Unit Restriction Input/Appearance
  const handleEnableRestrictionChange = (newChecked: boolean) => {
    setEnableUnitRestriction(newChecked)

    let units: number;
    if (!newChecked) {
      units = 0;
    } else if (initialUnitsPerCustomer >= 1 || unitsPerCustomer >= 1) {
      units = initialUnitsPerCustomer > 1 ? initialUnitsPerCustomer : unitsPerCustomer;
    } else {
      units = 1;
    }

    setUnitsPerCustomer(units);
    setUnitsPerCustomerMin(enableUnitRestriction ? 1 : 0);
  };

  return (
    <AdminAction
      title={intent === "creating" ? i18n.translate("heading_create_preorder") : i18n.translate("heading_update_preorder")}
      primaryAction={
        <Button
          variant="primary"
          onClick={() => {
            return intent === "creating" ? create() : update();
          }}
          disabled={isLoading || !!dateError}
        >
          {intent === "creating" && (isLoading ? i18n.translate("submit_creating_preorder") : i18n.translate("submit_create_preorder"))}
          {intent === "updating" && (isLoading ? i18n.translate("submit_updating_preorder") : i18n.translate("submit_update_preorder"))}
        </Button>
      }
      secondaryAction={
        <Button onPress={() => close()}>
          {i18n.translate("cancel")}
        </Button>
      }
    >
      <BlockStack gap="large">
        <Text>{i18n.translate("description")}</Text>

        <Divider />

        <BlockStack gap="large">
          <BlockStack gap="large">
            <DateField
              label={i18n.translate("shipping_date")}
              value={expectedFulfillmentDate}
              onChange={(newDate) => {
                const date = String(newDate);
                setExpectedFulfillmentDate(date);
                validateDate(date);
              }}
              error={dateError}
            />

            <Checkbox
              label={i18n.translate("enable_unit_restriction")}
              checked={enableUnitRestriction}
              onChange={(value) => handleEnableRestrictionChange(value)}
            />

            {enableUnitRestriction && (
              <NumberField
                label={i18n.translate("units_per_customer")}
                value={unitsPerCustomer}
                onChange={(newUnitsPerCustomer) => setUnitsPerCustomer(newUnitsPerCustomer)}
                min={unitsPerCustomerMin}
              />
            )}
          </BlockStack>

          {intent === "updating" && affectedProducts.length > 0 && (
            <BlockStack gap="base">
              <Text>{i18n.translate("affected_products")}</Text>
              <BlockStack gap="base">
                {affectedProducts.map((product) => {
                  // Get Product URL
                  const permanentStoreName = shopifyDomain.replace(".myshopify.com", "");
                  const adminUrl = `https://admin.shopify.com/store/${permanentStoreName}/`;
                  const productUrl = `${adminUrl}products/${product.id.replace("gid://shopify/Product/", "")}`;
                  return (
                    <Badge key={adminUrl}>
                      <Link
                        to={productUrl}
                        tone={"inherit"}
                        target="_blank"
                      >
                        {product.title}
                      </Link>
                    </Badge>
                  )
                })}
              </BlockStack>
            </BlockStack>
          )}

          <BlockStack gap="base">
            {context === "product-variant" && <Banner tone="critical" title={i18n.translate("product_variant_extension.description")} />}
            <Banner tone="info" title={i18n.translate("notice_selling_plan_requirement")} />
          </BlockStack>
        </BlockStack>
      </BlockStack>
    </AdminAction>
  );
}
