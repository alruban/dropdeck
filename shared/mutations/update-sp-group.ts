import { parseISOStringIntoFormalDate } from "../tools/date-tools";

const UPDATE_SP_GROUP_MUTATION = `
  #graphql
  mutation sellingPlanGroupUpdate($id: ID!, $input: SellingPlanGroupInput!) {
    sellingPlanGroupUpdate(id: $id, input: $input) {
      sellingPlanGroup {
        id
        description
        sellingPlans(first: 1) {
          edges {
            node {
              id
              deliveryPolicy {
                ... on SellingPlanFixedDeliveryPolicy {
                  fulfillmentExactTime
                }
              }
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
`;

const updateSPGroupVariables = (
  sellingPlanGroupId: string,
  sellingPlanId: string,
  expectedFulfillmentDate: string, // Format: "2025-06-01T00:00:00Z"
  unitsPerCustomer: number,
  totalUnitsAvailable: number,
) => ({
  id: sellingPlanGroupId,
  input: {
    name: "Preorder",
    description: `Expected to ship on or after ${parseISOStringIntoFormalDate(expectedFulfillmentDate)}, ${unitsPerCustomer} units per customer, ${totalUnitsAvailable} units available.`,
    merchantCode: "Dropdeck Preorder",
    options: ["Preorder"],
    sellingPlansToUpdate: [
      {
        id: sellingPlanId,
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
  }
});

export { UPDATE_SP_GROUP_MUTATION, updateSPGroupVariables };