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

type OrderProgress = "incomplete" | "partiallyComplete" | "complete";

type OrderTableRow = {
  id: string;
  order: string;
  date: string;
  customer: string;
  total: string;
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
