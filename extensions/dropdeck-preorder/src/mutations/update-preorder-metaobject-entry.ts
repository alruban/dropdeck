import { isDevelopment } from "../purchase-options-extension-action";
import { gqlFetch } from "../tools/gql-fetch";

const updatePreorderMetaobjectEntry = (
  metaobjectEntryId: string,
  updatedFields: {
    key: string,
    value: string | number
  }[],
  createdCallback?: (
    metaobjectDefinition: any, 
  ) => void
) => {
  // Now that we have the definition, we can create the metaobject
  gqlFetch({
    query: `
      mutation UpdateMetaobject($id: ID!, $metaobject: MetaobjectUpdateInput!) {
        metaobjectUpdate(id: $id, metaobject: $metaobject) {
          metaobject {
            handle
            season: field(key: "season") {
              value
            }
          }
          userErrors {
            field
            message
            code
          }
        }
      }
    `,
    variables: {
      id: metaobjectEntryId,
      metaobject: {
        fields: updatedFields
      }
    }
  }, (metaobjectData) => {
    isDevelopment && console.log("Updated metaobject:", metaobjectData);
    if (createdCallback) createdCallback(metaobjectData);
  });
}

export default updatePreorderMetaobjectEntry;