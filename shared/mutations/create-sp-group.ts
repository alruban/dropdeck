import { parseISOStringIntoFormalDate } from "../tools/date-tools";

const CREATE_SP_GROUP_MUTATION = `
  #graphql
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
`;

const createSPGroupVariables = (
  productIds: string[],
  expectedFulfillmentDate: string, // Format: "2025-06-01T00:00:00Z"
  unitsPerCustomer: number,
) => ({
  variables: {
    input: {
      name: "Dropdeck Preorder",
      description:
        unitsPerCustomer === 0
          ? `Expected to ship on or after ${parseISOStringIntoFormalDate(expectedFulfillmentDate)}`
          : `Expected to ship on or after ${parseISOStringIntoFormalDate(expectedFulfillmentDate)}, ${unitsPerCustomer} units per customer`,
      merchantCode: "Dropdeck Preorder",
      options: ["Dropdeck Preorder"],
      sellingPlansToCreate: [
        {
          name: "Preorder",
          options: ["Dropdeck Preorder"],
          category: "PRE_ORDER",
          description: `Expected to ship on or after ${parseISOStringIntoFormalDate(expectedFulfillmentDate)}`,
          billingPolicy: {
            fixed: {
              checkoutCharge: {
                type: "PERCENTAGE",
                value: {
                  percentage: 100,
                },
              },
              remainingBalanceChargeTrigger: "NO_REMAINING_BALANCE",
            },
          },
          deliveryPolicy: {
            fixed: {
              fulfillmentExactTime: expectedFulfillmentDate, // When fulfillment is expected
              fulfillmentTrigger: "EXACT_TIME",
            },
          },
          metafields: [
            {
              value: String(unitsPerCustomer),
              type: "number_integer",
              namespace: "dropdeck_preorder",
              key: "units_per_customer",
            },
          ],
        },
      ],
    },
    resources: {
      productIds: productIds,
    },
  },
});

export { CREATE_SP_GROUP_MUTATION, createSPGroupVariables };
