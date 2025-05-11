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

export default function SetPreorder() {
  // States
  const [selected, setSelected] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // This gives YYYY-MM-DD format
  });
  const [unitsAvailable, setUnitsAvailable] = useState(100);

  return (
    <BlockStack>
      <DateField
        label="Release Date"
        value={selected}
        onChange={setSelected}
      />

      <NumberField
        label="Units available"
        value={unitsAvailable}
        onChange={setUnitsAvailable}
      />

      <Text>Release date: {formatDate(selected)}</Text>
      <Text>Units available to preorder: {unitsAvailable}</Text>
    </BlockStack>
  );
}