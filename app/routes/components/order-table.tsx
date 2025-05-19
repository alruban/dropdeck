import { parseISOStringIntoFormalDate } from "@shared/index";
import {
  Card,
  IndexTable,
  Text,
  Badge,
  Link,
  Icon,
  InlineStack,
  type IndexTableRowProps,
  useBreakpoints,
  type IndexTableProps,
  useIndexResourceState,
  BlockStack,
} from "@shopify/polaris";
import { LinkIcon } from "@shopify/polaris-icons";
import { Fragment, useEffect } from "react";

type OrderTableProps = {
  data: OrderTableRawData;
  hideCancelled?: boolean;
  hideFulfilled?: boolean;
  showRowColors?: boolean;
  selectedProduct?: string;
  onSelectionChange?: (selectedResources: string[]) => void;
};

interface Order {
  id: string;
  name: string;
  releaseDate: string;
  lineItems: string[];
  paymentStatus: JSX.Element;
  fulfillmentStatus: JSX.Element;
  disabled?: boolean;
  isCancelled: boolean;
  isFulfilled: boolean;
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

interface PreorderData {
  sellingPlanGroupId: string;
  sellingPlanId: string;
  releaseDate: string;
}

export default function OrderTable({
  data,
  hideCancelled = false,
  hideFulfilled = false,
  showRowColors = true,
  selectedProduct = "",
  onSelectionChange,
}: OrderTableProps) {
  // This returns the sellingPlanGroupId, sellingPlanId, and releaseDate for each line item in the order
  // Any line items that are not preorders will return empty objects.
  const preorderData = data.data.orders.edges.map((order) => {
    return order.node.lineItems.edges.map((lineItem) => {
      return JSON.parse(
        lineItem.node.customAttributes.find(
          (attribute) => attribute.key === "_dropdeck_preorder_data",
        )?.value || "{}",
      );
    }) as PreorderData[];
  });

  const orders: Order[] = data.data.orders.edges
    .map((order, index) => {
      // Check if there's at least one valid preorder in the array
      const hasValidPreorder = preorderData[index]?.some(
        (item) => item.releaseDate,
      );
      // The order was never a preorder in the first place, the client has added a 'Dropdeck Preorder' tag manually.
      if (!hasValidPreorder) return null;

      // Find the first line item that has valid preorder data
      const firstValidPreorder = preorderData[index]?.find(
        (item) => item.releaseDate,
      );
      // The order is a preorder, but there are some line items that are not preorders.
      if (!firstValidPreorder) return null;

      // Begin mapping data for the order that has a preorder item.
      const { id, name } = order.node;
      const releaseDate = firstValidPreorder.releaseDate;
      const isCancelled = order.node.cancelledAt !== null;
      const isFulfilled =
        order.node.displayFulfillmentStatus.toLowerCase() === "fulfilled";
      return {
        id,
        name,
        releaseDate,
        lineItems: order.node.lineItems.edges.map((lineItem) => {
          return `${lineItem.node.quantity} x ${lineItem.node.title}`;
        }),
        paymentStatus: (
          <Badge progress={"complete"}>
            {order.node.displayFinancialStatus
              .toLowerCase()
              .slice(0, 1)
              .toUpperCase() +
              order.node.displayFinancialStatus.toLowerCase().slice(1)}
          </Badge>
        ),
        fulfillmentStatus: (
          <Badge progress={"complete"}>
            {order.node.displayFulfillmentStatus
              .toLowerCase()
              .slice(0, 1)
              .toUpperCase() +
              order.node.displayFulfillmentStatus.toLowerCase().slice(1)}
          </Badge>
        ),
        isCancelled,
        isFulfilled,
      };
    })
    .filter((_order, index) => {
      // Filter out cancelled orders if hideCancelled is true
      if (hideCancelled) {
        const isCancelled =
          data.data.orders.edges[index].node.cancelledAt !== null;
        if (isCancelled) return false;
      }

      // Filter out fulfilled orders if hideFulfilled is true
      if (hideFulfilled) {
        const isFulfilled =
          data.data.orders.edges[
            index
          ].node.displayFulfillmentStatus.toLowerCase() === "fulfilled";
        if (isFulfilled) return false;
      }

      // Filter by selected product if one is selected
      if (selectedProduct) {
        const hasSelectedProduct = data.data.orders.edges[
          index
        ].node.lineItems.edges.some(
          ({ node: lineItem }) => lineItem.title === selectedProduct,
        );
        if (!hasSelectedProduct) return false;
      }

      // Last: Check if the order is past the release date
      const firstValidPreorder = preorderData[index]?.find(
        (item) => item.releaseDate,
      );
      if (!firstValidPreorder) return false;
      const orderDate = new Date(firstValidPreorder.releaseDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Only return orders that have a release date that is in the future
      return orderDate >= today;
    })
    .sort((a, b) => {
      // Sort by release date chronologically
      const dateA = new Date(a.releaseDate);
      const dateB = new Date(b.releaseDate);
      return dateA.getTime() - dateB.getTime();
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

  // Call the parent's onSelectionChange when selection changes
  useEffect(() => {
    onSelectionChange?.(selectedResources);
  }, [selectedResources, onSelectionChange]);

  const groupedOrders = groupRowsByGroupKey(
    "releaseDate",
    (date) => `date--${date}`,
  );

  // Create a flat array of all orders for position tracking
  const allOrders = Object.values(groupedOrders).flatMap(
    (group) => group.orders,
  );

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
    const firstSelectableIndex =
      selectableOrders.length > 0
        ? allOrders.findIndex((order) => order.id === selectableOrders[0].id)
        : -1;
    const lastSelectableIndex =
      selectableOrders.length > 0
        ? allOrders.findIndex(
            (order) =>
              order.id === selectableOrders[selectableOrders.length - 1].id,
          )
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
              {`Release Date: ${parseISOStringIntoFormalDate(date)} (${orders.length})`}
            </Text>
          </IndexTable.Cell>
          <IndexTable.Cell />
          <IndexTable.Cell />
          <IndexTable.Cell />
        </IndexTable.Row>
        {orders.map(
          (
            {
              id,
              name,
              lineItems,
              paymentStatus,
              fulfillmentStatus,
              position,
              disabled,
              isCancelled,
              isFulfilled,
            },
            rowIndex,
          ) => {
            const rowTone = showRowColors
              ? isCancelled
                ? "critical"
                : isFulfilled
                  ? "success"
                  : undefined
              : undefined;

            // Get Order URL
            const shopifyDomain = data.data.shop.myshopifyDomain.replace(
              ".myshopify.com",
              "",
            );
            const adminUrl = `https://admin.shopify.com/store/${shopifyDomain}/`;
            const orderUrl = `${adminUrl}orders/${id.replace("gid://shopify/Order/", "")}`;

            return (
              <IndexTable.Row
                rowType="child"
                key={rowIndex}
                id={id}
                position={allOrders.findIndex((order) => order.id === id)}
                selected={selectedResources.includes(id)}
                disabled={disabled}
                tone={rowTone}
              >
                <IndexTable.Cell
                  scope="row"
                  headers={`${columnHeadings[0].id} ${groupId}`}
                >
                  <InlineStack blockAlign="center" gap="100">
                    <Text
                      variant="bodyMd"
                      fontWeight="bold"
                      as="span"
                      tone={rowTone}
                    >
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
                  <BlockStack gap="200">
                    {lineItems.map((item) => {
                      return (
                        <Text key={`${id}-${item}`} as="span" tone={rowTone}>
                          {item}
                        </Text>
                      );
                    })}
                  </BlockStack>
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
        selectable
      >
        {rowMarkup}
      </IndexTable>
    </Card>
  );
}
