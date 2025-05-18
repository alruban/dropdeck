import { parseISOStringIntoFormalDate } from "@shared/index";
import {
  IndexTable,
  Card,
  useIndexResourceState,
  Text,
  Badge,
  Link,
  Icon,
  InlineStack,
} from "@shopify/polaris";
import { LinkIcon } from "@shopify/polaris-icons";

type OrderTableProps = {
  data: OrderTableRawData;
};

export default function OrderTable({ data }: OrderTableProps) {
  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  const orders = data.data.orders.edges.map((order) => {
    const dropdeckData = order.node.lineItems.edges.map((lineItem) => {
      return JSON.parse(
        lineItem.node.customAttributes.find(
          (attribute) => attribute.key === "_dropdeck_preorder_data",
        )?.value || "{}",
      );
    });

    const { id, name } = order.node;
    const releaseDate = parseISOStringIntoFormalDate(
      dropdeckData.map((data) => data.releaseDate).toString(),
    );

    return {
      id,
      name,
      releaseDate,
      paymentStatus: (
        <Badge progress={"complete"}>{order.node.displayFinancialStatus}</Badge>
      ),
      fulfillmentStatus: (
        <Badge progress={"complete"}>
          {order.node.displayFulfillmentStatus}
        </Badge>
      ),
    };
  });

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(orders);

  const rowMarkup = orders.map(
    ({ id, name, releaseDate, paymentStatus, fulfillmentStatus }, index) => {
      const shopDomain = shopify.config.shop?.replace(".myshopify.com", "");
      const orderIdNumber = id.replace("gid://shopify/Order/", "");
      const orderUrl = `https://admin.shopify.com/store/${shopDomain}/orders/${orderIdNumber}`;

      return (
        <IndexTable.Row
          id={id}
          key={id}
          selected={selectedResources.includes(id)}
          position={index}
        >
          <IndexTable.Cell>
            <InlineStack blockAlign="center" gap="100">
              <Text variant="bodyMd" fontWeight="bold" as="span">
                {name}
              </Text>
              <Link
                url={orderUrl}
                target="_blank"
                monochrome={true}
                onClick={() => {
                  window.open(orderUrl, "_blank");
                }}
              >
                <Icon source={LinkIcon} />
              </Link>
            </InlineStack>
          </IndexTable.Cell>
          <IndexTable.Cell>
            <Text as="span" numeric>
              {releaseDate}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell>{paymentStatus}</IndexTable.Cell>
          <IndexTable.Cell>{fulfillmentStatus}</IndexTable.Cell>
        </IndexTable.Row>
      );
    },
  );

  return (
    <Card>
      <IndexTable
        resourceName={resourceName}
        itemCount={orders.length}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          { title: "Order" },
          { title: "Release Date" },
          { title: "Payment status" },
          { title: "Fulfillment status" },
        ]}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}
