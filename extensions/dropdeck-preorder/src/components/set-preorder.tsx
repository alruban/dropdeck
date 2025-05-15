import {
  BlockStack,
  DateField,
  NumberField
} from '@shopify/ui-extensions-react/admin';
import { useEffect, useState } from 'react';
import updatePreorderMetaobjectEntry from '../mutations/update-mo-entry';

interface SetPreorderProps {
  preorderData: PreorderData;
}

export default function SetPreorder(props: SetPreorderProps) {
  // States
  const [releaseDate, setReleaseDate] = useState(props.preorderData.release_date);
  const [unitsAvailable, setUnitsAvailable] = useState(props.preorderData.units_available);

  useEffect(() => {
    console.log("Updating preorder metaobject entry", releaseDate, unitsAvailable);
    updatePreorderMetaobjectEntry(
      props.preorderData.metaobject_entry_id,
      [
        {
          key: "release_date",
          value: releaseDate
        },
        {
          key: "units_available",
          value: unitsAvailable
        }
      ]
    );
  }, [releaseDate, unitsAvailable]);

  return (
    <BlockStack gap="base">
      <DateField
        label="Release Date"
        value={releaseDate}
        onChange={(newDate) => setReleaseDate(String(newDate))}
      />

      <NumberField
        label="Units available (0 sets no limit)"
        value={Number(unitsAvailable)}
        onChange={(newUnitsAvailable) => setUnitsAvailable(String(newUnitsAvailable))}
      />
    </BlockStack>
  );
}