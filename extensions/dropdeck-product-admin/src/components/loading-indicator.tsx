import { BlockStack, ProgressIndicator } from "@shopify/ui-extensions-react/admin";

import { Box } from "@shopify/ui-extensions-react/admin";

export default function LoadingIndicator() {
  return (
    <Box padding="base">
      <BlockStack inlineAlignment="center" blockAlignment="center">
        <ProgressIndicator size="small-200" />
      </BlockStack>
    </Box>
  );
}
