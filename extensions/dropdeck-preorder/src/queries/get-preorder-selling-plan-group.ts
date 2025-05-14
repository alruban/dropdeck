import { isDevelopment } from "../purchase-options-extension-action";
import { gqlFetch } from "../tools/gql-fetch";

const getPreorderSellingPlanGroup = (
  sellingPlanGroupId: string,
  foundCallback?: (sellingPlan: any) => void, 
  notFoundCallback?: (error: any) => void
) => {
  gqlFetch({
    query: `
      query sellingPlanGroups {
        sellingPlanGroup(id: $id) {
          id,
          name,
          merchantCode,
          appId,
          description,
          options,
          position,
          createdAt,
          sellingPlans(first: 1) {
            edges {
              node {
                id
              }
            }
          }
          productVariants(first: 1) {
            edges {
              node {
                id
              }
            }
          }
          summary,
          products(first: 1) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
    `,
    variables: {
      id: sellingPlanGroupId
    }
  }, (sellingPlanGroup) => {
    console.log("sellingPlanGroup", sellingPlanGroup);
    // Only process if we have actual data
    if (!sellingPlanGroup?.data) return; 
  
    const sellingPlanExists = sellingPlanGroup.data.sellingPlanGroup;
    
    if (sellingPlanExists) {
      isDevelopment && console.log("Metaobject definition exists:", sellingPlanExists);
      if (foundCallback) foundCallback(sellingPlanExists);
    } else {
      isDevelopment && console.log("Metaobject definition does not exist:", sellingPlanGroup);
      if (notFoundCallback) notFoundCallback(sellingPlanGroup);
    }
  });
}

export default getPreorderSellingPlanGroup;