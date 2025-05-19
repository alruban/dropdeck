const GET_DROPDECK_PREORDER_ORDERS_QUERY = `
  #graphql
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
          lineItems(first: 250) {
            edges {
              node {
                id
                title
                quantity
                customAttributes {
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

const getDropdeckPreorderOrdersVariables = () => ({
  query: "tag:\"Dropdeck Preorder\""
});

export { GET_DROPDECK_PREORDER_ORDERS_QUERY, getDropdeckPreorderOrdersVariables };