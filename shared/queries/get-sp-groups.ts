const GET_SP_GROUPS_QUERY = `
  #graphql
  query {
    sellingPlanGroups(first: 50) {
      edges {
        node {
          id
          name
          merchantCode
          productsCount {
            count
          }
          products(first: 1) {
            edges {
              node {
                id
                title
              }
            }
          }
          sellingPlans(first: 10) {
            edges {
              node {
                id
                name
                options
                deliveryPolicy {
                  ... on SellingPlanFixedDeliveryPolicy {
                    fulfillmentExactTime
                  }
                }
                metafields(first: 10, namespace: "dropdeck_preorder") {
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
    }
  }
`;

export { GET_SP_GROUPS_QUERY };