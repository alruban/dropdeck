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
  type IndexTableRowProps,
  useBreakpoints,
  type IndexTableProps,
} from "@shopify/polaris";
import { LinkIcon } from "@shopify/polaris-icons";
import { Fragment } from "react";

type OrderTableProps = {
  data: OrderTableRawData;
};

export default function OrderTable({ data }: OrderTableProps) {
  interface Order {
    id: string;
    name: string;
    releaseDate: string;
    lineItems: string[];
    paymentStatus: JSX.Element;
    fulfillmentStatus: JSX.Element;
    disabled?: boolean;
  }

  interface OrderRow extends Order {
    position: number;
  }

  interface OrderGroup {
    id: string;
    position: number;
    orders: OrderRow[];
  }

  interface Groups {
    [key: string]: OrderGroup;
  }

  const orders: Order[] = data.data.orders.edges.map((order) => {
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
      lineItems: order.node.lineItems.edges.map((lineItem) => {
        return `${lineItem.node.quantity} x ${lineItem.node.title}`;
      }),
      paymentStatus: (
        <Badge progress={"complete"}>
          {order.node.displayFinancialStatus.toLowerCase().slice(0, 1).toUpperCase() +
           order.node.displayFinancialStatus.toLowerCase().slice(1)}
        </Badge>
      ),
      fulfillmentStatus: (
        <Badge progress={"complete"}>
          {order.node.displayFulfillmentStatus.toLowerCase().slice(0, 1).toUpperCase() +
           order.node.displayFulfillmentStatus.toLowerCase().slice(1)}
        </Badge>
      ),
    };
  });

  const columnHeadings = [
    { title: "Order", id: "column-header--order" },
    { title: "Line items", id: "column-header--items" },
    { title: "Payment status", id: "column-header--payment" },
    { title: "Fulfillment status", id: "column-header--fulfillment" },
  ];

  const groupRowsByGroupKey = (
    groupKey: keyof Order,
    resolveId: (groupVal: string) => string,
  ) => {
    let position = -1;
    const groups: Groups = orders.reduce((groups: Groups, order: Order) => {
      const groupVal: string = order[groupKey] as string;
      if (!groups[groupVal]) {
        position += 1;
        groups[groupVal] = {
          position,
          orders: [],
          id: resolveId(groupVal),
        };
      }
      groups[groupVal].orders.push({
        ...order,
        position: position + 1,
      });
      position += 1;
      return groups;
    }, {});

    return groups;
  };

  const resourceName = {
    singular: "order",
    plural: "orders",
  };

  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(orders as unknown as { [key: string]: unknown }[]);

  const groupedOrders = groupRowsByGroupKey(
    "releaseDate",
    (date) => `date--${date}`,
  );

  // Create a flat array of all orders for position tracking
  const allOrders = Object.values(groupedOrders).flatMap(group => group.orders);

  const rowMarkup = Object.keys(groupedOrders).map((date, index) => {
    const { orders, position, id: groupId } = groupedOrders[date];
    let selected: IndexTableRowProps["selected"] = false;

    const someOrdersSelected = orders.some(({ id }) =>
      selectedResources.includes(id),
    );

    const allOrdersSelected = orders.every(({ id }) =>
      selectedResources.includes(id),
    );

    if (allOrdersSelected) {
      selected = true;
    } else if (someOrdersSelected) {
      selected = "indeterminate";
    }

    // Calculate the correct row range for selection
    const selectableOrders = orders.filter(({ disabled }) => !disabled);
    const firstSelectableIndex = selectableOrders.length > 0
      ? allOrders.findIndex(order => order.id === selectableOrders[0].id)
      : -1;
    const lastSelectableIndex = selectableOrders.length > 0
      ? allOrders.findIndex(order => order.id === selectableOrders[selectableOrders.length - 1].id)
      : -1;

    const rowRange: IndexTableRowProps["selectionRange"] =
      firstSelectableIndex >= 0 && lastSelectableIndex >= 0
        ? [firstSelectableIndex, lastSelectableIndex]
        : undefined;

    const disabled = orders.every(({ disabled }) => disabled);

    return (
      <Fragment key={groupId}>
        <IndexTable.Row
          rowType="data"
          selectionRange={rowRange}
          id={`Parent-${index}`}
          position={position}
          selected={selected}
          disabled={disabled}
          accessibilityLabel={`Select all orders with release date ${date}`}
        >
          <IndexTable.Cell scope="col" id={groupId}>
            <Text as="span" fontWeight="semibold">
              {date}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell />
          <IndexTable.Cell />
          <IndexTable.Cell />
        </IndexTable.Row>
        {orders.map(
          ({ id, name, lineItems, paymentStatus, fulfillmentStatus, position, disabled }, rowIndex) => {
            const shopDomain = shopify.config.shop?.replace(".myshopify.com", "");
            const orderIdNumber = id.replace("gid://shopify/Order/", "");
            const orderUrl = `https://admin.shopify.com/store/${shopDomain}/orders/${orderIdNumber}`;

            return (
              <IndexTable.Row
                rowType="child"
                key={rowIndex}
                id={id}
                position={allOrders.findIndex(order => order.id === id)}
                selected={selectedResources.includes(id)}
                disabled={disabled}
              >
                <IndexTable.Cell
                  scope="row"
                  headers={`${columnHeadings[0].id} ${groupId}`}
                >
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
                  <Text as="span">
                    {lineItems.join(", ")}
                  </Text>
                </IndexTable.Cell>
                <IndexTable.Cell>{paymentStatus}</IndexTable.Cell>
                <IndexTable.Cell>{fulfillmentStatus}</IndexTable.Cell>
              </IndexTable.Row>
            );
          },
        )}
      </Fragment>
    );
  });

  return (
    <Card>
      <IndexTable
        condensed={useBreakpoints().smDown}
        onSelectionChange={handleSelectionChange}
        selectedItemsCount={
          allResourcesSelected ? "All" : selectedResources.length
        }
        resourceName={resourceName}
        itemCount={orders.length}
        headings={columnHeadings as IndexTableProps["headings"]}
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}
