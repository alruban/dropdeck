import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation, useSubmit, useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  InlineStack,
  Button,
  Text,
  Checkbox,
  BlockStack,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "../hooks/useTranslation";
import OrderTable from "./components/order-table";
import { authenticate } from "../shopify.server";
import { getDropdeckPreorderOrdersVariables, GET_DROPDECK_PREORDER_ORDERS_QUERY } from "@shared/queries/get-dropdeck-preorder-orders";
import { useCallback, useState } from "react";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const hideCancelled = url.searchParams.get("hideCancelled") === "true";
  const hideFulfilled = url.searchParams.get("hideFulfilled") === "true";
  const showRowColors = url.searchParams.get("showRowColors") === "true";

  const response = await admin.graphql(GET_DROPDECK_PREORDER_ORDERS_QUERY, {
    variables: getDropdeckPreorderOrdersVariables(),
  });

  const responseData = await response.json();
  return json({
    data: responseData as OrderTableRawData,
    settings: {
      hideCancelled,
      hideFulfilled,
      showRowColors,
    }
  });
};

export default function Index() {
  const { data, settings: initialSettings } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [settings, setSettings] = useState(initialSettings);
  const fetcher = useFetcher();

  const updateSetting = useCallback((key: string, value: boolean) => {
    // Optimistically update the UI
    setSettings(prev => ({ ...prev, [key]: value }));

    // Update URL params using fetcher
    const formData = new FormData();
    formData.append(key, value.toString());
    fetcher.submit(formData, { method: "get" });
  }, [fetcher]);

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
                onClick={() => submit(null, { method: "get" })}
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
                <Checkbox
                  label="Hide cancelled orders"
                  checked={settings.hideCancelled}
                  onChange={(checked) => updateSetting("hideCancelled", checked)}
                />
                <Checkbox
                  label="Hide fulfilled orders"
                  checked={settings.hideFulfilled}
                  onChange={(checked) => updateSetting("hideFulfilled", checked)}
                />
                <Checkbox
                  label="Show row colors"
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
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
