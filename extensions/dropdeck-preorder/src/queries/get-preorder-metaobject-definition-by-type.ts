import { isDevelopment } from "../purchase-options-extension-action";
import { gqlFetch } from "../tools/gql-fetch";

const checkPreorderMetaobjectDefinitionExists = (
  foundCallback?: (metaobjectDefinition: any) => void, 
  notFoundCallback?: (error: any) => void
) => {
  gqlFetch({
    query: `
      query($type: String!) {
        metaobjectDefinitionByType(type: $type) {
          type
        }
      }
    `,
    variables: {
      type: "dropdeck_preorder"
    }
  }, (metaobjectDefinition) => {
    // Only process if we have actual data
    if (!metaobjectDefinition?.data) return; 
  
    const metaobjectDefinitionExists = metaobjectDefinition.data.metaobjectDefinitionByType;
    
    if (metaobjectDefinitionExists) {
      isDevelopment && console.log("Metaobject definition exists:", metaobjectDefinitionExists);
      if (foundCallback) foundCallback(metaobjectDefinitionExists);
    } else {
      isDevelopment && console.log("Metaobject definition does not exist:", metaobjectDefinition);
      if (notFoundCallback) notFoundCallback(metaobjectDefinition);
    }
  });
}

export default checkPreorderMetaobjectDefinitionExists;