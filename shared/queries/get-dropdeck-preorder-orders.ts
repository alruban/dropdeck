const GET_DROPDECK_PREORDER_ORDERS_QUERY =
  `#graphql
  query getOrders($query: String!) {
    shop {
      myshopifyDomain
    }
    orders(first: 3, query: $query) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
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
                sellingPlan {
                  name
                  sellingPlanId
                }
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

const GET_DROPDECK_PREORDER_ORDERS_QUERY_AFTER =
  `#graphql
  query getOrders($query: String!, $after: String) {
    shop {
      myshopifyDomain
    }
    orders(first: 3, query: $query, after: $after) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
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
                sellingPlan {
                  name
                  sellingPlanId
                }
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

const GET_DROPDECK_PREORDER_ORDERS_QUERY_BEFORE =
  `#graphql
  query getOrders($query: String!, $before: String) {
    shop {
      myshopifyDomain
    }
    orders(first: 3, query: $query, before: $before) {
      pageInfo {
        hasNextPage
        hasPreviousPage
        startCursor
        endCursor
      }
      edges {
        cursor
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
                sellingPlan {
                  name
                  sellingPlanId
                }
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

const getDropdeckPreorderOrdersVariables = (before?: string | null, after?: string | null) => ({
  query: 'tag:"Dropdeck Preorder"',
  ...(after && { after }),
  ...(before && { before })
});

export {
  GET_DROPDECK_PREORDER_ORDERS_QUERY_BEFORE,
  GET_DROPDECK_PREORDER_ORDERS_QUERY,
  GET_DROPDECK_PREORDER_ORDERS_QUERY_AFTER,
  getDropdeckPreorderOrdersVariables,
};
