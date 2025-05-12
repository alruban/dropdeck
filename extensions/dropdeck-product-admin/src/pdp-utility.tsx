import {
  reactExtension,
  AdminBlock,
  useApi
} from '@shopify/ui-extensions-react/admin';
import { useState } from 'react';
import SetPreorder from './components/set-preorder';
import CreatePreorder from './components/create-preorder';
import { TARGET } from './target';

import checkPreorderMetaobjectDefinitionExists from './queries/get-preorder-metaobject-definition-by-type';
import checkPreorderMetaobjectEntryExists from './queries/get-preorder-metaobject-entry-by-handle';
import LoadingIndicator from './components/loading-indicator';

export const isDevelopment = process.env.NODE_ENV === "development";
export default reactExtension(TARGET, () => <App />);

function App() {
  const { data, query } = useApi(TARGET);
  const productId = data.selected?.[0]?.id.replace("gid://shopify/Product/", "");

  // States
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [preorderData, setPreorderData] = useState<PreorderData | null>(null);

  if (isInitialLoad) {
    // Check if the metaobject definition already exists
    checkPreorderMetaobjectDefinitionExists(
      () => {
        // If the metaobject definition already exists, we can look for or create the metaobject entry
        checkPreorderMetaobjectEntryExists(productId,
          (metaobjectEntry) => {
            // If the metaobject entry already exists, we populate the fields with the existing values
            const { fields, id } = metaobjectEntry.data.metaobjectByHandle;
            const releaseDate = fields.find(field => field.key === "release_date")?.value;
            const unitsAvailable = fields.find(field => field.key === "units_available")?.value;
            setPreorderData({ 
              metaobject_entry_id: id,
              release_date: releaseDate, 
              units_available: unitsAvailable 
            });
            setIsInitialLoad(false);
            setIsLoading(false);
          },
          () => {
            setIsInitialLoad(false);
            setIsLoading(false);
          }
        );
      }
    );
  }

  return (
    <AdminBlock title="Dropdeck">
      {isLoading && <LoadingIndicator />}
      {!isLoading && (
        <>
          {!preorderData && <CreatePreorder preorderData={setPreorderData} />}
          {preorderData && <SetPreorder preorderData={preorderData} />}
        </>
      )}
    </AdminBlock>
  );
}