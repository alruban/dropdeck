import {
  BlockStack,
  Text,
  Button,
  useApi
} from '@shopify/ui-extensions-react/admin';
import { TARGET } from '../target';
import { useState } from 'react';

import checkPreorderMetaobjectDefinitionExists from '../queries/get-preorder-metaobject-definition-by-type';
import checkPreorderMetaobjectEntryExists from '../queries/get-preorder-metaobject-entry-by-handle';
import createPreorderMetaobjectDefinition from '../mutations/create-preorder-metaobject-definition';
import createPreorderMetaobjectEntry from '../mutations/create-preorder-metaobject-entry';

interface CreatePreorderProps {
  preorderData: (data: PreorderData) => void;
}

export default function CreatePreorder(props: CreatePreorderProps) {
  const { data } = useApi(TARGET);
  const productId = data.selected?.[0]?.id.replace("gid://shopify/Product/", "");

  const [isLoading, setIsLoading] = useState(false);

  const createPreorderMetaobject = () => {
    // setIsLoading(true);

    // Check if the metaobject definition already exists
    checkPreorderMetaobjectDefinitionExists(
      () => {
        // If the metaobject definition already exists, we can look for or create the metaobject entry
        checkPreorderMetaobjectEntryExists(productId,
          (metaobjectEntry) => {
            // If the metaobject entry already exists, we populate the fields with the existing values
            const { fields } = metaobjectEntry.data.metaobjectByHandle;
            const releaseDate = fields.find(field => field.key === "release_date")?.value;
            const unitsAvailable = fields.find(field => field.key === "units_available")?.value;
            props.preorderData({ release_date: releaseDate, units_available: unitsAvailable });
          },
          () => {
            // If the metaobject entry does not exist, we can create it
            createPreorderMetaobjectEntry(productId);
          }
        );
      },
      () => {
        // If the metaobject definition does not exist, we can create it
        createPreorderMetaobjectDefinition(
          () => {
            // Now the metaobject definition is created, we can create the metaobject entry
            createPreorderMetaobjectEntry(productId);
          }
        );
      }
    );
  };

  return (
    <BlockStack>
      <Text>Create a preorder to start selling your product</Text>

      <Button
        variant="primary"
        onClick={createPreorderMetaobject}
        disabled={isLoading}
      >
        {isLoading ? "Checking..." : "Create preorder"}
      </Button>
    </BlockStack>
  );
}