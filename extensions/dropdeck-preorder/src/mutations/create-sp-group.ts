import { isDevelopment } from "../purchase-options-extension-action";
import { gqlFetch } from "../tools/gql-fetch";
import { parseISOStringIntoFormalDate } from '../../../../shared/tools/date-tools';

const createPreorderSellingPlanGroup = (
  productId: string,
  expectedFulfillmentDate: string, // Format: "2025-06-01T00:00:00Z"
  unitsPerCustomer: number,
  totalUnitsAvailable: number,
  createdCallback?: (metaobjectDefinition: any) => void
) => {
  gqlFetch({
    query: `
      mutation createSellingPlanGroup($input: SellingPlanGroupInput!, $resources: SellingPlanGroupResourceInput) {
        sellingPlanGroupCreate(input: $input, resources: $resources) {
          sellingPlanGroup {
            id
            description
            sellingPlans(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    variables: {
      input: {
        name: "Preorder",
        description: `Expected to ship on or after ${parseISOStringIntoFormalDate(expectedFulfillmentDate)}, ${unitsPerCustomer} units per customer, ${totalUnitsAvailable} units available.`,
        merchantCode: "Dropdeck Preorder",
        options: ["Preorder"],
        sellingPlansToCreate: [
          {
            name: "Preorder",
            options: ["Preorder"],
            category: "PRE_ORDER",
            description: `Expected to ship on or after ${parseISOStringIntoFormalDate(expectedFulfillmentDate)}`,
            billingPolicy: {
              fixed: {
                checkoutCharge: {
                  type: "PERCENTAGE",
                  value: {
                    percentage: 100
                  }
                },
                remainingBalanceChargeTrigger: "NO_REMAINING_BALANCE"
              },
            },
            deliveryPolicy: {
              fixed: {
                fulfillmentExactTime: expectedFulfillmentDate, // When fulfillment is expected
                fulfillmentTrigger: "EXACT_TIME"
              },
            },
            metafields: [
              {
                value: String(unitsPerCustomer),
                type: "number_integer",
                namespace: "dropdeck_preorder",
                key: "units_per_customer"
              },
              {
                value: String(totalUnitsAvailable),
                type: "number_integer",
                namespace: "dropdeck_preorder",
                key: "total_units_available"
              }
            ]
          }
        ]
      },
      resources: {
        productIds: [productId],
      }
    }
  }, (createPreorderSellingPlanGroup) => {
    isDevelopment && console.log("Selling plan created:", createPreorderSellingPlanGroup);
    if (createdCallback) createdCallback(createPreorderSellingPlanGroup);
  });
}

export default createPreorderSellingPlanGroup;
