const UPDATE_PRODUCT_SP_REQUIREMENT_MUTATION = `#graphql
  mutation UpdateProductSellingPlanRequirement($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product {
        id
        requiresSellingPlan
      }
      userErrors {
        field
        message
      }
    }
  }
`;

const updateProductSPRequirementVariables = (
  id: string,
  requiresSellingPlan: boolean
) => ({
  variables: {
    product: {
      id,
      requiresSellingPlan,
    },
  },
});

export { UPDATE_PRODUCT_SP_REQUIREMENT_MUTATION, updateProductSPRequirementVariables };
