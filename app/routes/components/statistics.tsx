import {
  BlockStack,
  Badge,
  Card,
  InlineStack,
  Text,
} from "@shopify/polaris";
import { useTranslation } from "app/hooks/useTranslation";

type StatisticsProps = {
  sellingPlanGroupResponse: SellingPlanGroupResponse;
};

export default function Statistics({ sellingPlanGroupResponse }: StatisticsProps) {
  const { t } = useTranslation();

  const { sellingPlanGroups } = sellingPlanGroupResponse.data;
  const activePlans = sellingPlanGroups.edges.length.toString();
  const productsWithPreorders = sellingPlanGroups.edges.reduce((acc, sellingPlanGroup) => {
    return acc + sellingPlanGroup.node.products.edges.length;
  }, 0).toString();

  return (
    <Card>
      <BlockStack gap="200">
        <Text as="h2" variant="headingMd">
          {t("statistics.title")}
        </Text>
        <BlockStack gap="200">
          <InlineStack align="space-between">
            <Text as="span" variant="bodyMd">
              {t("statistics.active_plans")}
            </Text>
            <Badge>{activePlans}</Badge>
          </InlineStack>
          <InlineStack align="space-between">
            <Text as="span" variant="bodyMd">
              {t("statistics.products_with_preorders")}
            </Text>
            <Badge>{productsWithPreorders}</Badge>
          </InlineStack>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
