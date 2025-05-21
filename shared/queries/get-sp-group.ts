type GetSPGroupResponse = {
  data: {
    sellingPlanGroup: {
      id: string,
      productsCount: {
        count: number
      },
      products: {
        edges: {
          node: {
            id: string,
            title: string
          }
        }[]
      },
      sellingPlans: {
        edges: {
          node: {
            id: string,
            deliveryPolicy: {
              fulfillmentExactTime: string
            },
            metafields: {
              edges: {
                node: {
                  key: string,
                  value: string
                }
              }[]
            }
          }
        }[]
      }
    }
  },
  extensions: {
    cost: {
      requestedQueryCost: number,
      actualQueryCost: number,
      throttleStatus: {
        maximumAvailable: number,
        currentlyAvailable: number,
        restoreRate: number
      }
    }
  }
}

const GET_SP_GROUP_QUERY =
`#graphql
  query sellingPlanGroups($id: ID!) {
    sellingPlanGroup(id: $id) {
      id
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
            metafields(first: 1, namespace: "dropdeck_preorder") {
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
`;

const getSPGroupVariables = (
  sellingPlanGroupId: string
) => ({
  variables: {
    id: sellingPlanGroupId
  }
});

export { GET_SP_GROUP_QUERY, getSPGroupVariables, GetSPGroupResponse };