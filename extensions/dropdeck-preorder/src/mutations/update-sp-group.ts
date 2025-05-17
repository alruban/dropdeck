import { isDevelopment } from "../purchase-options-extension-action";
import { gqlFetch } from "../tools/gql-fetch";
import { UPDATE_SP_GROUP_MUTATION, updateSPGroupVariables } from "../../../../shared/mutations/update-sp-group";

const updatePreorderSellingPlanGroup = (
  sellingPlanGroupId: string,
  sellingPlanId: string,
  expectedFulfillmentDate: string, // Format: "2025-06-01T00:00:00Z"
  unitsPerCustomer: number,
  totalUnitsAvailable: number,
  createdCallback?: (metaobjectDefinition: any) => void
) => {
  gqlFetch({
    query: UPDATE_SP_GROUP_MUTATION,
    variables: updateSPGroupVariables(sellingPlanGroupId, sellingPlanId, expectedFulfillmentDate, unitsPerCustomer, totalUnitsAvailable),
  }, (updatePreorderSellingPlanGroup) => {
    isDevelopment && console.log("Selling plan updated:", updatePreorderSellingPlanGroup);
    if (createdCallback) createdCallback(updatePreorderSellingPlanGroup);
  });
}

export default updatePreorderSellingPlanGroup;
