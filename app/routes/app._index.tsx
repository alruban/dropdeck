import {
  Page,
  Layout,
  MediaCard,
  BlockStack
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { useTranslation } from "../hooks/useTranslation";

export default function Index() {
  const { t } = useTranslation();

  return (
    <Page>
      <TitleBar title={t("index.title")} />
      <Layout>
        <BlockStack align="center">
      <MediaCard
        title="Getting Started"
        primaryAction={{
          content: 'Learn about getting started',
          onAction: () => {},
        }}
        description="Discover how Shopify can power up your entrepreneurial journey."
        popoverActions={[{content: 'Dismiss', onAction: () => {}}]}
      >
        <img
          alt=""
          width="100%"
          height="100%"
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          src="https://burst.shopifycdn.com/photos/business-woman-smiling-in-office.jpg?width=1850"
        />
      </MediaCard>
      </BlockStack>
      </Layout>
    </Page>
  );
}
