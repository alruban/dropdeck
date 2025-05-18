import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import {
  Page,
  Layout,
  Card,
  InlineStack,
  Box,
  Button,
  Text,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import DateField from "./components/date-field";
import OrderTable from "./components/order-table";
import { authenticate } from "../shopify.server";
import { getDropdeckPreorderOrdersVariables, GET_DROPDECK_PREORDER_ORDERS_QUERY } from "@shared/queries/get-dropdeck-preorder-orders";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  const response = await admin.graphql(GET_DROPDECK_PREORDER_ORDERS_QUERY, {
    variables: getDropdeckPreorderOrdersVariables(),
  });

  // const data: OrderTableRow[] = [
  //   {
  //     id: "1",
  //     order: "#1001",
  //     customer: "John Doe",
  //     paymentStatus: {
  //       status: "complete",
  //       label: "Paid",
  //     },
  //     fulfillmentStatus: {
  //       status: "incomplete",
  //       label: "Unfulfilled",
  //     },
  //   },
  // ];

  return json({ data: await response.json(), selectedDate: date });
};

export default function Index() {
  const { data, selectedDate } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const { t } = useTranslation();
  const [date, setDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined,
  );

  console.log("DATA", data);

  const handleDateChange = useCallback(
    (newDate: Date) => {
      setDate(newDate);
      const formData = new FormData();
      formData.append("date", newDate.toISOString().split("T")[0]);
      submit(formData, { method: "get" });
    },
    [submit],
  );

  const handleClearFilter = useCallback(() => {
    setDate(undefined);
    submit(new FormData(), { method: "get" });
  }, [submit]);

  return (
    <Page>
      <TitleBar title={t("orders.title")} />
      <Layout>
        <Layout.Section>
          <Card>
            <Box padding="400">
              <InlineStack align="space-between" blockAlign="center">
                <InlineStack gap="400" blockAlign="center">
                  <Text as="h2" variant="headingMd">
                    {t("orders.filter_by_date")}
                  </Text>
                  <DateField
                    onChange={handleDateChange}
                    initialValue={date}
                    label={t("orders.select_date")}
                  />
                </InlineStack>
                {date && (
                  <Button onClick={handleClearFilter}>
                    {t("orders.clear_filter")}
                  </Button>
                )}
              </InlineStack>
            </Box>
          </Card>
        </Layout.Section>

        <Layout.Section>
          <OrderTable data={data} />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
