import { Page, Layout, Card, Text, Box, InlineGrid, BlockStack, Divider, List, Scrollable } from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "../hooks/useTranslation";
import banner from "../assets/guide_landing.jpg";

export default function Index() {
  const { t } = useTranslation();

  return (
    <Page>
      <TitleBar title={t("guide.title")} />
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <InlineGrid columns={2}>
              <Box>
                <img
                  alt=""
                  width="100%"
                  height="100%"
                  style={{
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                  src={banner}
                />
              </Box>
              <Box padding="800">
                <BlockStack gap="200">
                  <Text as="h2" variant="headingLg" fontWeight="medium">
                    {t("guide.title")}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {t("guide.description")}
                  </Text>
                </BlockStack>
                <Box paddingBlock="400">
                  <Divider />
                </Box>
                <Scrollable height={"100%"} focusable>
                  <BlockStack gap="200">
                    <Text as="h3" variant="headingMd" fontWeight="medium">
                      {t("guide.steps.1.title")}
                    </Text>
                    <Text as="p" variant="bodyMd">
                      {t("guide.steps.1.prompt")}
                    </Text>
                    <List>
                      <List.Item>{t("guide.steps.1.steps.1")}</List.Item>
                      <List.Item>{t("guide.steps.1.steps.2")}</List.Item>
                    </List>
                    <Text as="p" variant="bodyMd">
                      {t("guide.steps.1.conclusion")}
                    </Text>
                  </BlockStack>
                </Scrollable>
              </Box>
            </InlineGrid>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
