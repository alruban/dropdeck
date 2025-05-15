import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export async function loader({ request }: LoaderFunctionArgs) {
  console.log('------------CALL-------------', request);
  const { storefront } = await authenticate.public.appProxy(request);
  console.log('------------_STOREFRONT-------------', storefront);

  if (!storefront) {
    console.log('------------_NOOOOO STOREFRONT-------------', storefront);

    return new Response();
  }

  console.log('------------_ISSSSSS STOREFRONT-------------', storefront);

  const response = await storefront.graphql(
    `#graphql
    query productTitle {
      products(first: 1) {
        nodes {
          title
        }
      }
    }`
  );

  console.log('------------RESSSSPPPONNSEEE-------------', response);

  return json(await response.json());
}