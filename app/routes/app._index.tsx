import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useNavigation, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  InlineStack,
  Button,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "../hooks/useTranslation";
import OrderTable from "./components/order-table";
import { authenticate } from "../shopify.server";
import { getDropdeckPreorderOrdersVariables, GET_DROPDECK_PREORDER_ORDERS_QUERY } from "@shared/queries/get-dropdeck-preorder-orders";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const response = await admin.graphql(GET_DROPDECK_PREORDER_ORDERS_QUERY, {
    variables: getDropdeckPreorderOrdersVariables(),
  });

  const responseData = await response.json();
  return json({ data: responseData as OrderTableRawData });
};

export default function Index() {
  const { data } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const navigation = useNavigation();
  const { t } = useTranslation();

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
          <OrderTable data={data} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
