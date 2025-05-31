import { type ActionFunctionArgs, data, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation, useSubmit, useSearchParams, useActionData } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  InlineStack,
  Button,
  Text,
  Checkbox,
  BlockStack,
  Select,
  Pagination,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "../hooks/useTranslation";
import OrderTable from "./components/order-table";
import { authenticate } from "../shopify.server";
import { getDropdeckPreorderOrdersVariables, GET_DROPDECK_PREORDER_ORDERS_QUERY, GET_DROPDECK_PREORDER_ORDERS_QUERY_BEFORE, GET_DROPDECK_PREORDER_ORDERS_QUERY_AFTER } from "@shared/queries/get-dropdeck-preorder-orders";
import { useCallback, useMemo, useEffect, useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(GET_DROPDECK_PREORDER_ORDERS_QUERY, {
    variables: getDropdeckPreorderOrdersVariables(),
  });

  return data(await response.json());
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  if (!admin) return new Response();

  const formData = await request.formData();
  const target = formData.get('target');

  let response;

  switch (target) {
    case "before":
      const before = formData.get('before');
      response = await admin.graphql(GET_DROPDECK_PREORDER_ORDERS_QUERY_BEFORE, {
        variables: getDropdeckPreorderOrdersVariables(before as string)
      });
      break;

    case "after":
      const after = formData.get('after');
      response = await admin.graphql(GET_DROPDECK_PREORDER_ORDERS_QUERY_AFTER, {
        variables: getDropdeckPreorderOrdersVariables(null, after as string)
      });
      break;
  }

  return data(await response?.json());
};

export default function Index() {
  const { data: loaderData } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [data, setData] = useState(loaderData as OrderTableRawData);

  // Update data when loader data or action data changes
  useEffect(() => {
    if (actionData) {
      setData(actionData.data as OrderTableRawData);
    } else {
      setData(loaderData as OrderTableRawData);
    }
  }, [loaderData, actionData]);

  // Set default values on first load
  useEffect(() => {
    const newParams = new URLSearchParams(searchParams);
    let hasChanges = false;

    if (!searchParams.has("hideCancelled")) {
      newParams.set("hideCancelled", "false");
      hasChanges = true;
    }
    if (!searchParams.has("hideFulfilled")) {
      newParams.set("hideFulfilled", "false");
      hasChanges = true;
    }
    if (!searchParams.has("showRowColors")) {
      newParams.set("showRowColors", "true");
      hasChanges = true;
    }
    if (!searchParams.has("product")) {
      newParams.set("product", "");
      hasChanges = true;
    }

    if (hasChanges) {
      setSearchParams(newParams);
    }
  }, []); // Empty dependency array means this runs once on mount

  // Extract unique products from orders
  const productOptions = useMemo(() => {
    const products = new Set<string>();
    data.data.orders.edges.forEach(( order ) => {
      order.node.lineItems.edges.forEach((lineItem) => {
        // Check if this line item has preorder data
        const hasPreorderData = lineItem.node.product.sellingPlanGroups.edges.some(
          (sellingPlanGroup) => sellingPlanGroup.node.appId === "DROPDECK_PREORDER"
        );
        if (hasPreorderData) {
          products.add(lineItem.node.title);
        }
      });
    });
    return [
      { label: t("orders.settings.filters.preorder_products.options.all_products"), value: "" },
      ...Array.from(products).map(title => ({ label: title, value: title }))
    ];
  }, [data]);

  const updateSetting = useCallback((key: string, value: string | boolean) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === "" || value === false) {
      newParams.delete(key);
    } else {
      newParams.set(key, value.toString());
    }
    setSearchParams(newParams);
    // Clear selections when any setting changes
    setSelectedResources([]);
  }, [searchParams, setSearchParams]);

  const handleRefresh = useCallback(() => {
    // Create a new FormData with all current search params
    const formData = new FormData();
    searchParams.forEach((value, key) => {
      formData.append(key, value);
    });
    submit(formData, { method: "get" });
  }, [searchParams, submit]);

  const settings = {
    hideCancelled: searchParams.get("hideCancelled") === "true",
    hideFulfilled: searchParams.get("hideFulfilled") === "true",
    showRowColors: searchParams.get("showRowColors") === "true",
    selectedProduct: searchParams.get("product") || "",
  };

  return (
    <Page>
      <TitleBar title={t("orders.title")} />
      <Layout>
        <Layout.Section>
          <Card>
            <InlineStack align="space-between" blockAlign="center">
              <Text as="h2" variant="headingMd">
                {t("orders.bar.title")}
              </Text>
              <Button
                onClick={handleRefresh}
                loading={navigation.state === "loading"}
              >
                {t("orders.bar.refresh")}
              </Button>
            </InlineStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text as="h2" variant="headingMd">
                  {t("orders.settings.title")}
                </Text>
              </InlineStack>
              <BlockStack gap="200">
                <Select
                  label={t("orders.settings.filters.preorder_products.title")}
                  options={productOptions}
                  value={settings.selectedProduct}
                  onChange={(value) => updateSetting("product", value)}
                />
                <Checkbox
                  label={t("orders.settings.filters.hide_cancelled_orders")}
                  checked={settings.hideCancelled}
                  onChange={(checked) => updateSetting("hideCancelled", checked)}
                />
                <Checkbox
                  label={t("orders.settings.filters.hide_fulfilled_orders")}
                  checked={settings.hideFulfilled}
                  onChange={(checked) => updateSetting("hideFulfilled", checked)}
                />
                <Checkbox
                  label={t("orders.settings.filters.show_row_colors")}
                  checked={settings.showRowColors}
                  onChange={(checked) => updateSetting("showRowColors", checked)}
                />
              </BlockStack>
            </BlockStack>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <OrderTable
            data={data}
            hideCancelled={settings.hideCancelled}
            hideFulfilled={settings.hideFulfilled}
            showRowColors={settings.showRowColors}
            selectedProduct={settings.selectedProduct}
            onSelectionChange={setSelectedResources}
          />

          <div style={{
            marginTop: "auto",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            paddingBlockStart: "36px",
          }}>
            <Pagination
              hasPrevious={data.data.orders.pageInfo.hasPreviousPage}
              onPrevious={() => {
                const formData = new FormData();
                formData.set("target", "before");
                formData.set("before", String(data.data.orders.pageInfo.startCursor));
                submit(formData, { method: "POST" });
              }}
              hasNext={data.data.orders.pageInfo.hasNextPage}
              onNext={() => {
                const formData = new FormData();
                formData.set("target", "after");
                formData.set("after", String(data.data.orders.pageInfo.endCursor));
                submit(formData, { method: "POST" });
              }}
            />
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
