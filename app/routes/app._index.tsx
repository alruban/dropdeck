import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData, useSubmit } from "@remix-run/react";
import { Page, Layout, Card, InlineStack, Box, Button, Text } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useState, useCallback } from "react";
import { useTranslation } from "../hooks/useTranslation";
import DateField from "./components/date-field";
import OrderTable from "./components/order-table";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  const data: OrderTableRow[] = [
    {
      id: "1",
      order: "#1001",
      date: "2024-03-20",
      customer: "John Doe",
      total: "$100.00",
      paymentStatus: {
        status: "complete",
        label: "Paid"
      },
      fulfillmentStatus: {
        status: "incomplete",
        label: "Unfulfilled"
      }
    },
    {
      id: "2",
      order: "#1002",
      date: "2024-03-21",
      customer: "Jane Smith",
      total: "$150.00",
      paymentStatus: {
        status: "partiallyComplete",
        label: "Partially Paid"
      },
      fulfillmentStatus: {
        status: "complete",
        label: "Fulfilled"
      }
    },
    {
      id: "3",
      order: "#1003",
      date: "2024-03-22",
      customer: "Bob Johnson",
      total: "$200.00",
      paymentStatus: {
        status: "incomplete",
        label: "Unpaid"
      },
      fulfillmentStatus: {
        status: "partiallyComplete",
        label: "Partially Fulfilled"
      }
    }
  ];

  return json({ data, selectedDate: date });
};

export default function Index() {
  const { data, selectedDate } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const { t } = useTranslation();
  const [date, setDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : undefined
  );

  const handleDateChange = useCallback(
    (newDate: Date) => {
      setDate(newDate);
      const formData = new FormData();
      formData.append("date", newDate.toISOString().split("T")[0]);
      submit(formData, { method: "get" });
    },
    [submit]
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
          <Card>
            <OrderTable data={data} />
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
