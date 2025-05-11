import { isDevelopment } from "../pdp-utility";
import { gqlFetch } from "../tools/gql-fetch";

const createPreorderMetaobjectDefinition = (
  createdCallback?: (metaobjectDefinition: any) => void
) => {
  gqlFetch({
    query: `
      mutation CreateMetaobjectDefinition($definition: MetaobjectDefinitionCreateInput!) {
        metaobjectDefinitionCreate(definition: $definition) {
          metaobjectDefinition {
            name
            type
            fieldDefinitions {
              name
              key
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
      definition: {
        name: "Dropdeck Preorder",
        type: "dropdeck_preorder",
        fieldDefinitions: [
          {
            name: "Release Date",
            key: "release_date",
            type: "date"
          },
          {
            name: "Units Available",
            key: "units_available",
            type: "number_integer"
          }
        ]
      }
    }
  }, (createMetaobjectDefinition) => {
    isDevelopment && console.log("Metaobject definition created:", createMetaobjectDefinition);
    if (createdCallback) createdCallback(createMetaobjectDefinition);
  });
}

export default createPreorderMetaobjectDefinition;
