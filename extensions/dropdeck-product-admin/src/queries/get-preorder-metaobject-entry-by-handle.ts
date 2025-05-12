import { isDevelopment } from "../pdp-utility";
import { gqlFetch } from "../tools/gql-fetch";

// https://shopify.dev/docs/api/admin-graphql/latest/queries/metaobjectByHandle

const checkPreorderMetaobjectEntryExists = (
  productId: string,
  foundCallback?: (metaobjectDefinition: any) => void, 
  notFoundCallback?: (error: any) => void
) => {
  gqlFetch({
    query: `
      query($handle: MetaobjectHandleInput!) {
        metaobjectByHandle(handle: $handle) {
          handle
          type
          id
          fields {
            key
            value
          }
        }
      }
    `,
    variables: {
      handle: {
        type: "dropdeck_preorder",
        handle: productId
      }
    }
  }, (metaobjectEntry) => {
    // Only process if we have actual data
    if (!metaobjectEntry?.data) return; 

    const metaobjectEntryExists = metaobjectEntry.data.metaobjectByHandle;
    
    if (metaobjectEntryExists) {
      isDevelopment && console.log("Metaobject entry exists:", metaobjectEntryExists);
      if (foundCallback) foundCallback(metaobjectEntry);
    } else {
      isDevelopment && console.log("Metaobject entry does not exist:", metaobjectEntry);
      if (notFoundCallback) notFoundCallback(metaobjectEntry);
    }
  });
}

export default checkPreorderMetaobjectEntryExists;