import { isDevelopment } from "../purchase-options-extension-action";
import { gqlFetch } from "../tools/gql-fetch";
import { CREATE_SP_GROUP_MUTATION, createSPGroupVariables } from "../../../../shared/mutations/create-sp-group";

const createPreorderSellingPlanGroup = (
  productIds: string[],
  expectedFulfillmentDate: string, // Format: "2025-06-01T00:00:00Z"
  unitsPerCustomer: number,
  totalUnitsAvailable: number,
  createdCallback?: (metaobjectDefinition: any) => void
) => {
  gqlFetch({
    query: CREATE_SP_GROUP_MUTATION,
    variables: createSPGroupVariables(productIds, expectedFulfillmentDate, unitsPerCustomer, totalUnitsAvailable),
  }, (createPreorderSellingPlanGroup) => {
    isDevelopment && console.log("Selling plan created:", createPreorderSellingPlanGroup);
    if (createdCallback) createdCallback(createPreorderSellingPlanGroup);
  });
}

export default createPreorderSellingPlanGroup;
