const GET_DROPDECK_PREORDER_ORDERS_QUERY = `
  #graphql
  query getOrders($query: String!) {
    orders(first: 50, query: $query) {
      edges {
        node {
          id
          name
          displayFinancialStatus
          displayFulfillmentStatus
          lineItems(first: 250) {
            edges {
              node {
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