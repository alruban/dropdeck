export type GetShopResponse = {
  data: {
    shop: {
      myshopifyDomain: string;
    }
  },
  extensions: {
    cost: {
      requestedQueryCost: number,
      actualQueryCost: number,
      throttleStatus: {
        maximumAvailable: number,
        currentlyAvailable: number,
        restoreRate: number
      }
    }
  }
};

const GET_SHOP_QUERY = `
  #graphql
  query {
    shop {
      myshopifyDomain
    }
  }
`;

export { GET_SHOP_QUERY };