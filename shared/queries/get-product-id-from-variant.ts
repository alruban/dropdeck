export type GetProductIdFromVariantResponse = {
  data: {
    productVariant: {
      product: {
        id: string;
      };
    };
  };
};

const GET_PRODUCT_ID_FROM_VARIANT_QUERY = `#graphql
  query GetProductIdFromVariant($id: ID!) {
    productVariant (id: $id) {
      product {
        id
      }
    }
  }
`;

export { GET_PRODUCT_ID_FROM_VARIANT_QUERY };
