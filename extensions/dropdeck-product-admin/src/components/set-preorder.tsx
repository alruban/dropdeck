import {
  BlockStack,
  Text,
  DateField,
  NumberField
} from '@shopify/ui-extensions-react/admin';
import { useState } from 'react';


function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  // Add ordinal suffix to day
  const ordinal = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  return `${day}${ordinal(day)} ${month} ${year}`;
}

interface SetPreorderProps {
  preorderData: PreorderData;
}

export default function SetPreorder(props: SetPreorderProps) {
  // States
  const [releaseDate, setReleaseDate] = useState(props.preorderData.release_date);
  const [unitsAvailable, setUnitsAvailable] = useState(Number(props.preorderData.units_available));

  return (
    <BlockStack>
      <DateField
        label="Release Date"
        value={releaseDate}
        onChange={setReleaseDate}
      />

      <NumberField
        label="Units available"
        value={unitsAvailable}
        onChange={setUnitsAvailable}
      />

      <Text>Release date: {formatDate(releaseDate)}</Text>
      <Text>Units available to preorder: {unitsAvailable}</Text>
    </BlockStack>
  );
}