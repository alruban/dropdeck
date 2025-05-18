import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  Page
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";

// export const loader = async ({ request }: LoaderFunctionArgs) => {};
// export const action = async ({ request }: ActionFunctionArgs) => {};

export default function Index() {

  return (
    <Page>
      <TitleBar title="Dropdeck"/>
    </Page>
  );
}
