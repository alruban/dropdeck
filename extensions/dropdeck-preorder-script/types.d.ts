declare global {
  interface Window {
    dropdeck?: {
      refresh: () => void;
    };
  }
}

type PSSellingPlanGroup = {
  node: {
    id: string;
    merchantCode: string;
    sellingPlans: {
      edges: PSSellingPlan[];
    };
  };
};

type PSSellingPlan = {
  node: {
    id: string;
    deliveryPolicy: {
      fulfillmentExactTime: string;
    };
    metafields: {
      edges: {
        node: {
          value: number;
        };
      }[];
    };
  };
};

type PSProductVariant = {
  node: {
    id: string;
    availableForSale: boolean;
    inventoryPolicy: string;
    inventoryQuantity: number;
  };
};

type PSProductVariantData = {
  productVariant: {
    product: {
      id: string;
      variants: {
        edges: PSProductVariant[];
      };
      sellingPlanGroupsCount: {
        count: number;
      };
      sellingPlanGroups: {
        edges: PSSellingPlanGroup[];
      };
    };
  };
};

interface PSPreorderResponse {
  data: {
    data: PSProductVariantData;
  };
  init: ResponseInit | null;
  type: string;
}
