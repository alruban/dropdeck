import {
  AdminAction,
  useApi,
  Button,
  Text,
  BlockStack,
  DateField,
  Divider,
  InlineStack,
  NumberField,
  TextField
} from '@shopify/ui-extensions-react/admin';
import { useState } from 'react';

import createPreorderSellingPlan from './mutations/create-preorder-selling-plan';
import { createDateFromNumbers, getOneMonthAhead } from './tools/convert-date'; 

export const isDevelopment = process.env.NODE_ENV === "development";

export default function PurchaseOptionsActionExtension(extension) {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const { i18n, close, data } = useApi(extension);
   const productId = data.selected?.[0]?.id;

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [releaseDate, setReleaseDate] = useState(getOneMonthAhead());
  const [releaseHour, setReleaseHour] = useState("00:00");

  console.log("releaseDate", createDateFromNumbers(releaseDate), new Date().toISOString());

  const createPreorder = () => {
    setIsLoading(true);
    
    createPreorderSellingPlan(productId, new Date().toISOString(), () => {
      setIsLoading(false);
      close();
    });
  }

  return (
    <AdminAction
      primaryAction={
        <Button
          variant="primary"
          onClick={createPreorder}
          disabled={isLoading}
        >
          {isLoading ? i18n.translate("creating_preorder") : i18n.translate("create_preorder")}
        </Button>
      }
      secondaryAction={
        <Button
          onPress={() => {
            console.log('closing');
            close();
          }}
        >
          Cancel
        </Button>
      }
    >
      <BlockStack gap="large">
        <Text>{i18n.translate("description")}</Text>

        <Divider />

        <InlineStack gap="base">
          <DateField
            label={i18n.translate("release_date")}
            value={releaseDate}
            onChange={(newDate) => setReleaseDate(String(newDate))}
          />

          <TextField
            label={i18n.translate("release_hour")}
            value={releaseHour}
            onInput={(newReleaseHour) => setReleaseHour(newReleaseHour)}
          />
        </InlineStack>
      </BlockStack>
    </AdminAction>
  );
}