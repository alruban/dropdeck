import type { HeadersFunction, LoaderFunctionArgs } from "@remix-run/node";
import { data } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";

import { authenticate } from "../shopify.server";
import { useTranslation } from "../hooks/useTranslation";
import prisma from "../db.server";

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  if (!session) return data({ apiKey: process.env.SHOPIFY_API_KEY || "", locale: "en" });

  const dbSession = await prisma.session.findUnique({
    where: { id: session.id },
    select: { locale: true },
  });

  return data({
    apiKey: process.env.SHOPIFY_API_KEY || "",
    locale: dbSession?.locale || "en"
  });
};

export default function App() {
  const { data } = useLoaderData<typeof loader>();
  const { t } = useTranslation();

  return (
    <AppProvider isEmbeddedApp apiKey={data.apiKey}>
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
        <Link to="/app/route-settings">
          {t("navigation.settings")}
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
