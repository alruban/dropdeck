import { ActionFunctionArgs, json } from "@remix-run/node";
import { Layout, Page, Text } from "@shopify/polaris";
import { authenticate } from "app/shopify.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { session } = await authenticate.public.appProxy(request);

  if (session) {
    console.log('session', session);
  } else {
    return null;
  }
};

const Proxy = () => {
  return (
    <Page>
      <Layout>
        <Layout.Section>
          <Text as="h1">Proxy</Text>
        </Layout.Section>
      </Layout>
    </Page>
  );
};

export default Proxy;