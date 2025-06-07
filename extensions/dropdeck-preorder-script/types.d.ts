export declare global {
  interface Window {
    dropdeck: {
      settings: {
        display_release_date: boolean;
        display_unit_restriction: boolean;
      };
      translations: {
        fatal_error: string;
        limit_per_customer: string;
        release_date: string;
        limit_exceeded: string;
        added_capitalised: string;
        added_lowercase: string;
      }
      refresh?: () => void;
    }
  }
}

export type PSSellingPlanGroup = {
  node: {
    id: string;
    appId: string;
    sellingPlans: {
      edges: PSSellingPlan[];
    };
  };
};

export type PSSellingPlan = {
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

export type PSProductVariant = {
  node: {
    id: string;
    availableForSale: boolean;
    inventoryPolicy: string;
    inventoryQuantity: number;
  };
};

export type PSProductVariantData = {
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

type PSPreorderResponse = {
  data: {
    data: PSProductVariantData;
  };
  init: ResponseInit | null;
  type: string;
}
