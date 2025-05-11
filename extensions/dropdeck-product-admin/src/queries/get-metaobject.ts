export const GET_METAOBJECT_QUERY = `
  query GetPreorderMetaobject($productId: ID!) {
    metaobjects(first: 1, type: "preorder_settings", filter: {
      field: "product_id", value: $productId
    }) {
      edges {
        node {
          id
          fields {
            key
            value
          }
        }
      }
    }
  }
`;