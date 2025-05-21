const ADD_SP_GROUP_PRODUCTS_MUTATION = `#graphql
  mutation sellingPlanGroupAddProducts($id: ID!, $productIds: [ID!]!) {
    sellingPlanGroupAddProducts(id: $id, productIds: $productIds) {
      sellingPlanGroup {
        id
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const addSPGroupProductsVariables = (
  id: string,
  productIds: string[]
) => ({
  variables: {
    id,
    productIds,
  },
});

export { ADD_SP_GROUP_PRODUCTS_MUTATION, addSPGroupProductsVariables };
