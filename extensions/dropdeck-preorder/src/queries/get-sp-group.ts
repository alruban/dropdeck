import { isDevelopment } from "../purchase-options-extension-action";
import { gqlFetch } from "../tools/gql-fetch";

const getPreorderSellingPlanGroup = (
  sellingPlanGroupId: string,
  foundCallback?: (sellingPlan: any) => void,
  notFoundCallback?: (error: any) => void
) => {
  gqlFetch({
    query: `
      query sellingPlanGroups($id: ID!) {
        sellingPlanGroup(id: $id) {
          id
          sellingPlans(first: 1) {
            edges {
              node {
                id
                deliveryPolicy {
                  ... on SellingPlanFixedDeliveryPolicy {
                    fulfillmentExactTime
                  }
                }
                metafields(first: 2, namespace: "dropdeck_preorder") {
                  edges {
                    node {
                      key
                      value
                    }
                  }
                }
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
      isDevelopment && console.log("Selling plan group exists:", sellingPlanExists);
      if (foundCallback) foundCallback(sellingPlanExists);
    } else {
      isDevelopment && console.log("Selling plan group does not exist:", sellingPlanGroup);
      if (notFoundCallback) notFoundCallback(sellingPlanGroup);
    }
  });
}

export default getPreorderSellingPlanGroup;
