export type GetShopResponse = {
  data: {
    shop: {
      myshopifyDomain: string;
    }
  }
};

const GET_SHOP_QUERY =
`#graphql
  query {
    shop {
      myshopifyDomain
    }
  }
`;

export { GET_SHOP_QUERY };