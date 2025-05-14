import { isDevelopment } from "../purchase-options-extension-action";
import { gqlFetch } from "../tools/gql-fetch";

const getPreorderSellingPlan = (
  sellingPlanId: string,
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
          productVariantCount,
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
      id: sellingPlanId
    }
  }, (sellingPlan) => {
    console.log("sellingPlan", sellingPlan);
    // Only process if we have actual data
    if (!sellingPlan?.data) return; 
  
    const sellingPlanExists = sellingPlan.data.sellingPlanByType;
    
    if (sellingPlanExists) {
      isDevelopment && console.log("Metaobject definition exists:", sellingPlanExists);
      if (foundCallback) foundCallback(sellingPlanExists);
    } else {
      isDevelopment && console.log("Metaobject definition does not exist:", sellingPlan);
      if (notFoundCallback) notFoundCallback(sellingPlan);
    }
  });
}

export default getPreorderSellingPlan;