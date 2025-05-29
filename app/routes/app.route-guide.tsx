import {
  Page,
  Layout,
  Card,
  Text,
  Box,
  InlineGrid,
  BlockStack,
  Divider,
  List,
  Scrollable,
  Pagination,
  Button
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "../hooks/useTranslation";
import banner from "../assets/guide_landing.jpg";
import { useState } from "react";
import { downloadFile } from "../utils/file-download";

export default function Index() {
  const { t } = useTranslation();

  // States
  const [step, setStep] = useState(1);

  function Step1({ hidden = true }) {
    return (
      <div hidden={hidden}>
        <BlockStack gap="200">
          <Text as="h3" variant="headingMd" fontWeight="medium">
            {t("guide.card.steps.1.title")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("guide.card.steps.1.description")}
          </Text>
          <List>
            <List.Item>{t("guide.card.steps.1.steps.1")}</List.Item>
            <List.Item>{t("guide.card.steps.1.steps.2")}</List.Item>
          </List>
          <Text as="p" variant="bodyMd">
            {t("guide.card.steps.1.conclusion")}
          </Text>
        </BlockStack>
      </div>
    )
  }

  function Step2({ hidden = true }) {
    return (
      <div hidden={hidden}>
        <BlockStack gap="200">
          <Text as="h3" variant="headingMd" fontWeight="medium">
            {t("guide.card.steps.2.title")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("guide.card.steps.2.description")}
          </Text>
          <Text as="h4" variant="headingSm" fontWeight="medium">
            {t("guide.card.steps.2.choices.1.title")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("guide.card.steps.2.choices.1.description")}
          </Text>
          <Text as="h4" variant="headingSm" fontWeight="medium">
            {t("guide.card.steps.2.choices.2.title")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("guide.card.steps.2.choices.2.description")}
          </Text>
        </BlockStack>
      </div>
    )
  }

  function Step3({ hidden = true }) {
    return (
      <div hidden={hidden}>
        <BlockStack gap="200">
          <Text as="h3" variant="headingMd" fontWeight="medium">
            {t("guide.card.steps.3.title")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("guide.card.steps.3.description")}
          </Text>
          <Box maxWidth="400">
            <Button
              variant="secondary"
              onClick={() => {
                downloadFile("dropdeck-get-sp.liquid", "dropdeck-get-sp.liquid").catch(error => {
                  console.error("Failed to download file:", error);
                });
              }}
            >
              {t("guide.card.steps.3.download")}
            </Button>
          </Box>
        </BlockStack>
      </div>
    )
  }

  return (
    <Page>
      <TitleBar title={t("guide.title")} />
      <Layout>
        <Layout.Section>
          <Card padding="0">
            <InlineGrid columns={"400px 1fr"}>
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
              <div style={{
                display: "flex",
                flexDirection: "column",
                padding: "36px",
                height: "100%",
              }}>
                <BlockStack gap="200">
                  <Text as="h2" variant="headingLg" fontWeight="medium">
                    {t("guide.card.title")}
                  </Text>
                  <Text as="p" variant="bodyMd">
                    {t("guide.card.description")}
                  </Text>
                </BlockStack>

                <Box paddingBlock="400">
                  <Divider />
                </Box>

                <Scrollable
                  style={{
                    maxHeight: "360px",
                    height: "100%",
                  }}
                >
                  <BlockStack gap="400">
                    <Step1 hidden={step !== 1} />
                    <Step2 hidden={step !== 2} />
                    <Step3 hidden={step !== 3} />
                  </BlockStack>
                </Scrollable>

                <div style={{
                  marginTop: "auto",
                  display: "flex",
                  justifyContent: "flex-end",
                  alignItems: "center"
                }}>
                  <Pagination
                    hasPrevious={step > 1}
                    onPrevious={() => {
                      setStep(step - 1);
                    }}
                    hasNext={step < 3}
                    onNext={() => {
                      setStep(step + 1);
                    }}
                  />
                </div>
              </div>
            </InlineGrid>
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
