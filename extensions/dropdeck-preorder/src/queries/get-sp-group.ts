import { isDevelopment } from "../purchase-options-extension-action";
import { gqlFetch } from "../tools/gql-fetch";
import { GET_SP_GROUP_QUERY, getSPGroupVariables } from "../../../../shared/queries/get-sp-group";

const getPreorderSellingPlanGroup = (
  sellingPlanGroupId: string,
  foundCallback?: (sellingPlan: any) => void,
  notFoundCallback?: (error: any) => void
) => {
  gqlFetch({
    query: GET_SP_GROUP_QUERY,
    variables: getSPGroupVariables(sellingPlanGroupId),
  }, (sellingPlanGroup) => {
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
