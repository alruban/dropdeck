import {
  Page,
  Layout,
  Card,
  Text,
  Box,
  BlockStack,
  Divider,
  List,
  Pagination,
  Button
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "../hooks/useTranslation";
import { useState } from "react";
import { downloadFile } from "../utils/file-download";
import { data, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (!session) return data({ locale: "en" });

  const dbSession = await prisma.session.findUnique({
    where: { id: session.id },
    select: { locale: true },
  });

  return data({ locale: dbSession?.locale || "en" });
};

export default function Index() {
  const { t } = useTranslation();

  // Pages
  const [page, setPage] = useState(0);

  function Contents({ hidden = true }) {
    return (
      <div hidden={hidden}>
        <BlockStack gap="200">
          <Text as="h3" variant="headingMd" fontWeight="medium">
            {t("guide.card.pages.contents.title")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("guide.card.pages.contents.description")}
          </Text>
          <Box paddingBlock="300">
            <List type="number">
              <List.Item>
                <Button variant="plain" onClick={() => setPage(1)}>
                  {t("guide.card.pages.contents.items.1")}
                </Button>
              </List.Item>
              <List.Item>
                <Button variant="plain" onClick={() => setPage(2)}>
                  {t("guide.card.pages.contents.items.2")}
                </Button>
              </List.Item>
              <List.Item>
                <Button variant="plain" onClick={() => setPage(3)}>
                  {t("guide.card.pages.contents.items.3")}
                </Button>
              </List.Item>
              <List.Item>
                <Button variant="plain" onClick={() => setPage(4)}>
                  {t("guide.card.pages.contents.items.4")}
                </Button>
              </List.Item>
              <List.Item>
                <Button variant="plain" onClick={() => setPage(5)}>
                  {t("guide.card.pages.contents.items.5")}
                </Button>
              </List.Item>
            </List>
          </Box>
        </BlockStack>
      </div>
    )
  }

  function Step1({ hidden = true }) {
    return (
      <div hidden={hidden}>
        <BlockStack gap="200">
          <Text as="h3" variant="headingMd" fontWeight="medium">
            {t("guide.card.pages.1.title")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("guide.card.pages.1.description")}
          </Text>
          <List>
            <List.Item>{t("guide.card.pages.1.steps.1")}</List.Item>
            <List.Item>{t("guide.card.pages.1.steps.2")}</List.Item>
          </List>
          <Text as="p" variant="bodyMd">
            {t("guide.card.pages.1.conclusion")}
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
            {t("guide.card.pages.2.title")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("guide.card.pages.2.description")}
          </Text>
          <Text as="h4" variant="headingSm" fontWeight="medium">
            {t("guide.card.pages.2.choices.1.title")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("guide.card.pages.2.choices.1.description")}
          </Text>
          <Text as="h4" variant="headingSm" fontWeight="medium">
            {t("guide.card.pages.2.choices.2.title")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("guide.card.pages.2.choices.2.description")}
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
            {t("guide.card.pages.3.title")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("guide.card.pages.3.description")}
          </Text>
          <List>
            <List.Item>
              <Text as="h4" variant="headingSm" fontWeight="medium">
                {t("guide.card.pages.3.snippets.1.title")}
              </Text>
              <Text as="p" variant="bodyMd">
                {t("guide.card.pages.3.snippets.1.description")}
              </Text>
            </List.Item>
            <List.Item>
              <Text as="h4" variant="headingSm" fontWeight="medium">
                {t("guide.card.pages.3.snippets.2.title")}
              </Text>
              <Text as="p" variant="bodyMd">
                {t("guide.card.pages.3.snippets.2.description")}
              </Text>
            </List.Item>
            <List.Item>
              <Text as="h4" variant="headingSm" fontWeight="medium">
                {t("guide.card.pages.3.snippets.3.title")}
              </Text>
              <Text as="p" variant="bodyMd">
                {t("guide.card.pages.3.snippets.3.description")}
              </Text>
            </List.Item>
            <List.Item>
              <Text as="h4" variant="headingSm" fontWeight="medium">
                {t("guide.card.pages.3.snippets.4.title")}
              </Text>
              <Text as="p" variant="bodyMd">
                {t("guide.card.pages.3.snippets.4.description")}
              </Text>
            </List.Item>
          </List>
          <Box maxWidth="400">
            <Button
              variant="secondary"
              onClick={() => {
                downloadFile("dropdeck-snippets.zip", "dropdeck-snippets.zip").catch(error => {
                  console.error("Failed to download file:", error);
                });
              }}
            >
              {t("guide.card.pages.3.download")}
            </Button>
          </Box>
        </BlockStack>
      </div>
    )
  }

  function Step4({ hidden = true }) {
    return (
      <div hidden={hidden}>
        <BlockStack gap="200">
          <Text as="h3" variant="headingMd" fontWeight="medium">
            {t("guide.card.pages.4.title")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("guide.card.pages.4.description.1")}
          </Text>
          <Text as="p" variant="bodyMd">
            {t("guide.card.pages.4.description.2")}
          </Text>
        </BlockStack>
      </div>
    )
  }

  function FrequentlyAskedQuestions({ hidden = true }) {
    return (
      <div hidden={hidden}>
        <BlockStack gap="200">
          <Text as="h3" variant="headingMd" fontWeight="medium">
            {t("guide.card.pages.faqs.title")}
          </Text>
          <List>
            <List.Item>
              <Text as="h4" variant="headingSm" fontWeight="medium">
                {t("guide.card.pages.faqs.questions.1.question")}
              </Text>
              <Text as="p" variant="bodyMd">
                {t("guide.card.pages.faqs.questions.1.answer")}
              </Text>
            </List.Item>
            <List.Item>
              <Text as="h4" variant="headingSm" fontWeight="medium">
                {t("guide.card.pages.faqs.questions.2.question")}
              </Text>
              <Text as="p" variant="bodyMd">
                {t("guide.card.pages.faqs.questions.2.answer")}
              </Text>
            </List.Item>
            <List.Item>
              <Text as="h4" variant="headingSm" fontWeight="medium">
                {t("guide.card.pages.faqs.questions.3.question")}
              </Text>
              <Text as="p" variant="bodyMd">
                {t("guide.card.pages.faqs.questions.3.answer")}
              </Text>
            </List.Item>
            <List.Item>
              <Text as="h4" variant="headingSm" fontWeight="medium">
                {t("guide.card.pages.faqs.questions.4.question")}
              </Text>
              <Text as="p" variant="bodyMd">
                {t("guide.card.pages.faqs.questions.4.answer")}
              </Text>
            </List.Item>
          </List>
        </BlockStack>
      </div>
    )
  }

  return (
    <Page>
      <TitleBar title={t("guide.title")} />
      <Layout>
        <Layout.Section>
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Box maxWidth="600px">
              <Card padding="0">
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

                  <Box minHeight="480px">
                    <BlockStack gap="400">
                      <Contents hidden={page !== 0} />
                      <Step1 hidden={page !== 1} />
                      <Step2 hidden={page !== 2} />
                      <Step3 hidden={page !== 3} />
                      <Step4 hidden={page !== 4} />
                      <FrequentlyAskedQuestions hidden={page !== 5} />
                    </BlockStack>
                  </Box>

                  <div style={{
                    marginTop: "auto",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingBlockStart: "36px",
                  }}>
                    <Box>
                      {page > 0 && (
                        <Button
                          variant="secondary"
                          fullWidth={false}
                          onClick={() => {
                            setPage(0);
                          }}
                        >
                          {t("guide.card.return_to_contents")}
                        </Button>
                      )}
                    </Box>

                    <Pagination
                      hasPrevious={page > 0}
                      onPrevious={() => {
                        setPage(page - 1);
                      }}
                      hasNext={page < 5}
                      onNext={() => {
                        setPage(page + 1);
                      }}
                    />
                  </div>
                </div>
              </Card>
            </Box>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
