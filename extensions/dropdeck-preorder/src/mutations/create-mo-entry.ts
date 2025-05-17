import { isDevelopment } from "../purchase-options-extension-action";
import { gqlFetch } from "../tools/gql-fetch";

const createPreorderMetaobjectEntry = (
  productId: string,
  createdCallback?: (
    metaobjectDefinition: any,
    defaultFields: {
      key: string,
      value: string | number
    }[]
  ) => void
) => {
  const today = new Date();
  const oneMonthFromToday = new Date(today.setMonth(today.getMonth() + 1));
  const defaultReleaseDate = oneMonthFromToday.toISOString().split('T')[0]; // This gives YYYY-MM-DD format
  const defaultUnitsAvailable = "0";

  const defaultFields = [
    {
      key: "release_date",
      value: defaultReleaseDate
    },
    {
      key: "units_available",
      value: defaultUnitsAvailable
    }
  ]

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
        fields: defaultFields
      }
    }
  }, (metaobjectData) => {
    isDevelopment && console.log("Created metaobject:", metaobjectData);
    if (createdCallback) createdCallback(metaobjectData, defaultFields);
  });
}

export default createPreorderMetaobjectEntry;
