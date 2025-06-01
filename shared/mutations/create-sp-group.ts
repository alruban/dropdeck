type CreateSPGroupResponse = {
  data: {
    sellingPlanGroupCreate: {
      sellingPlanGroup: {
        id: string;
        description: string;
        sellingPlans: {
          edges: [{ node: { id: string } }];
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

const CREATE_SP_GROUP_MUTATION = `#graphql
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
  descriptionForPlanWithNoUnitRestriction: string,
  descriptionForPlanWithUnitRestriction: string
) => {
  // Storing the preorder details in the option fields so they can be used on the front end without fetching...
  const option = `${expectedFulfillmentDate}|${unitsPerCustomer}`;

  return {
    variables: {
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
        sellingPlansToCreate: [
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
            // id: X
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
        // sellingPlansToDelete: X
        // sellingPlansToUpdate: X
      },
      resources: {
        productIds: productIds,
      },
    },
  };
};

export {
  CREATE_SP_GROUP_MUTATION,
  createSPGroupVariables,
  CreateSPGroupResponse,
};
