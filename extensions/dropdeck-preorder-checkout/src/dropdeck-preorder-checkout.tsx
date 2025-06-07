import {
  reactExtension,
  useApi,
  Text,
  useCartLineTarget,
  useTranslate,
  useEmail,
  BlockStack,
  useBuyerJourneyIntercept,
} from "@shopify/ui-extensions-react/checkout";
import { parseISOStringIntoFormalDate } from "../../../shared/tools/date-tools";
import {
  type GetPreorderDataResponse,
  type CustomerOrder,
  type GetCustomerOrdersResponse,
  type GetCustomerResponse,
  type CustomerOrderLineItem,
} from "../../../app/routes/app.api-checkout";
import { useEffect, useState } from "react";

// 1. Choose an extension target
export default reactExtension(
  "purchase.checkout.cart-line-item.render-after",
  () => <Extension />,
);

type LineItemPreorderData = {
  releaseDate: string;
  unitsPerCustomer: number;
};

const errorTranslations = {
  "en": {
    "reason": "Preorder limit exceeded.",
    "message_reduce_units": "You have exceeded the preorder unit restriction limit for {{ title }}. Please reduce the number of units in your order."
  },
  "ar": {
    "reason": "تم تجاوز حد الطلب المسبق.",
    "message_reduce_units": "لقد تجاوزت حد وحدات الطلب المسبق لـ {{ title }}. يرجى تقليل عدد الوحدات في طلبك."
  },
  "cs": {
    "reason": "Překročen limit předobjednávky.",
    "message_reduce_units": "Překročili jste limit jednotek předobjednávky pro {{ title }}. Snižte prosím počet jednotek ve své objednávce."
  },
  "da": {
    "reason": "Forudbestillingsgrænse overskredet.",
    "message_reduce_units": "Du har overskredet forudbestillingsgrænsen for {{ title }}. Reducer venligst antallet af enheder i din ordre."
  },
  "de": {
    "reason": "Vorbestellungsgrenze überschritten.",
    "message_reduce_units": "Sie haben das Vorbestellungs-Limit für {{ title }} überschritten. Bitte reduzieren Sie die Anzahl der Einheiten in Ihrer Bestellung."
  },
  "el": {
    "reason": "Υπέρβαση ορίου προπαραγγελίας.",
    "message_reduce_units": "Έχετε υπερβεί το όριο μονάδων προπαραγγελίας για το {{ title }}. Παρακαλώ μειώστε τον αριθμό των μονάδων στην παραγγελία σας."
  },
  "es": {
    "reason": "Límite de preventa excedido.",
    "message_reduce_units": "Ha superado el límite de unidades de preventa para {{ title }}. Por favor, reduzca el número de unidades en su pedido."
  },
  "fi": {
    "reason": "Ennakkotilausraja ylitetty.",
    "message_reduce_units": "Olet ylittänyt ennakkotilausyksikkörajan tuotteelle {{ title }}. Vähennä tilauksesi yksiköiden määrää."
  },
  "fr": {
    "reason": "Limite de précommande dépassée.",
    "message_reduce_units": "Vous avez dépassé la limite d'unités de précommande pour {{ title }}. Veuillez réduire le nombre d'unités dans votre commande."
  },
  "he": {
    "reason": "חרגת ממגבלת ההזמנה המוקדמת.",
    "message_reduce_units": "חרגת ממגבלת היחידות להזמנה מוקדמת עבור {{ title }}. אנא הפחת את מספר היחידות בהזמנתך."
  },
  "hi": {
    "reason": "प्रीऑर्डर सीमा पार हो गई है।",
    "message_reduce_units": "आपने {{ title }} के लिए प्रीऑर्डर यूनिट सीमा पार कर ली है। कृपया अपने ऑर्डर में यूनिट की संख्या कम करें।"
  },
  "id": {
    "reason": "Batas pre-order terlampaui.",
    "message_reduce_units": "Anda telah melebihi batas unit pre-order untuk {{ title }}. Silakan kurangi jumlah unit dalam pesanan Anda."
  },
  "it": {
    "reason": "Limite di preordine superato.",
    "message_reduce_units": "Hai superato il limite di unità per il preordine di {{ title }}. Riduci il numero di unità nel tuo ordine."
  },
  "ja": {
    "reason": "予約注文の上限を超えました。",
    "message_reduce_units": "{{ title }}の予約注文ユニット制限を超えています。ご注文のユニット数を減らしてください。"
  },
  "ko": {
    "reason": "선주문 한도 초과.",
    "message_reduce_units": "{{ title }}의 선주문 단위 제한을 초과했습니다. 주문의 단위 수를 줄여주세요."
  },
  "nl": {
    "reason": "Pre-order limiet overschreden.",
    "message_reduce_units": "U heeft het pre-order eenhedenlimiet voor {{ title }} overschreden. Verminder het aantal eenheden in uw bestelling."
  },
  "no": {
    "reason": "Forhåndsbestillingsgrense overskredet.",
    "message_reduce_units": "Du har overskredet forhåndsbestillingsgrensen for {{ title }}. Vennligst reduser antall enheter i bestillingen din."
  },
  "pl": {
    "reason": "Przekroczono limit przedsprzedaży.",
    "message_reduce_units": "Przekroczyłeś limit jednostek przedsprzedaży dla {{ title }}. Zmniejsz liczbę jednostek w swoim zamówieniu."
  },
  "pt-BR": {
    "reason": "Limite de pré-venda excedido.",
    "message_reduce_units": "Você excedeu o limite de unidades de pré-venda para {{ title }}. Por favor, reduza o número de unidades no seu pedido."
  },
  "pt-PT": {
    "reason": "Limite de pré-venda excedido.",
    "message_reduce_units": "Excedeu o limite de unidades de pré-venda para {{ title }}. Por favor, reduza o número de unidades na sua encomenda."
  },
  "ru": {
    "reason": "Превышен лимит предзаказа.",
    "message_reduce_units": "Вы превысили лимит единиц предзаказа для {{ title }}. Пожалуйста, уменьшите количество единиц в вашем заказе."
  },
  "sv": {
    "reason": "Förhandsbeställningsgräns överskriden.",
    "message_reduce_units": "Du har överskridit förhandsbeställningsgränsen för {{ title }}. Vänligen minska antalet enheter i din beställning."
  },
  "th": {
    "reason": "เกินขีดจำกัดการสั่งจองล่วงหน้า",
    "message_reduce_units": "คุณได้เกินขีดจำกัดหน่วยการสั่งจองล่วงหน้าสำหรับ {{ title }} กรุณาลดจำนวนหน่วยในคำสั่งซื้อของคุณ"
  },
  "tr": {
    "reason": "Ön sipariş limiti aşıldı.",
    "message_reduce_units": "{{ title }} için ön sipariş birim sınırını aştınız. Lütfen siparişinizdeki birim sayısını azaltın."
  },
  "vi": {
    "reason": "Vượt quá giới hạn đặt trước.",
    "message_reduce_units": "Bạn đã vượt quá giới hạn đơn vị đặt trước cho {{ title }}. Vui lòng giảm số lượng đơn vị trong đơn hàng của bạn."
  },
  "zh-CN": {
    "reason": "超出预购限制。",
    "message_reduce_units": "您已超出 {{ title }} 的预购单位限制。请减少订单中的单位数量。"
  },
  "zh-TW": {
    "reason": "超出預購限制。",
    "message_reduce_units": "您已超過 {{ title }} 的預購單位限制。請減少您訂單中的單位數量。"
  }
};

function Extension() {
  const cartLine = useCartLineTarget();
  const email = useEmail();
  const translate = useTranslate();
  const { sessionToken } = useApi();

  // States
  const [lineItemPreorderData, setLineItemPreorderData] = useState<{
    releaseDate: string;
    unitsPerCustomer: number;
    hasExceededLimit: boolean;
    unitsInPreviousOrders: number;
  } | null>(null);

  useEffect(() => {
    setLineItemPreorderData(null);

    /* Check to see if the product is a preorder product */
    async function checkIfPreorder(
      productId: string,
      successCallback: (lineItemPreorderData: LineItemPreorderData) => void
    ) {
      const token = await sessionToken.get();

      fetch("https://dropdeck-five.vercel.app/app/api-checkout", {
        method: "POST",
        body: JSON.stringify({
          productId,
          target: "get-preorder-data",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json() as Promise<GetPreorderDataResponse>)
        .then((res: GetPreorderDataResponse) => {
          const { sellingPlanGroups } = res.data.data.product;
          const sellingPlanGroup = sellingPlanGroups.edges.find(
            (sellingPlanGroup) =>
              sellingPlanGroup.node.appId === "DROPDECK_PREORDER",
          );

          const lineItemPreorderData = {
            releaseDate:
              sellingPlanGroup.node.sellingPlans.nodes[0].deliveryPolicy
                .fulfillmentExactTime,
            unitsPerCustomer: Number(
              sellingPlanGroup.node.sellingPlans.nodes[0].metafields.edges.find(
                (metafield) => metafield.node.key === "units_per_customer",
              )?.node.value,
            ),
          };

          successCallback(lineItemPreorderData);
        })
        .catch((err) => console.error(err));
    }

    // If it is a preorder product, set the preorder data
    checkIfPreorder(
      cartLine.merchandise.product.id,
      (lineItemPreorderData) => {
        setLineItemPreorderData({
          releaseDate: lineItemPreorderData.releaseDate,
          unitsPerCustomer: lineItemPreorderData.unitsPerCustomer,
          hasExceededLimit: false,
          unitsInPreviousOrders: 0,
        })
      }
    );
  }, [cartLine.merchandise.product.id, sessionToken]);

  useEffect(() => {
    // Item is not a preorder product, so we can stop here.
    if (!lineItemPreorderData) return;

    // If it is a preorder product, we continue and determine if the customer has exceeded the limit.
    // Get the customer's id from the entered email (if it exists)
    async function getCustomer(
      customerEmail: string,
      successCallback: (customerId: string) => void,
    ) {
      const token = await sessionToken.get();

      fetch("https://dropdeck-five.vercel.app/app/api-checkout", {
        method: "POST",
        body: JSON.stringify({
          customerEmail,
          target: "get-customer",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json() as Promise<GetCustomerResponse>)
        .then((res: GetCustomerResponse) => {
          const customers = res.data.data.customers.edges;
          if (customers.length === 0) return;
          const customerId = customers[0].node.id;
          successCallback(customerId);
        })
        .catch((err) => console.error(err));
    }

    /* Get the customer's orders from a customer id */
    async function getCustomerOrders(
      customerId: string,
      successCallback: (customerOrders: CustomerOrder[]) => void,
    ) {
      const token = await sessionToken.get();

      fetch("https://dropdeck-five.vercel.app/app/api-checkout", {
        method: "POST",
        body: JSON.stringify({
          customerId,
          target: "get-customer-orders",
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json() as Promise<GetCustomerOrdersResponse>)
        .then((res: GetCustomerOrdersResponse) => {
          const customerOrders = res.data.data.customer.orders.edges;
          successCallback(customerOrders);
        })
        .catch((err) => console.error(err));
    }

    if (email && email.length > 0) {
      getCustomer(email, (customerId) => {
        getCustomerOrders(customerId, (customerOrders) => {
          // Check a customer's previous orders for purchases of the preorder product.
          const _unitsBoughtInPreviousOrders = customerOrders.reduce(
            (total, order: CustomerOrder) =>
              total +
              order.node.lineItems.edges.reduce(
                (orderTotal, lineItem: CustomerOrderLineItem) => {
                  const isDropdeckPreorder =
                    lineItem.node.product.sellingPlanGroups.edges.some(
                      (sellingPlanGroup) =>
                        sellingPlanGroup.node.appId === "DROPDECK_PREORDER",
                    );
                  const isMatchingProduct =
                    lineItem.node.product.id === cartLine.merchandise.product.id;
                  return isDropdeckPreorder && isMatchingProduct
                    ? orderTotal + lineItem.node.quantity
                    : orderTotal;
                },
                0,
              ),
            0,
          );

          setLineItemPreorderData({
            ...lineItemPreorderData,
            unitsInPreviousOrders: _unitsBoughtInPreviousOrders,
            hasExceededLimit: (_unitsBoughtInPreviousOrders + cartLine.quantity) > lineItemPreorderData.unitsPerCustomer
          });
        });
      });
    }
  }, [lineItemPreorderData, email, cartLine.quantity, cartLine.merchandise.product.id, sessionToken]);

  useBuyerJourneyIntercept(({ canBlockProgress }) => {
    // Block if the user has exceeded the preorder limit for this product.
    if (canBlockProgress && lineItemPreorderData && lineItemPreorderData.hasExceededLimit) {
      return {
        behavior: "block",
        reason: errorTranslations["en"].reason,
        errors: [{ message: errorTranslations["en"].message_reduce_units }],
      };
    }

    return {
      behavior: "allow",
    };
  });

  if (lineItemPreorderData) {
    return (
      <BlockStack spacing="none">
        {/* Info */}
        <Text appearance="subdued" size="small">
          {translate("line_item.ships_on_or_after", {
            date: parseISOStringIntoFormalDate(lineItemPreorderData.releaseDate),
          })}
        </Text>
        {lineItemPreorderData.unitsPerCustomer > 0 && (
          <Text appearance="subdued" size="small">
            {translate("line_item.units_per_customer", {
              total_units: String(lineItemPreorderData.unitsPerCustomer),
            })}
          </Text>
        )}

        {/* Error */}
        {lineItemPreorderData.hasExceededLimit && (
          <>
            <Text appearance="critical" size="small">
              {translate("line_item.error_preorder_limit_exceeded.message")}
            </Text>
            {lineItemPreorderData.unitsInPreviousOrders > 0 && (
              <Text appearance="critical" size="small">
                {translate(
                  "line_item.error_preorder_limit_exceeded.units_bought_in_previous_orders",
                  {
                    units: lineItemPreorderData.unitsInPreviousOrders,
                  },
                )}
              </Text>
            )}
            <Text appearance="critical" size="small">
              {translate(
                "line_item.error_preorder_limit_exceeded.units_in_this_order",
                {
                  units: cartLine.quantity,
                },
              )}
            </Text>
          </>
        )}
      </BlockStack>
    );
  } else {
    return null;
  }
}
