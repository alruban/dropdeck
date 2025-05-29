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
  Icon,
  Button
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "../hooks/useTranslation";
import banner from "../assets/guide_landing.jpg";
import { useState } from "react";

function AppEmbedIcon() {
  return (
    <Icon source="<svg viewBox='0 0 20 20' focusable='false'><path fill-rule='evenodd' d='M3.5 5.75a2.25 2.25 0 0 1 2.25-2.25h2.75a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2.75Zm2.25-.75a.75.75 0 0 0-.75.75v2.25h3v-3h-2.25Z'></path><path fill-rule='evenodd' d='M3.5 14.25a2.25 2.25 0 0 0 2.25 2.25h2.75a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v2.75Zm2.25.75a.75.75 0 0 1-.75-.75v-2.25h3v3h-2.25Z'></path><path fill-rule='evenodd' d='M14.25 16.5a2.25 2.25 0 0 0 2.25-2.25v-2.75a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h2.75Zm.75-2.25a.75.75 0 0 1-.75.75h-2.25v-3h3v2.25Z'></path><path d='M13.5 3.5a.75.75 0 0 1 .75.75v1.5h1.5a.75.75 0 0 1 0 1.5h-1.5v1.5a.75.75 0 0 1-1.5 0v-1.5h-1.5a.75.75 0 0 1 0-1.5h1.5v-1.5a.75.75 0 0 1 .75-.75Z'></path></svg>"/>
  );
}

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
