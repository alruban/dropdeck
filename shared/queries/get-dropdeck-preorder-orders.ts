const GET_DROPDECK_PREORDER_ORDERS_QUERY =
  `#graphql
  query getOrders($query: String!) {
    shop {
      myshopifyDomain
    }
    orders(first: 50, query: $query) {
      edges {
        node {
          id
          name
          createdAt
          displayFinancialStatus
          displayFulfillmentStatus
          cancelledAt
          lineItems(first: 30) {
            edges {
              node {
                id
                title
                quantity
                product {
                  sellingPlanGroups(first: 3) {
                    edges {
                      node {
                        appId
                        sellingPlans(first: 1) {
                          nodes {
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
                }
              }
            }
          }
        }
      }
    }
  }
`;

const getDropdeckPreorderOrdersVariables = () => ({
  query: 'tag:"Dropdeck Preorder"',
});

export {
  GET_DROPDECK_PREORDER_ORDERS_QUERY,
  getDropdeckPreorderOrdersVariables,
};
