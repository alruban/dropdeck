import {
  IndexTable,
  Card,
  useIndexResourceState,
  Text,
  Badge
} from '@shopify/polaris';

type OrderTableProps = {
  data: OrderTableRows;
};

export default function OrderTable({ data }: OrderTableProps) {
  const resourceName = {
    singular: 'order',
    plural: 'orders',
  };

  const orders = data.map(order => ({
    ...order,
    paymentStatus: (
      <Badge progress={order.paymentStatus.status as OrderProgress}>
        {order.paymentStatus.label}
      </Badge>
    ),
    fulfillmentStatus: (
      <Badge progress={order.fulfillmentStatus.status as OrderProgress}>
        {order.fulfillmentStatus.label}
      </Badge>
    )
  }));

  const {selectedResources, allResourcesSelected, handleSelectionChange} =
  useIndexResourceState(orders);

  const rowMarkup = orders.map(
    (
      {id, order, date, customer, total, paymentStatus, fulfillmentStatus},
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
        <IndexTable.Cell>{customer}</IndexTable.Cell>
        <IndexTable.Cell>
          <Text as="span" alignment="end" numeric>
            {total}
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