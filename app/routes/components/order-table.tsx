import {
  IndexTable,
  Card,
  useIndexResourceState,
  Text,
  Badge
} from '@shopify/polaris';

type OrderTableProps = {
  data: OrderTableRawData;
};

export default function OrderTable({ data }: OrderTableProps) {
  const resourceName = {
    singular: 'order',
    plural: 'orders',
  };


  const orders = data.data.orders.edges.map(order => {
    const { id, name } = order.node;

    const dropdeckData = order.node.lineItems.edges.map(lineItem => {
      return JSON.parse(lineItem.node.customAttributes.find(attribute => attribute.key === "_dropdeck_preorder_data")?.value || "{}");
    })

    return ({
      id: id,
      order: name,
      date: dropdeckData.map(data => data.releaseDate).join(", "),
      paymentStatus: (
        <Badge progress={"complete"}>
          {order.node.displayFinancialStatus}
        </Badge>
      ),
      fulfillmentStatus: (
        <Badge progress={"complete"}>
          {order.node.displayFulfillmentStatus}
        </Badge>
      )
    })
  });

  const {selectedResources, allResourcesSelected, handleSelectionChange} =
  useIndexResourceState(orders);

  const rowMarkup = orders.map(
    (
      {id, order, date, paymentStatus, fulfillmentStatus},
      index,
    ) => (
      <IndexTable.Row
        id={id}
        key={id}
        selected={selectedResources.includes(id)}
        position={index}
      >
        <IndexTable.Cell>
          <Text variant="bodyMd" fontWeight="bold" as="span">
            {order}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{date}</IndexTable.Cell>
        <IndexTable.Cell>{date}</IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" alignment="end" numeric>
            {date}
          </Text>
        </IndexTable.Cell>
        <IndexTable.Cell>{paymentStatus}</IndexTable.Cell>
        <IndexTable.Cell>{fulfillmentStatus}</IndexTable.Cell>
      </IndexTable.Row>
    ),
  );

  return (
    <Card>
      <IndexTable
        resourceName={resourceName}
        itemCount={orders.length}
        selectedItemsCount={
          allResourcesSelected ? 'All' : selectedResources.length
        }
        onSelectionChange={handleSelectionChange}
        headings={[
          {title: 'Order'},
          {title: 'Date'},
          {title: 'Customer'},
          {title: 'Total', alignment: 'end'},
          {title: 'Payment status'},
          {title: 'Fulfillment status'},
        ]}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}