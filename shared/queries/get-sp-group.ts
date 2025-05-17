const GET_SP_GROUP_QUERY = `
  #graphql
  query sellingPlanGroups($id: ID!) {
    sellingPlanGroup(id: $id) {
      id
      sellingPlans(first: 1) {
        edges {
          node {
            id
            deliveryPolicy {
              ... on SellingPlanFixedDeliveryPolicy {
                fulfillmentExactTime
              }
            }
            metafields(first: 2, namespace: "dropdeck_preorder") {
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
  id: sellingPlanGroupId
});

export { GET_SP_GROUP_QUERY, getSPGroupVariables };