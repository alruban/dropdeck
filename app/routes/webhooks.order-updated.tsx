import { data } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

type OrderUpdated = {
  id: number;
  admin_graphql_api_id: string;
  app_id: number;
  browser_ip: string;
  buyer_accepts_marketing: boolean;
  cancel_reason: string | null;
  cancelled_at: string | null;
  cart_token: string;
  checkout_id: number;
  checkout_token: string;
  client_details: {
    accept_language: string;
    browser_height: number | null;
    browser_ip: string;
    browser_width: number | null;
    session_hash: string | null;
    user_agent: string;
  };
  closed_at: string | null;
  company: string | null;
  confirmation_number: string;
  confirmed: boolean;
  contact_email: string;
  created_at: string;
  currency: string;
  current_shipping_price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  current_subtotal_price: string;
  current_subtotal_price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  current_total_additional_fees_set: null;
  current_total_discounts: string;
  current_total_discounts_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  current_total_duties_set: null;
  current_total_price: string;
  current_total_price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  current_total_tax: string;
  current_total_tax_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  customer_locale: string;
  device_id: string | null;
  discount_codes: any[];
  duties_included: boolean;
  email: string;
  estimated_taxes: boolean;
  financial_status: string;
  fulfillment_status: string | null;
  landing_site: string;
  landing_site_ref: string | null;
  location_id: string | null;
  merchant_business_entity_id: string;
  merchant_of_record_app_id: string | null;
  name: string;
  note: string | null;
  note_attributes: any[];
  number: number;
  order_number: number;
  original_total_additional_fees_set: null;
  original_total_duties_set: null;
  payment_gateway_names: string[];
  po_number: string | null;
  presentment_currency: string;
  processed_at: string;
  reference: string | null;
  referring_site: string;
  source_identifier: string | null;
  source_name: string;
  source_url: string | null;
  subtotal_price: string;
  subtotal_price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  tags: string;
  tax_exempt: boolean;
  tax_lines: any[];
  taxes_included: boolean;
  test: boolean;
  token: string;
  total_cash_rounding_payment_adjustment_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_cash_rounding_refund_adjustment_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_discounts: string;
  total_discounts_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_line_items_price: string;
  total_line_items_price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_outstanding: string;
  total_price: string;
  total_price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_shipping_price_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_tax: string;
  total_tax_set: {
    shop_money: { amount: string; currency_code: string };
    presentment_money: { amount: string; currency_code: string };
  };
  total_tip_received: string;
  total_weight: number;
  updated_at: string;
  user_id: string | null;
  billing_address: {
    province: string;
    country: string;
    country_code: string;
    province_code: string;
  };
  customer: {
    id: number;
    email: string;
    created_at: string;
    updated_at: string;
    state: string;
    note: string;
    verified_email: boolean;
    multipass_identifier: string | null;
    tax_exempt: boolean;
    currency: string;
    tax_exemptions: any[];
    admin_graphql_api_id: string;
    default_address: {
      id: number;
      customer_id: number;
      company: string | null;
      province: string;
      country: string;
      province_code: string;
      country_code: string;
      country_name: string;
      default: boolean;
    };
  };
  discount_applications: any[];
  fulfillments: any[];
  line_items: Array<{
    id: number;
    admin_graphql_api_id: string;
    attributed_staffs: any[];
    current_quantity: number;
    fulfillable_quantity: number;
    fulfillment_service: string;
    fulfillment_status: string | null;
    gift_card: boolean;
    grams: number;
    name: string;
    price: string;
    price_set: any;
    product_exists: boolean;
    product_id: number;
    properties: any[];
    quantity: number;
    requires_shipping: boolean;
    sales_line_item_group_id: string | null;
    sku: string;
    taxable: boolean;
    title: string;
    total_discount: string;
    total_discount_set: any;
    variant_id: number;
    variant_inventory_management: string | null;
    variant_title: string;
    vendor: string;
    tax_lines: any[];
    duties: any[];
    discount_allocations: any[];
  }>;
  payment_terms: any | null;
  refunds: Array<{
    id: number;
    admin_graphql_api_id: string;
    created_at: string;
    note: string | null;
    order_id: number;
    processed_at: string;
    restock: boolean;
    total_duties_set: any;
    user_id: number;
    order_adjustments: any[];
    transactions: any[];
    refund_line_items: any[];
    duties: any[];
  }>;
  shipping_address: {
    province: string;
    country: string;
    country_code: string;
    province_code: string;
  };
  shipping_lines: Array<{
    id: number;
    carrier_identifier: string | null;
    code: string;
    current_discounted_price_set: any;
    discounted_price: string;
    discounted_price_set: any;
    is_removed: boolean;
    phone: string | null;
    price: string;
    price_set: any;
    requested_fulfillment_service_id: string | null;
    source: string;
    title: string;
    tax_lines: any[];
    discount_allocations: any[];
  }>;
  returns: any[];
};

type OrderSellingGroupPlanIdMetafieldResponse = {
  data: {
    order: {
      metafield: {
        key: string;
        value: string;
      } | null;
    };
  };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { shop, topic, payload, session, admin } = await authenticate.webhook(request);
  console.log(`Received ${topic} webhook for ${shop}`);

  if (!session) return data({ success: true });

  const orderId = (payload as OrderUpdated).id;

  // Check to see if the order has a preorder metafield
  const orderSellingGroupPlanIdMetafieldRequest = await admin?.graphql(
    `
    #graphql
      query orderSellingGroupPlanId($id: ID!) {
        order(id: $id) {
          metafield(namespace: "dropdeck", key: "selling_plan_group_id") {
            key
            value
          }
        }
      }
    `,
    {
      variables: {
        id: `gid://shopify/Order/${orderId}`,
      },
    },
  );

  const orderSellingGroupPlanIdMetafield = await orderSellingGroupPlanIdMetafieldRequest.json() as OrderSellingGroupPlanIdMetafieldResponse;

  // Has no preorder metafield, means it doesn't contain a preorder item, or that someone removed it.
  if (!orderSellingGroupPlanIdMetafield.data.order.metafield) {
    return data({ success: true });
  }

  // Parse the order data
  // Check if any line items are preorders
  const alreadyTagged = (payload as OrderUpdated).tags.includes("Dropdeck Preorder");
  console.log("ALREADY TAGGED?", payload.tags);

  if (!alreadyTagged) {
    const response = await admin.graphql(
      `
        mutation orderUpdate($input: OrderInput!) {
          orderUpdate(input: $input) {
            order {
              id
              tags
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      {
        variables: {
          input: {
            id: `gid://shopify/Order/${orderId}`,
            tags: [...((payload as OrderUpdated).tags || []), "Dropdeck Preorder"],
          },
        },
      },
    );

    const responseJson = await response.json();

    if (responseJson.data?.orderUpdate?.userErrors?.length > 0) {
      console.error(
        "Error updating order:",
        responseJson.data.orderUpdate.userErrors,
      );
      return data({ error: "Failed to update order" }, { status: 500 });
    }
  }

  return data({ success: true });
};

// Add default export to ensure Remix recognizes this as a route
export default function Webhook() {
  return null;
}
