import {
  AdminAction,
  useApi,
  Button,
  Text,
  BlockStack,
  DateField,
  Divider,
  NumberField,
  InlineStack,
  Badge,
  Link
} from '@shopify/ui-extensions-react/admin';

import { useEffect, useState } from 'react';

import { createISOString, getOneMonthAhead, parseISOString } from '../../../shared/tools/date-tools';
import { type RenderExtensionTarget } from '@shopify/ui-extensions/admin';
import { CREATE_SP_GROUP_MUTATION, createSPGroupVariables } from '../../../shared/mutations/create-sp-group';
import { UPDATE_SP_GROUP_MUTATION, updateSPGroupVariables } from '../../../shared/mutations/update-sp-group.js';
import { type GetSPGroupResponse, GET_SP_GROUP_QUERY, getSPGroupVariables } from '../../../shared/queries/get-sp-group.js';
import { GET_SHOP_QUERY, type GetShopResponse } from '../../../shared/queries/get-shop';

import { isDevelopment } from '../../../shared/tools/is-development';

type Props = {
  extension: RenderExtensionTarget;
  context: "product" | "product-variant";
}

export default function PurchaseOptionsActionExtension({ extension, context }: Props) {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const { i18n, close, data, query } = useApi(extension);
  const ids = data.selected?.[0];

  // States
  const productId = ids.id;
  const sellingPlanGroupId = ids.sellingPlanId;

  const [intent, setIntent] = useState<"creating" | "updating">("creating");
  const [isLoading, setIsLoading] = useState(false);
  const [dateError, setDateError] = useState<string | undefined>(undefined);
  const [shopifyDomain, setShopifyDomain] = useState<string | undefined>(undefined);

  const [sellingPlanId, setSellingPlanId] = useState<string | undefined>(undefined);
  const [expectedFulfillmentDate, setExpectedFulfillmentDate] = useState(getOneMonthAhead());
  const [unitsPerCustomer, setUnitsPerCustomer] = useState(0); // 0 means unlimited
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
        isDevelopment && console.log("Selling plan group retrieved:", sellingPlanGroup);
        setSellingPlanId(sellingPlanGroup.sellingPlans.edges[0].node.id);
        setExpectedFulfillmentDate(parseISOString(sellingPlanGroup.sellingPlans.edges[0].node.deliveryPolicy.fulfillmentExactTime).date);
        setUnitsPerCustomer(Number(sellingPlanGroup.sellingPlans.edges[0].node.metafields.edges.find((metafield) => metafield.node.key === "units_per_customer")?.node.value));
        setAffectedProducts(sellingPlanGroup.products.edges.map((product) => (productId !== product.node.id ? {
          id: product.node.id,
          title: product.node.title
        } : null)).filter((product) => product !== null));
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
    if (productId.length === 0) return;
    if (!validateDate(expectedFulfillmentDate)) return;
    setIsLoading(true);
    const isoString = createISOString(expectedFulfillmentDate);

    query(
      CREATE_SP_GROUP_MUTATION,
      createSPGroupVariables(
        [productId],
        isoString,
        unitsPerCustomer
      )
    )
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

    query(
      UPDATE_SP_GROUP_MUTATION,
      updateSPGroupVariables(
        sellingPlanGroupId,
        sellingPlanId,
        createISOString(expectedFulfillmentDate),
        unitsPerCustomer
      )
    )
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

            <NumberField
              label={i18n.translate("units_per_customer")}
              value={unitsPerCustomer}
              onChange={(newUnitsPerCustomer) => setUnitsPerCustomer(newUnitsPerCustomer)}
              min={0}
            />
          </BlockStack>

          {intent === "updating" && affectedProducts.length > 0 && (
            <BlockStack gap="base">
              <Text>{i18n.translate("affected_products")}</Text>
              <InlineStack gap="base">
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
              </InlineStack>
            </BlockStack>
          )}
        </BlockStack>
      </BlockStack>
    </AdminAction>
  );
}
