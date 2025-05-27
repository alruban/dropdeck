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
            id: "gid://shopify/Order/6379934482709";
            name: "#1044";
            createdAt: "2025-05-26T16:51:43Z";
            displayFinancialStatus: "PAID";
            displayFulfillmentStatus: "SCHEDULED";
            cancelledAt: null;
            lineItems: {
              edges: [
                {
                  node: {
                    id: "gid://shopify/LineItem/15710276419861";
                    title: "Orange Snowboard";
                    quantity: 1;
                    product: {
                      sellingPlanGroups: {
                        edges: [
                          {
                            node: {
                              appId: "DROPDECK_PREORDER";
                              sellingPlans: {
                                nodes: [
                                  {
                                    deliveryPolicy: {
                                      fulfillmentExactTime: "2025-05-26T23:00:00Z";
                                    };
                                    metafields: {
                                      edges: [
                                        {
                                          node: {
                                            key: "units_per_customer";
                                            value: "2";
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
