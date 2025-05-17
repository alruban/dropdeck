import { useSubmit } from "@remix-run/react";
import { BlockStack, DatePicker, Divider, Modal, Text, TextField } from "@shopify/polaris";
import { useTranslation } from "../../hooks/useTranslation";
import { getOneMonthAhead } from "@shared/index";
import { useState } from "react";
import DateField from "./date-field";

export default function CreateSellingPlanGroupModal({
  createPlanModalOpen,
  setCreatePlanModalOpen,
  isLoading,
}: {
  createPlanModalOpen: boolean;
  setCreatePlanModalOpen: (open: boolean) => void;
  isLoading: boolean;
}) {
  const submit = useSubmit();
  const { t } = useTranslation();

  // States
  const [dateError, setDateError] = useState<string | undefined>(undefined);
  const [releaseDate, setReleaseDate] = useState(getOneMonthAhead());
  const [unitsPerCustomer, setUnitsPerCustomer] = useState("0"); // 0 means unlimited
  const [totalUnitsAvailable, setTotalUnitsAvailable] = useState("0"); // 0 means unlimited

  const confirmCreate = () => {
    const formData = new FormData();
    // const expectedFulfillmentDate = formData.get("expectedFulfillmentDate");
    // const unitsPerCustomer = formData.get("unitsPerCustomer");
    // const totalUnitsAvailable = formData.get("totalUnitsAvailable");
    // const productId = formData.get("productId");

    submit(formData, { method: "POST" });
    setCreatePlanModalOpen(false);
  };

  const validateDate = (date: string) => {
    const selectedDate = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    if (selectedDate < tomorrow) {
      // setDateError(t("error_date_must_be_future"));
      return false;
    }
    setDateError(undefined);
    return true;
  };

  return (
    <Modal
      open={createPlanModalOpen}
      onClose={() => setCreatePlanModalOpen(false)}
      title={t("create_plan.title")}
      primaryAction={{
        content: t("create_plan.create"),
        destructive: true,
        onAction: confirmCreate,
        loading: isLoading,
      }}
      secondaryActions={[
        {
          content: t("create_plan.cancel"),
          onAction: () => setCreatePlanModalOpen(false),
        },
      ]}
    >
      <Modal.Section>
        <BlockStack gap="500">
          {/* <Text as="p">{t("create_plan.description")}</Text> */}

          <Divider />

          <BlockStack gap="500">
            {/* <DatePicker
              month={new Date().getMonth()}
              year={new Date().getFullYear()}
              // label={t("create_plan.shipping_date")}
              // value={releaseDate}
              // onChange={(newDate) => {
              //   const date = String(newDate);
              //   setReleaseDate(date);
              //   validateDate(date);
              // }}
              // error={dateError}
            /> */}

            <DateField />

            <TextField
              type="number"
              autoComplete="off"
              label={t("create_plan.units_per_customer")}
              value={unitsPerCustomer.toString()}
              onChange={(newUnitsPerCustomer) => setUnitsPerCustomer(newUnitsPerCustomer)}
              min={0}
            />

            <TextField
              type="number"
              autoComplete="off"
              label={t("create_plan.total_units_available")}
              value={totalUnitsAvailable.toString()}
              onChange={(newTotalUnitsAvailable) => setTotalUnitsAvailable(newTotalUnitsAvailable)}
              min={0}
            />
          </BlockStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
