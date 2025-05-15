import type { LoaderFunctionArgs } from "@remix-run/node";
import { Page } from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);

  return null;
};

export default function Index() {
  const shopify = useAppBridge();

  return (
    <Page>
      <TitleBar title="Dropdeck"/>

    </Page>
  );
}
