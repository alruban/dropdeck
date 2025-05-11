import { gqlFetch } from "../tools/gql-fetch";

const createPreorderMetaobjectEntry = (
  productId: string,
  createdCallback?: (metaobjectDefinition: any) => void
) => {
  // Now that we have the definition, we can create the metaobject
  gqlFetch({
    query: `
      mutation CreateMetaobject($metaobject: MetaobjectCreateInput!) {
        metaobjectCreate(metaobject: $metaobject) {
          metaobject {
            handle
            type
            fields {
              key
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
      metaobject: {
        type: "dropdeck_preorder",
        handle: productId,
        fields: [
          {
            key: "release_date",
            value: "2024-06-01"
          },
          {
            key: "units_available",
            value: "100"
          }
        ]
      }
    }
  }, (metaobjectData) => {
    console.log("Created metaobject:", metaobjectData);
    if (createdCallback) createdCallback(metaobjectData);
  });
}

export default createPreorderMetaobjectEntry;