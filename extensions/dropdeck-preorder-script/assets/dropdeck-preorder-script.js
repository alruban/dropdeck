"use strict";
(function () {
    function get(selector, node = document) {
        return node.querySelector(selector) ?? undefined;
    }
    function getAll(selector, node = document) {
        return [...node.querySelectorAll(selector)];
    }
    class DropdeckPreorder {
        constructor(form) {
            this.eachshit = true;
            this.buttonPreorderText = "Preorder";
            this.init = () => {
                if (!this.elOriginalBtn)
                    return;
                if (!this.vId) {
                    this.createFatalErrorElement();
                    return;
                }
                this.injectSellingPlan();
            };
            this.startRejectingFormSubmissions = () => {
                this.elForm.addEventListener("submit", this.rejectFormSubmission, {
                    capture: true,
                });
            };
            this.stopRejectingFormSubmissions = () => {
                this.elForm.removeEventListener("submit", this.rejectFormSubmission, {
                    capture: true,
                });
            };
            this.rejectFormSubmission = (e) => {
                e.preventDefault();
                e.stopPropagation();
                return false;
            };
            this.createFatalErrorElement = () => {
                const elError = document.createElement("span");
                elError.textContent =
                    "Fatal error: please contact samclarkeweb@protonmail.com with your store address and details.";
                this.elForm.prepend(elError);
            };
            this.handleLoadingStyling = () => {
                this.elShopifyAlternatePayment = get(".shopify-payment-button[data-shopify=payment-button]", this.elForm);
                return {
                    setup: () => {
                        if (!this.elOriginalBtn || !this.elShopifyAlternatePayment)
                            return;
                        this.elOriginalBtn.style.transition = "opacity 300ms ease-in-out";
                        this.elOriginalBtn.style.willChange = "opacity";
                        this.elShopifyAlternatePayment.style.transition = "opacity 300ms ease-in-out";
                        this.elShopifyAlternatePayment.style.willChange = "opacity";
                    },
                    show: () => {
                        if (!this.elOriginalBtn || !this.elShopifyAlternatePayment)
                            return;
                        this.elOriginalBtn.setAttribute("disabled", "");
                        this.elOriginalBtn.style.opacity = "0.3";
                        this.elShopifyAlternatePayment.style.opacity = "0.3";
                    },
                    hide: () => {
                        if (!this.elOriginalBtn || !this.elShopifyAlternatePayment)
                            return;
                        this.elOriginalBtn.removeAttribute("disabled");
                        this.elOriginalBtn.style.opacity = "1";
                        this.elShopifyAlternatePayment.style.opacity = "1";
                    },
                };
            };
            this.handleVariantIdChanges = () => {
                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        if (mutation.type === "attributes" &&
                            mutation.attributeName === "value") {
                            const newVariantId = mutation.target.value;
                            if (newVariantId && newVariantId !== this.vId) {
                                this.vId = newVariantId;
                            }
                        }
                    }
                });
                const variantInput = get('input[name="id"]', this.elForm);
                if (variantInput) {
                    observer.observe(variantInput, {
                        attributes: true,
                        attributeFilter: ["value"],
                    });
                }
            };
            this.getVariant = () => {
                return this.vData?.productVariant.product.variants.edges.find((variant) => {
                    const vId = variant.node.id.replace("gid://shopify/ProductVariant/", "");
                    return vId === this.vId;
                });
            };
            this.createPreorderSubmitButton = () => {
                const button = this.elOriginalBtn;
                const buttonContainer = button.parentElement;
                if (!buttonContainer)
                    return this.stopRejectingFormSubmissions();
                const variant = this.getVariant();
                if (!variant)
                    return this.stopRejectingFormSubmissions();
                const { availableForSale, inventoryPolicy, inventoryQuantity } = variant.node;
                this.elPreorderBtn = document.createElement("button");
                this.elPreorderBtn.type = "submit";
                this.elPreorderBtn.className = button.className;
                buttonContainer.prepend(this.elPreorderBtn);
                const originalButtonText = button.textContent?.trim();
                if (!originalButtonText)
                    return this.stopRejectingFormSubmissions();
                this.updatePreorderButton(availableForSale, inventoryPolicy, inventoryQuantity, this.elPreorderBtn, originalButtonText);
                button.style.display = "none";
                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        if (mutation.type === "characterData" ||
                            mutation.type === "childList") {
                            const originalButtonText = button.textContent?.trim();
                            if (!originalButtonText)
                                return this.stopRejectingFormSubmissions();
                            const newVariant = this.getVariant();
                            if (!newVariant)
                                return this.stopRejectingFormSubmissions();
                            const { availableForSale, inventoryPolicy, inventoryQuantity } = newVariant.node;
                            this.updatePreorderButton(availableForSale, inventoryPolicy, inventoryQuantity, this.elPreorderBtn, originalButtonText);
                        }
                    }
                });
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
            this.updatePreorderButton = (availableForSale, inventoryPolicy, inventoryQuantity, targetButton, originalButtonText) => {
                if (!availableForSale ||
                    (inventoryPolicy === "deny" && inventoryQuantity <= 0)) {
                    if (!targetButton)
                        return;
                    targetButton.setAttribute("disabled", "");
                    targetButton.textContent = originalButtonText;
                }
                else {
                    if (!targetButton)
                        return;
                    targetButton.removeAttribute("disabled");
                    targetButton.textContent = this.buttonPreorderText;
                }
            };
            this.elForm = form;
            this.vId =
                get('input[name="id"]', form)?.value ??
                    new FormData(form).get("id");
            this.elOriginalBtn = get("button[type='submit']", form);
            this.elShopifyAlternatePayment = get(".shopify-payment-button[data-shopify=payment-button]", form);
            this.loader = this.handleLoadingStyling();
            this.init();
        }
        injectSellingPlan() {
            this.startRejectingFormSubmissions();
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
                return res.json();
            })
                .then((res) => {
                console.log("res", res.data);
                this.vData = res.data;
                const { product } = this.vData.productVariant;
                const sellingPlanGroupsCount = product.sellingPlanGroupsCount.count;
                if (sellingPlanGroupsCount === 0)
                    return this.stopRejectingFormSubmissions();
                const sellingPlanGroup = product.sellingPlanGroups.edges.find((sellingPlanGroup) => sellingPlanGroup.node.merchantCode === "Dropdeck Preorder");
                if (!sellingPlanGroup)
                    return this.stopRejectingFormSubmissions();
                const sellingPlan = sellingPlanGroup.node.sellingPlans.edges[0];
                if (!sellingPlan)
                    return this.stopRejectingFormSubmissions();
                const elSellingPlanInput = get('input[name="selling_plan"]', this.elForm);
                if (!elSellingPlanInput) {
                    const sellingPlanId = sellingPlan.node.id.replace("gid://shopify/SellingPlan/", "");
                    const sellingPlanInput = document.createElement("input");
                    sellingPlanInput.setAttribute("name", "selling_plan");
                    sellingPlanInput.setAttribute("type", "hidden");
                    sellingPlanInput.setAttribute("value", sellingPlanId);
                    this.elForm.prepend(sellingPlanInput);
                }
                const isDropdeckPreorderProp = document.createElement("input");
                isDropdeckPreorderProp.setAttribute("name", "properties[_dropdeck_preorder]");
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
                dropdeckPreorderDataProp.setAttribute("name", "properties[_dropdeck_preorder_data]");
                dropdeckPreorderDataProp.setAttribute("id", "dropdeck_preorder_data");
                dropdeckPreorderDataProp.setAttribute("type", "hidden");
                dropdeckPreorderDataProp.setAttribute("value", JSON.stringify(dropdeckPreorderData));
                this.elForm.prepend(dropdeckPreorderDataProp);
                this.handleVariantIdChanges();
                this.createPreorderSubmitButton();
            })
                .catch((error) => {
                console.error(error);
            })
                .finally(() => {
                this.loader?.hide();
            });
        }
    }
    const loadScript = () => {
        const elCartAddForms = getAll('form[action="/cart/add"]');
        for (const elCartAddForm of elCartAddForms)
            new DropdeckPreorder(elCartAddForm);
    };
    document.addEventListener("DOMContentLoaded", loadScript);
    document.addEventListener("shopify:section:load", loadScript);
})();
