import {
  Page,
  Layout,
  BlockStack,
  Text,
  Card,
  Box,
  InlineGrid,
  Button,
  Link,
} from "@shopify/polaris";
import { useTranslation } from "../hooks/useTranslation";
import banner from "../assets/banner-image.jpg";
import { TitleBar } from "@shopify/app-bridge-react";
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

  return (
    <Page>
      <TitleBar title={t("index.title")} />
      <Layout>
        <Layout.Section>
          <div
            style={{
              minHeight: "calc(100dvh - 57px - 56px)",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <BlockStack align="center">
              <Card padding="0">
                <InlineGrid columns={{ md: 2 }}>
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
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "14px",
                        height: "100%",
                        justifyContent: "center",
                      }}
                    >
                      <Text as="h2" variant="headingLg" fontWeight="semibold">
                        {t("index.card.title")}
                      </Text>
                      <Text as="p" variant="bodyLg" fontWeight="regular">
                        {t("index.card.description")}
                      </Text>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "14px",
                          paddingTop: "20px",
                        }}
                      >
                        <Link url="/app/route-guide">
                          <Button
                            variant="primary"
                            size="large"
                            fullWidth={true}
                          >
                            {t("index.card.primary_action")}
                          </Button>
                        </Link>
                        <Link url="/app/route-plans">
                          <Button
                            variant="secondary"
                            size="large"
                            fullWidth={true}
                          >
                            {t("index.card.secondary_action")}
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Box>
                </InlineGrid>
              </Card>
            </BlockStack>
          </div>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
