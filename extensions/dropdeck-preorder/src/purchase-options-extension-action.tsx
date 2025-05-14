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
  Heading
} from '@shopify/ui-extensions-react/admin';
import { useState } from 'react';

import createPreorderSellingPlan from './mutations/create-preorder-selling-plan';
import { createDateFromNumbers, getOneMonthAhead } from './tools/convert-date'; 

export const isDevelopment = process.env.NODE_ENV === "development";

const createISOString = (date: string, hours: number, minutes: number): string => {
  // Create a date object from the date string
  const dateObj = new Date(date);
  
  // Set the hours and minutes
  dateObj.setHours(hours, minutes, 0, 0);
  
  // Return ISO string
  return dateObj.toISOString();
};

export default function PurchaseOptionsActionExtension(extension) {
  // The useApi hook provides access to several useful APIs like i18n, close, and data.
  const { i18n, close, data } = useApi(extension);
   const productId = data.selected?.[0]?.id;

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [releaseDate, setReleaseDate] = useState(getOneMonthAhead());
  const [releaseHour, setReleaseHour] = useState(0);
  const [releaseMinute, setReleaseMinute] = useState(0);

  // Errors
  const [timeError, setTimeError] = useState("");

  console.log("releaseDate", createDateFromNumbers(releaseDate), new Date().toISOString());

  const formatTime = (hours: number, minutes: number): string => {
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    return `${formattedHours}:${formattedMinutes}`;
  };

  const createPreorder = () => {
    setIsLoading(true);
    const isoString = createISOString(releaseDate, releaseHour, releaseMinute);
    createPreorderSellingPlan(productId, isoString, () => {
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
          disabled={isLoading || !!timeError}
        >
          {isLoading ? i18n.translate("creating_preorder") : i18n.translate("create_preorder")}
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

        <Text>{i18n.translate("release_date_description")}</Text>

        <InlineStack gap="base">
          <DateField
            label={i18n.translate("date")}
            value={releaseDate}
            onChange={(newDate) => setReleaseDate(String(newDate))}
          />

          <NumberField
            label={i18n.translate("hours")}
            value={releaseHour}
            onChange={setReleaseHour}
            min={0}
            max={23}
            step={1}
          />

          <NumberField
            label={i18n.translate("minutes")}
            value={releaseMinute}
            onChange={setReleaseMinute}
            min={0}
            max={59}
            step={1}
          />
        </InlineStack>
      </BlockStack>
    </AdminAction>
  );
}