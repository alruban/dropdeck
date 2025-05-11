import {
  BlockStack,
  Text,
  Button,
  useApi
} from '@shopify/ui-extensions-react/admin';
import { TARGET } from '../target';
import { gqlFetch } from '../tools/gql-fetch';
import { useState } from 'react';

import { CREATE_PREORDER_METAOBJECT_ENTRY_QUERY } from '../mutations/create-preorder-metaobject-entry';
import { PREORDER_METAOBJECT_DEFINITION_CREATE_MUTATION, PREORDER_METAOBJECT_DEFINITION_CREATE_VARIABLES } from '../mutations/create-preorder-metaobject-definition';
import { PREORDER_METAOBJECT_ENTRY_BY_HANDLE_QUERY } from '../queries/get-preorder-metaobject-entry-by-handle';
import { PREORDER_METAOBJECT_DEFINITION_BY_TYPE_QUERY } from '../queries/get-preorder-metaobject-definition-by-type';
import { isDevelopment } from '../pdp-utility';

export default function CreatePreorder() {
  const { data } = useApi(TARGET);
  const productId = data.selected?.[0]?.id.replace("gid://shopify/Product/", "");
  const [isLoading, setIsLoading] = useState(false);

  const createPreorderMetaobject = async () => {
    // setIsLoading(true);

    // Check if the metaobject definition already exists
    gqlFetch({
      query: PREORDER_METAOBJECT_DEFINITION_BY_TYPE_QUERY,
      variables: {
        type: "dropdeck_preorder"
      }
    }, (data) => {
      const metaobjectDefinitionExists = data.metaobjectDefinitionByType;
      isDevelopment && console.log("Metaobject definition already exists:", data);
      
      if (data) {
        console.log("Metaobject definition already exists:", data);
      } else {
        console.log("Metaobject definition does not exist:", data);
      }
    });

    // gqlFetch({
    //   query: PREORDER_METAOBJECT_ENTRY_BY_HANDLE_QUERY,
    //   variables: {
    //     handle: {
    //       type: "dropdeck_preorder",
    //       handle: productId
    //     }
    //   }
    // }, (data) => {
    //   console.log("Searching for metaobject entry:", data, productId);
    // });
    
    // First check if the metaobject definition exists
    // gqlFetch({
    //   query: PREORDER_METAOBJECT_DEFINITION_CREATE_MUTATION,
    //   variables: PREORDER_METAOBJECT_DEFINITION_CREATE_VARIABLES
    // }, (createData) => {
    //   const metaobjectDefinitionAlreadyExists = createData.data.metaobjectDefinitionCreate.userErrors.find((error) => {
    //     return error.code === "TAKEN"
    //   });

    //   if (metaobjectDefinitionAlreadyExists) {
    //     console.log("Metaobject definition already exists:", createData);
    //   } else {
    //     console.log("Created metaobject definition:", createData);
    //   }
      
    //   // Now that we have the definition, we can create the metaobject
    //   gqlFetch({
    //     query: CREATE_PREORDER_METAOBJECT_ENTRY_QUERY,
    //     variables: {
    //       metaobject: {
    //         type: "dropdeck_preorder",
    //         handle: productId,
    //         fields: [
    //           {
    //             key: "release_date",
    //             value: "2024-06-01"
    //           },
    //           {
    //             key: "units_available",
    //             value: "100"
    //           }
    //         ]
    //       }
    //     }
    //   }, (metaobjectData) => {
    //     console.log("Created metaobject:", metaobjectData);
    //     setIsLoading(false);
    //   });
    // });
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