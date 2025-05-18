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
import { useState, useCallback, useEffect } from "react";
import { useTranslation } from "../hooks/useTranslation";
import DateField from "./components/date-field";
import OrderTable from "./components/order-table";
import { authenticate } from "../shopify.server";
import { getDropdeckPreorderOrdersVariables, GET_DROPDECK_PREORDER_ORDERS_QUERY } from "@shared/queries/get-dropdeck-preorder-orders";

type OrderTableRawData = {
  data: {
    orders: {
      edges: {
        node: {
          id: string;
          name: string;
          displayFinancialStatus: string;
          displayFulfillmentStatus: string;
          lineItems: {
            edges: {
              node: {
                title: string;
                quantity: number;
                customAttributes: {
                  key: string;
                  value: string;
                }[];
              };
            }[];
          };
        };
      }[];
    };
  };
  extensions: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
    search: {
      path: string[];
      query: string;
      parsed: {
        and: {
          field: string;
          match_all: string;
        }[];
      };
    }[];
  };
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const date = url.searchParams.get("date") || new Date().toISOString().split("T")[0];

  const response = await admin.graphql(GET_DROPDECK_PREORDER_ORDERS_QUERY, {
    variables: getDropdeckPreorderOrdersVariables(),
  });

  const responseData = await response.json();
  return json({ data: responseData as OrderTableRawData, selectedDate: date });
};

export default function Index() {
  const { data, selectedDate } = useLoaderData<typeof loader>();
  const submit = useSubmit();
  const { t } = useTranslation();
  const [date, setDate] = useState<Date | undefined>(
    selectedDate ? new Date(selectedDate) : new Date(),
  );

  // Set initial date if not already set
  useEffect(() => {
    if (!selectedDate) {
      const today = new Date();
      const formData = new FormData();
      formData.append("date", today.toISOString().split("T")[0]);
      submit(formData, { method: "get" });
    }
  }, [selectedDate, submit]);

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
    const today = new Date();
    setDate(today);
    const formData = new FormData();
    formData.append("date", today.toISOString().split("T")[0]);
    submit(formData, { method: "get" });
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
                    {t("orders.show_orders_from")}
                  </Text>
                  <DateField
                    onChange={handleDateChange}
                    initialValue={date}
                    label={t("orders.select_date")}
                    labelHidden={true}
                  />
                </InlineStack>
                <Button onClick={handleClearFilter}>
                  {t("orders.show_today")}
                </Button>
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
