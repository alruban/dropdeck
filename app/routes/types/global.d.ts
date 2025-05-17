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
