import {
  AdminAction,
  useApi,
  Button,
  Text,
  BlockStack,
  DateField,
  Divider,
  InlineStack,
  NumberField
} from '@shopify/ui-extensions-react/admin';
import { useEffect, useState } from 'react';

import createPreorderSellingPlanGroup from './mutations/create-sp-group';
import { getOneMonthAhead, parseISOString, createISOString } from './tools/convert-date'; 
import getPreorderSellingPlanGroup from './queries/get-sp-group.js';
import { RenderExtensionTarget } from '@shopify/ui-extensions/admin';
import updatePreorderSellingPlanGroup from './mutations/update-sp-group';

export const isDevelopment = process.env.NODE_ENV === "development";

type Props = {
  extension: RenderExtensionTarget;
  context: "product" | "product-variant";
}

export default function PurchaseOptionsActionExtension({ extension, context }: Props) {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const { i18n, close, data } = useApi(extension);

  const ids = data.selected?.[0];
  if (!ids) return; 

  // States
  const productId = ids.productId;
  const [sellingPlanGroupId, setSellingPlanGroupId] = useState(ids.sellingPlanId);
  const [sellingPlanId, setSellingPlanId] = useState<string | undefined>(undefined);

  const [intent, setIntent] = useState<"creating" | "updating">("creating");
  const [isLoading, setIsLoading] = useState(false);
  const [dateError, setDateError] = useState<string | undefined>(undefined);
  const [releaseDate, setReleaseDate] = useState(getOneMonthAhead());
  const [unitsPerCustomer, setUnitsPerCustomer] = useState(0); // 0 means unlimited
  const [totalUnitsAvailable, setTotalUnitsAvailable] = useState(0); // 0 means unlimited


  useEffect(() => {
    if (sellingPlanGroupId.length === 0) return;
    setIntent("updating");
    setIsLoading(true);
    getPreorderSellingPlanGroup(sellingPlanGroupId, (sellingPlanGroup) => {
      console.log("SELLING PLAN GROUP", sellingPlanGroup);
      const sellingPlanId = sellingPlanGroup.sellingPlans.edges[0].node.id;
      const { fulfillmentExactTime } = sellingPlanGroup.sellingPlans.edges[0].node.deliveryPolicy;
      console.log("SELLING PLAN ID", sellingPlanId);

      if (sellingPlanId) {
        setSellingPlanId(sellingPlanId);
      }

      if (fulfillmentExactTime) {
        const { date } = parseISOString(fulfillmentExactTime);
        setReleaseDate(date);
        setIsLoading(false);
      }
    });
  }, [sellingPlanGroupId]);

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

  const create = () => {
    if (productId.length === 0) return;
    if (!validateDate(releaseDate)) return;
    setIsLoading(true);
    const isoString = createISOString(releaseDate);
    createPreorderSellingPlanGroup(productId, isoString, () => {
      setIsLoading(false);
      close();
    });
  }

  const update = () => {
    if (sellingPlanGroupId.length === 0) return;
    if (!validateDate(releaseDate)) return;
    setIsLoading(true);
    const isoString = createISOString(releaseDate);
    updatePreorderSellingPlanGroup(sellingPlanGroupId, sellingPlanId, isoString, () => {
      setIsLoading(false);
      close();
    });
  }

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

        <BlockStack gap="base">
          <DateField
            label={i18n.translate("shipping_date")}
            value={releaseDate}
            onChange={(newDate) => {
              const date = String(newDate);
              setReleaseDate(date);
              validateDate(date);
            }}
            error={dateError}
          />

          <NumberField
            label={i18n.translate("units_per_customer")}
            value={unitsPerCustomer}
            onChange={(newUnitsPerCustomer) => setUnitsPerCustomer(newUnitsPerCustomer)}
          />

          <NumberField
            label={i18n.translate("total_units_available")}
            value={totalUnitsAvailable}
            onChange={(newTotalUnitsAvailable) => setTotalUnitsAvailable(newTotalUnitsAvailable)}
          />
        </BlockStack>
      </BlockStack>
    </AdminAction>
  );
}