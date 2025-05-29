type SellingPlanGroupResponse = {
  data: {
    sellingPlanGroups: {
      edges: SellingPlanGroupEdge[];
    };
  };
  init: ResponseInit | null;
  type: string;
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
  };
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
    shop: {
      myshopifyDomain: string;
    };
    orders: {
      edges: [
        {
          node: {
            id: string;
            name: string;
            createdAt: string;
            displayFinancialStatus: string;
            displayFulfillmentStatus: string;
            cancelledAt: string | null;
            lineItems: {
              edges: [
                {
                  node: {
                    id: string;
                    title: string;
                    quantity: number;
                    sellingPlan: {
                      name: string;
                      sellingPlanId: string;
                    }
                    product: {
                      sellingPlanGroups: {
                        edges: [
                          {
                            node: {
                              appId: string;
                              sellingPlans: {
                                nodes: [
                                  {
                                    deliveryPolicy: {
                                      fulfillmentExactTime: string;
                                    };
                                    metafields: {
                                      edges: [
                                        {
                                          node: {
                                            key: string;
                                            value: string;
                                          };
                                        },
                                      ];
                                    };
                                  },
                                ];
                              };
                            };
                          },
                        ];
                      };
                    };
                  };
                },
              ];
            };
          };
        },
      ];
    };
  };
  extensions: {
    cost: {
      requestedQueryCost: 863;
      actualQueryCost: 17;
      throttleStatus: {
        maximumAvailable: 2000;
        currentlyAvailable: 1983;
        restoreRate: 100;
      };
    };
  };
};

type OrderProgress = "incomplete" | "partiallyComplete" | "complete";

type OrderTableRow = {
  id: string;
  order: string;
  customer: string;
  paymentStatus: {
    status: OrderProgress;
    label: string;
  };
  fulfillmentStatus: {
    status: OrderProgress;
    label: string;
  };
};

type OrderTableRows = OrderTableRow[];
