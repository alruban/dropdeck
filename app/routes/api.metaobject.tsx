import { json } from "@remix-run/node";
import type { ActionFunction } from "@remix-run/node";
import { authenticate } from "../shopify.server";

// This is a Remix action function - it receives the request object automatically
export const action: ActionFunction = async ({ request }) => {
  const { admin } = await authenticate.admin(request);

  // Get the form data from the request
  const formData = await request.formData();
  const type = formData.get("type") as string;
  const fields = JSON.parse(formData.get("fields") as string);

  const response = await admin.graphql(
    `#graphql
      mutation CreateMetaobject($type: String!, $fields: [MetaobjectFieldInput!]!) {
        metaobjectCreate(type: $type, fields: $fields) {
          metaobject {
            id
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    {
      variables: {
        type,
        fields,
      },
    }
  );

  const result = await response.json();
  
  if (result.data?.metaobjectCreate?.userErrors?.length > 0) {
    return json({ error: result.data.metaobjectCreate.userErrors[0].message }, { status: 400 });
  }

  return json({ success: true, metaobject: result.data?.metaobjectCreate?.metaobject });
}; 