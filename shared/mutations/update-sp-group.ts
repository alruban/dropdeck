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
  expectedFulfillmentDate: string, // Format: "2025-06-01T00:00:00Z"
  unitsPerCustomer: number,
  descriptionForPlanWithNoUnitRestriction: string,
  descriptionForPlanWithUnitRestriction: string
) => {
  // Storing the preorder details in the option fields so they can be used on the front end without fetching...
  const option = `${expectedFulfillmentDate}|${unitsPerCustomer}`;

  return {
    variables: {
      id: sellingPlanGroupId,
      input: {
        appId: "DROPDECK_PREORDER",
        description:
          unitsPerCustomer === 0
            ? descriptionForPlanWithNoUnitRestriction
            : descriptionForPlanWithUnitRestriction,
        merchantCode: "Dropdeck Preorder", // Merchant Facing
        name: "Preorder", // Buyer Facing
        // position: X,
        options: [option],
        // sellingPlansToCreate: X
        // sellingPlansToDelete: X
        sellingPlansToUpdate: [
          {
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
            category: "PRE_ORDER",
            deliveryPolicy: {
              fixed: {
                fulfillmentExactTime: expectedFulfillmentDate, // When fulfillment is expected
                fulfillmentTrigger: "EXACT_TIME",
              },
            },
            description: descriptionForPlanWithNoUnitRestriction, // Buyer Facing
            id: sellingPlanId,
            inventoryPolicy: {
              reserve: "ON_SALE", // Reduces inventory when the item is sold, rather than fulfilled (ON_FULFILLMENT)
            },
            metafields: [
              {
                value: String(unitsPerCustomer),
                type: "number_integer",
                namespace: "dropdeck_preorder",
                key: "units_per_customer",
              },
            ],
            name: "Preorder", // Buyer Facing
            options: [option],
            // position: X
            // pricingPolicies: X
          },
        ],
      },
    },
  };
};

export {
  UPDATE_SP_GROUP_MUTATION,
  updateSPGroupVariables,
  UpdateSPGroupResponse,
};
