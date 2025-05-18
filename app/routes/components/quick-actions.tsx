import {
  BlockStack,
  Button,
  Card,
  Text,
} from "@shopify/polaris";
import { useTranslation } from "app/hooks/useTranslation";

type QuickActionsProps = {
  onCreatePreorderPlanClick: () => void;
};

export default function QuickActions({ onCreatePreorderPlanClick }: QuickActionsProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <BlockStack gap="200">
        <Text as="h2" variant="headingMd">
          {t("quick_actions.title")}
        </Text>
        <BlockStack gap="200">
          <Button
            variant="primary"
            onClick={onCreatePreorderPlanClick}
          >
            {t("quick_actions.create_preorder_plan")}
          </Button>
        </BlockStack>
      </BlockStack>
    </Card>
  );
}
