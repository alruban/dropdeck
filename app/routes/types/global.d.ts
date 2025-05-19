type SellingPlanGroupResponse = {
  sellingPlanGroups: {
    edges: SellingPlanGroupEdge[];
  };
};

type SellingPlanGroupEdge = {
  node: SellingPlanGroup;
};

type SellingPlanGroup = {
  id: string;
  name: string;
  merchantCode: string;
  productsCount: {
    count: number;
  }
  products: {
    edges: ProductEdge[];
  };
  sellingPlans: {
    edges: SellingPlanEdge[];
  };
};

type ProductEdge = {
  node: Product;
};

type Product = {
  id: string;
  title: string;
};

type SellingPlanEdge = {
  node: SellingPlan;
};

type SellingPlan = {
  id: string;
  name: string;
  options: string[];
  deliveryPolicy: DeliveryPolicy;
  metafields: {
    edges: MetafieldEdge[];
  };
};

type DeliveryPolicy = {
  fulfillmentExactTime: string;
};

type MetafieldEdge = {
  node: Metafield;
};

type Metafield = {
  key: string;
  value: string;
};

type OrderTableRawData = {
  data: {
    orders: {
      edges: {
        node: {
          id: string;
          name: string;
          displayFinancialStatus: string;
          displayFulfillmentStatus: string;
          cancelledAt: boolean;
          lineItems: {
            edges: {
              node: {
                title: string;
                quantity: number;
                customAttributes: {
                  key: string;
                  value: string;
                }[];
              };
            }[];
          };
        };
      }[];
    };
  };
  extensions: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
    search: {
      path: string[];
      query: string;
      parsed: {
        and: {
          field: string;
          match_all: string;
        }[];
      };
    }[];
  };
};

type OrderProgress = "incomplete" | "partiallyComplete" | "complete";

type OrderTableRow = {
  id: string;
  order: string;
  customer: string;
  paymentStatus: {
    status: OrderProgress,
    label: string
  },
  fulfillmentStatus: {
    status: OrderProgress,
    label: string
  }
}

type OrderTableRows = OrderTableRow[];

