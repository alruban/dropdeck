import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { useTranslation } from "../hooks/useTranslation";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  // Replace with the "app_handle" from your shopify.app.toml file
  const appHandle = "dropdeck";

  // Initiate billing and redirect utilities
  const { billing, redirect, session } = await authenticate.admin(request);

  // Check whether the store has an active subscription
  const { hasActivePayment } = await billing.check();

  // Extract the store handle from the shop domain
  // e.g., "cool-shop" from "cool-shop.myshopify.com"
  const shop = session.shop; // e.g., "cool-shop.myshopify.com"
  const storeHandle = shop.replace('.myshopify.com', '');

  // If there's no active subscription, redirect to the plan selection page...
  if (!hasActivePayment) {
    return redirect(`https://admin.shopify.com/store/${storeHandle}/charges/${appHandle}/pricing_plans`, {
      target: "_top", // required since the URL is outside the embedded app scope
    });
  }

  return { apiKey: process.env.SHOPIFY_API_KEY || "" };
};

export default function App() {
  const { apiKey } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <AppProvider isEmbeddedApp apiKey={apiKey}>
      <NavMenu>
        <Link to="/app" rel="home">
          {t("navigation.dashboard")}
        </Link>
        <Link to="/app/route-guide">
          {t("navigation.guide")}
        </Link>
        <Link to="/app/route-plans">
          {t("navigation.plans")}
        </Link>
        <Link to="/app/route-orders">
          {t("navigation.orders")}
        </Link>
      </NavMenu>
      <Outlet />
    </AppProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
