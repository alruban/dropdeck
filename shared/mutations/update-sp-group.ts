import { parseISOStringIntoFormalDate } from "../tools/date-tools";

type UpdateSPGroupResponse = {
  data: {
    sellingPlanGroupUpdate: {
      sellingPlanGroup: {
        id: string;
        description: string;
        productsCount: { count: number };
        products: {
          edges: [
            {
              node: {
                id: string;
                title: string;
              };
            },
          ];
        };
        sellingPlans: {
          edges: {
            node: {
              id: string;
              deliveryPolicy: {
                fulfillmentExactTime: string;
              };
            };
          }[];
        };
      };
      userErrors: [];
    };
  };
  extensions: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
};

const UPDATE_SP_GROUP_MUTATION = `#graphql
  mutation sellingPlanGroupUpdate($id: ID!, $input: SellingPlanGroupInput!) {
    sellingPlanGroupUpdate(id: $id, input: $input) {
      sellingPlanGroup {
        id
        description
        productsCount {
          count
        }
        products(first: 250) {
          edges {
            node {
              id
              title
            }
          }
        }
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
  productIds: string[],
  expectedFulfillmentDate: string, // Format: "2025-06-01T00:00:00Z"
  unitsPerCustomer: number,
) => ({
  variables: {
    id: sellingPlanGroupId,
    input: {
      name: "Dropdeck Preorder",
      description:
        unitsPerCustomer === 0
          ? `Expected to ship on or after ${parseISOStringIntoFormalDate(expectedFulfillmentDate)}`
          : `Expected to ship on or after ${parseISOStringIntoFormalDate(expectedFulfillmentDate)}, ${unitsPerCustomer} units per customer`,
      merchantCode: "Dropdeck Preorder",
      options: ["Dropdeck Preorder"],
      sellingPlansToUpdate: [
        {
          id: sellingPlanId,
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

export { UPDATE_SP_GROUP_MUTATION, updateSPGroupVariables, UpdateSPGroupResponse };
