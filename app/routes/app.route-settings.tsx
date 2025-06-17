import {
  Page,
  Layout,
  BlockStack,
  Card,
  Text,
  InlineStack
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "app/hooks/useTranslation";
import LanguageSelector from "./components/language-selector";
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
  // const { data } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <Page>
      <TitleBar title={t("settings.title")} />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <InlineStack align="space-between" blockAlign="center">
                <BlockStack>
                  <Text as="h3" fontWeight="bold">
                    {t("settings.language.title")}
                  </Text>
                  <Text as="p">
                    {t("settings.language.description")}
                  </Text>
                </BlockStack>
                <LanguageSelector />
              </InlineStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
