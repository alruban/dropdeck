const REMOVE_SP_GROUP_PRODUCTS_MUTATION = `#graphql
  mutation sellingPlanGroupRemoveProducts($id: ID!, $productIds: [ID!]!) {
    sellingPlanGroupRemoveProducts(id: $id, productIds: $productIds) {
      removedProductIds
      userErrors {
        field
        message
      }
    }
  }
`;

const removeSPGroupProductsVariables = (
  id: string,
  productIds: string[]
) => ({
  variables: {
    id,
    productIds,
  },
});

export { REMOVE_SP_GROUP_PRODUCTS_MUTATION, removeSPGroupProductsVariables };
