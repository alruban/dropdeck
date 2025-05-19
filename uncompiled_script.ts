type SellingPlanGroup = {
  node: {
    id: string;
    merchantCode: string;
    sellingPlans: {
      edges: SellingPlan[];
    };
  };
};

type SellingPlan = {
  node: {
    id: string;
    deliveryPolicy: {
      fulfillmentExactTime: string;
    };
  };
};

type ProductVariant = {
  node: {
    id: string;
    availableForSale: boolean;
    inventoryPolicy: string;
    inventoryQuantity: number;
  };
};

type ProductVariantData = {
  productVariant: {
    product: {
      id: string;
      variants: {
        edges: ProductVariant[];
      };
      sellingPlanGroupsCount: {
        count: number;
      };
      sellingPlanGroups: {
        edges: SellingPlanGroup[];
      };
    };
  };
};

interface PreorderResponse {
  data: ProductVariantData;
  extensions: {
    cost: {
      requestedQueryCost: number;
      actualQueryCost: number;
      throttleStatus: {
        maximumAvailable: number;
        currentlyAvailable: number;
        restoreRate: number;
      };
    };
  };
}

(function () {
  function get<T extends HTMLElement>(
    selector: `#${string}` | `.${string}` | `${T["tagName"]}`,
    node: Document | HTMLElement = document,
  ): T | undefined {
    return node.querySelector<T>(selector) ?? undefined;
  }

  function getAll<T extends HTMLElement>(
    selector: string,
    node: Document | HTMLElement = document,
  ): T[] {
    return [...node.querySelectorAll(selector)] as T[];
  }

  class DropdeckPreorder {
    // Elements
    elForm: HTMLFormElement;
    elOriginalBtn: HTMLButtonElement | undefined;
    elShopifyAlternatePayment: HTMLButtonElement | undefined;
    elPreorderBtn: HTMLButtonElement | undefined;

    // State
    vId: string | undefined;
    pId: string | undefined;
    vData: ProductVariantData | undefined;
    buttonPreorderText = "Preorder";
    loader: ReturnType<typeof this.handleLoadingStyling>;

    constructor(form: HTMLFormElement) {
      this.elForm = form;
      this.vId =
        get<HTMLInputElement>('input[name="id"]', form)?.value ??
        (new FormData(form).get("id") as string);
      this.elOriginalBtn = get<HTMLButtonElement>("button[type='submit']", form);
      this.elShopifyAlternatePayment = get<HTMLButtonElement>(
        ".shopify-payment-button[data-shopify=payment-button]",
        form,
      );
      this.loader = this.handleLoadingStyling();
      this.init();
    }

    private init = () => {
      if (!this.elOriginalBtn) return;
      if (!this.vId) {
        this.createFatalErrorElement();
        return;
      }

      this.injectSellingPlan();
    };

    private startRejectingFormSubmissions = () => {
      // Prevent form submission immediately
      this.elForm.addEventListener("submit", this.rejectFormSubmission, {
        capture: true,
      });
    };

    private stopRejectingFormSubmissions = () => {
      // Prevent form submission immediately
      this.elForm.removeEventListener("submit", this.rejectFormSubmission, {
        capture: true,
      });
    };

    private rejectFormSubmission = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    private createFatalErrorElement = () => {
      const elError = document.createElement("span");
      elError.textContent =
        "Fatal error: please contact samclarkeweb@protonmail.com with your store address and details.";
      this.elForm.prepend(elError);
    };

    private handleLoadingStyling = () => {
      // This is sometimes injected multiple times by Shopify.
      this.elShopifyAlternatePayment = get<HTMLButtonElement>(
        ".shopify-payment-button[data-shopify=payment-button]",
        this.elForm,
      );

      return {
        setup: () => {
          if (!this.elOriginalBtn || !this.elShopifyAlternatePayment) return;
          this.elOriginalBtn.style.transition = "opacity 300ms ease-in-out";
          this.elOriginalBtn.style.willChange = "opacity";
          this.elShopifyAlternatePayment.style.transition = "opacity 300ms ease-in-out";
          this.elShopifyAlternatePayment.style.willChange = "opacity";
        },
        show: () => {
          if (!this.elOriginalBtn || !this.elShopifyAlternatePayment) return;
          this.elOriginalBtn.setAttribute("disabled", "");
          this.elOriginalBtn.style.opacity = "0.3";
          this.elShopifyAlternatePayment.style.opacity = "0.3";
        },
        hide: () => {
          if (!this.elOriginalBtn || !this.elShopifyAlternatePayment) return;
          this.elOriginalBtn.removeAttribute("disabled");
          this.elOriginalBtn.style.opacity = "1";
          this.elShopifyAlternatePayment.style.opacity = "1";
        },
      };
    };

    private injectSellingPlan() {
      this.startRejectingFormSubmissions()
      this.loader?.setup();
      this.loader?.show();

      const fetchOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          variantId: this.vId,
          target: "product-interaction",
        }),
      };

      fetch("/apps/px", fetchOptions)
        .then((res) => {
          console.log("res", res);
          return res.json() as Promise<PreorderResponse>;
        })
        .then((res: PreorderResponse) => {
          this.vData = res.data;
          const { product } = this.vData.productVariant;

          const sellingPlanGroupsCount = product.sellingPlanGroupsCount.count;
          if (sellingPlanGroupsCount === 0) return this.stopRejectingFormSubmissions();

          const sellingPlanGroup = product.sellingPlanGroups.edges.find(
            (sellingPlanGroup) =>
              sellingPlanGroup.node.merchantCode === "Dropdeck Preorder",
          );
          if (!sellingPlanGroup) return this.stopRejectingFormSubmissions();

          const sellingPlan = sellingPlanGroup.node.sellingPlans.edges[0];
          if (!sellingPlan) return this.stopRejectingFormSubmissions();

          // Handle Selling Plan Input
          const elSellingPlanInput = get<HTMLInputElement>(
            'input[name="selling_plan"]',
            this.elForm,
          );

          if (!elSellingPlanInput) {
            const sellingPlanId = sellingPlan.node.id.replace(
              "gid://shopify/SellingPlan/",
              "",
            );
            const sellingPlanInput = document.createElement("input");
            sellingPlanInput.setAttribute("name", "selling_plan");
            sellingPlanInput.setAttribute("type", "hidden");
            sellingPlanInput.setAttribute("value", sellingPlanId);
            this.elForm.prepend(sellingPlanInput);
          }

          // Handle Dropdeck Preorder Properties
          const isDropdeckPreorderProp = document.createElement("input");
          isDropdeckPreorderProp.setAttribute(
            "name",
            "properties[_dropdeck_preorder]",
          );
          isDropdeckPreorderProp.setAttribute("id", "dropdeck_preorder");
          isDropdeckPreorderProp.setAttribute("type", "hidden");
          isDropdeckPreorderProp.setAttribute("value", "true");
          this.elForm.prepend(isDropdeckPreorderProp);

          const dropdeckPreorderDataProp = document.createElement("input");
          const dropdeckPreorderData = {
            sellingPlanGroupId: sellingPlanGroup.node.id,
            sellingPlanId: sellingPlan.node.id,
            releaseDate: sellingPlan.node.deliveryPolicy.fulfillmentExactTime,
          };
          dropdeckPreorderDataProp.setAttribute(
            "name",
            "properties[_dropdeck_preorder_data]",
          );
          dropdeckPreorderDataProp.setAttribute("id", "dropdeck_preorder_data");
          dropdeckPreorderDataProp.setAttribute("type", "hidden");
          dropdeckPreorderDataProp.setAttribute(
            "value",
            JSON.stringify(dropdeckPreorderData),
          );
          this.elForm.prepend(dropdeckPreorderDataProp);

          this.handleVariantIdChanges();
          this.createPreorderSubmitButton();
        })
        .catch((error: unknown) => {
          console.error(error);
        })
        .finally(() => {
          this.loader?.hide();
        });
    }

    private handleVariantIdChanges = () => {
      // Watch for changes to the variant ID input
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (
            mutation.type === "attributes" &&
            mutation.attributeName === "value"
          ) {
            const newVariantId = (mutation.target as HTMLInputElement).value;
            if (newVariantId && newVariantId !== this.vId) {
              this.vId = newVariantId;
            }
          }
        }
      });

      // Watch for changes to the variant ID input
      const variantInput = get<HTMLInputElement>(
        'input[name="id"]',
        this.elForm,
      );
      if (variantInput) {
        observer.observe(variantInput, {
          attributes: true,
          attributeFilter: ["value"],
        });
      }
    };

    private getVariant = () => {
      return this.vData?.productVariant.product.variants.edges.find(
        (variant) => {
          const vId = variant.node.id.replace(
            "gid://shopify/ProductVariant/",
            "",
          );
          return vId === this.vId;
        },
      );
    };

    private createPreorderSubmitButton = () => {
      const button = this.elOriginalBtn as HTMLButtonElement;
      const buttonContainer = button.parentElement;
      if (!buttonContainer) return this.stopRejectingFormSubmissions();

      const variant = this.getVariant();
      if (!variant) return this.stopRejectingFormSubmissions();

      const { availableForSale, inventoryPolicy, inventoryQuantity } =
        variant.node;

      // Create preorder button
      this.elPreorderBtn = document.createElement("button");
      this.elPreorderBtn.type = "submit";
      this.elPreorderBtn.className = button.className;
      buttonContainer.prepend(this.elPreorderBtn);

      const originalButtonText = button.textContent?.trim();
      if (!originalButtonText) return this.stopRejectingFormSubmissions();

      this.updatePreorderButton(
        availableForSale,
        inventoryPolicy,
        inventoryQuantity,
        this.elPreorderBtn,
        originalButtonText,
      );

      // Hide original button but keep it in DOM for observation
      button.style.display = "none";

      // Create observer to watch for text changes
      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (
            mutation.type === "characterData" ||
            mutation.type === "childList"
          ) {
            const originalButtonText = button.textContent?.trim();
            if (!originalButtonText) return this.stopRejectingFormSubmissions();

            const newVariant = this.getVariant();
            if (!newVariant) return this.stopRejectingFormSubmissions();
            const { availableForSale, inventoryPolicy, inventoryQuantity } =
              newVariant.node;

            this.updatePreorderButton(
              availableForSale,
              inventoryPolicy,
              inventoryQuantity,
              this.elPreorderBtn,
              originalButtonText,
            );
          }
        }
      });

      // Start observing the original button for text changes
      observer.observe(button, {
        characterData: true,
        childList: true,
        subtree: true,
      });

      this.elPreorderBtn?.addEventListener("click", () => {
        this.stopRejectingFormSubmissions();
        this.elOriginalBtn?.click();
        this.startRejectingFormSubmissions();
      });
    };

    updatePreorderButton = (
      availableForSale: boolean,
      inventoryPolicy: string,
      inventoryQuantity: number,
      targetButton: HTMLButtonElement | undefined,
      originalButtonText: string,
    ) => {
      if (
        !availableForSale ||
        (inventoryPolicy === "deny" && inventoryQuantity <= 0)
      ) {
        if (!targetButton) return;
        targetButton.setAttribute("disabled", "");
        targetButton.textContent = originalButtonText;
      } else {
        if (!targetButton) return;
        targetButton.removeAttribute("disabled");
        targetButton.textContent = this.buttonPreorderText;
      }
    };
  }
  const loadScript = () => {
    const elCartAddForms = getAll<HTMLFormElement>('form[action="/cart/add"]');
    for (const elCartAddForm of elCartAddForms)
      new DropdeckPreorder(elCartAddForm);
  };

  document.addEventListener("DOMContentLoaded", loadScript);
  document.addEventListener("shopify:section:load", loadScript);
})();
