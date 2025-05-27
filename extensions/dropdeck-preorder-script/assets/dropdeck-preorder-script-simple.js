"use strict";
(function () {
    function get(selector, node = document) {
        return node.querySelector(selector) ?? undefined;
    }
    function getAll(selector, node = document) {
        return [...node.querySelectorAll(selector)];
    }
    class ApplyDropdeckToAddToCartForm {
        constructor(form) {
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
                const errorMessage = "Fatal dropdeck error: please contact samclarkeweb@protonmail.com with your store address and details.";
                const elError = document.createElement("span");
                elError.textContent = errorMessage;
                this.elForm.prepend(elError);
                console.error(this.elForm, errorMessage);
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
            this.enforceUnitsPerCustomerLimit = (unitsPerCustomer) => {
                if (!this.elQuantityInput || unitsPerCustomer === 0)
                    return;
                this.elQuantityInput.max = unitsPerCustomer.toString();
                this.elQuantityInput.value = "1";
            };
            this.createUnitsPerCustomerMessage = (unitsPerCustomer) => {
                if (unitsPerCustomer === 0)
                    return;
                const elUnitsPerCustomerMessage = document.createElement("small");
                elUnitsPerCustomerMessage.textContent = `Limit per customer: ${unitsPerCustomer} unit(s)`;
                elUnitsPerCustomerMessage.style.display = "block";
                elUnitsPerCustomerMessage.style.marginBottom = "6px";
                this.elForm.prepend(elUnitsPerCustomerMessage);
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
                            let originalButtonText = button.textContent?.trim();
                            if (originalButtonText?.toLowerCase().includes("added")) {
                                originalButtonText = originalButtonText.replace(" Added", "").replace(" added", "");
                            }
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
            this.elSection = form.closest(".shopify-section");
            this.elForm = form;
            this.vId =
                get('input[name="id"]', form)?.value ??
                    new FormData(form).get("id");
            this.elQuantityInput = get('input[name="quantity"]', this.elSection);
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
                    target: "get-preorder-data",
                }),
            };
            fetch("/apps/px", fetchOptions)
                .then((res) => {
                return res.json();
            })
                .then((res) => {
                this.vData = res.data.data;
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
                const unitsPerCustomer = Number(sellingPlan.node.metafields.edges[0].node.value);
                this.handleVariantIdChanges();
                this.createUnitsPerCustomerMessage(unitsPerCustomer);
                this.createPreorderSubmitButton();
                this.enforceUnitsPerCustomerLimit(unitsPerCustomer);
                this.elForm.addEventListener("change", () => {
                    setTimeout(() => {
                        this.enforceUnitsPerCustomerLimit(unitsPerCustomer);
                    }, 300);
                });
                this.elForm.addEventListener("submit", () => {
                    const formData = new FormData(this.elForm);
                    const currentQuantity = parseInt(String(formData.get("quantity")));
                    if (currentQuantity > unitsPerCustomer) {
                        formData.set("quantity", unitsPerCustomer.toString());
                        if (this.elQuantityInput)
                            this.elQuantityInput.value = unitsPerCustomer.toString();
                    }
                });
                this.elForm.classList.add("js-dropdeck-script-injected");
            })
                .catch((error) => {
                console.error(error);
            })
                .finally(() => {
                this.loader?.hide();
            });
        }
    }
    class ApplyDropdeckToCartForm {
        constructor(form) {
            this.loaders = new Map();
            this.init = () => {
                if (this.elInputs.length === 0) {
                    console.error(this.elForm, "Fatal dropdeck error: please contact samclarkeweb@protonmail.com with your store address and details.");
                    return;
                }
                for (const elInput of this.elInputs) {
                    this.injectSellingPlan(elInput);
                }
                const observer = new MutationObserver((mutations) => {
                    const hasElementChanges = mutations.some(mutation => mutation.type === 'childList' &&
                        (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) &&
                        this.elForm.contains(mutation.target));
                    if (hasElementChanges) {
                        this.elInputs = getAll('input[name="updates[]"], input[name="quantity"]', this.elForm);
                        for (const elInput of this.elInputs) {
                            this.injectSellingPlan(elInput);
                        }
                    }
                });
                observer.observe(this.elForm, {
                    childList: true,
                    subtree: true
                });
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
            this.handleLoadingStyling = (elInput) => {
                const elInputContainer = elInput.parentElement;
                let elButtonPlus;
                let elButtonMinus;
                if (elInputContainer) {
                    elButtonPlus = get("[name=plus]", elInputContainer);
                    elButtonMinus = get("[name=minus]", elInputContainer);
                }
                return {
                    setup: () => {
                        if (elButtonPlus) {
                            elButtonPlus.style.transition = "opacity 300ms ease-in-out";
                            elButtonPlus.style.willChange = "opacity";
                        }
                        if (elButtonMinus) {
                            elButtonMinus.style.transition = "opacity 300ms ease-in-out";
                            elButtonMinus.style.willChange = "opacity";
                        }
                        elInput.style.transition = "opacity 300ms ease-in-out";
                        elInput.style.willChange = "opacity";
                    },
                    show: () => {
                        if (elButtonPlus) {
                            elButtonPlus.setAttribute("disabled", "");
                            elButtonPlus.style.opacity = "0.3";
                        }
                        if (elButtonMinus) {
                            elButtonMinus.setAttribute("disabled", "");
                            elButtonMinus.style.opacity = "0.3";
                        }
                        elInput.setAttribute("disabled", "");
                        elInput.style.opacity = "0.3";
                    },
                    hide: () => {
                        if (elButtonPlus) {
                            elButtonPlus.removeAttribute("disabled");
                            elButtonPlus.style.opacity = "1";
                        }
                        if (elButtonMinus) {
                            elButtonMinus.removeAttribute("disabled");
                            elButtonMinus.style.opacity = "1";
                        }
                        elInput.removeAttribute("disabled");
                        elInput.style.opacity = "1";
                    },
                };
            };
            this.enforceUnitsPerCustomerLimit = (elInput, unitsPerCustomer) => {
                if (unitsPerCustomer === 0)
                    return;
                elInput.max = unitsPerCustomer.toString();
            };
            this.elSection = form.closest(".shopify-section");
            this.elForm = form;
            this.elInputs = getAll('input[name="updates[]"], input[name="quantity"]', this.elForm);
            this.init();
        }
        findVariantId(el) {
            const dataAttributes = [
                { dataset: 'variantId', selector: 'variant-id' },
                { dataset: 'quantityVariantId', selector: 'quantity-variant-id' },
                { dataset: 'quantityId', selector: 'quantity-id' },
                { dataset: 'lineItemVariantId', selector: 'line-item-variant-id' },
                { dataset: 'lineItemId', selector: 'line-item-id' },
                { dataset: 'itemId', selector: 'item-id' },
                { dataset: 'id', selector: 'id' }
            ];
            for (const attr of dataAttributes) {
                const value = el.dataset[attr.dataset];
                if (value)
                    return value;
            }
            for (const attr of dataAttributes) {
                const selector = `[data-${attr.selector}]`;
                const element = el.closest(selector);
                if (element) {
                    return element.dataset[attr.dataset];
                }
            }
            return undefined;
        }
        injectSellingPlan(elInput) {
            const vId = this.findVariantId(elInput);
            if (!vId)
                return;
            this.startRejectingFormSubmissions();
            const loader = this.handleLoadingStyling(elInput);
            this.loaders.set(elInput, loader);
            loader.setup();
            loader.show();
            const fetchOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    variantId: vId,
                    target: "get-preorder-data",
                }),
            };
            fetch("/apps/px", fetchOptions)
                .then((res) => res.json())
                .then((res) => {
                const vData = res.data.data;
                const { product } = vData.productVariant;
                const sellingPlanGroupsCount = product.sellingPlanGroupsCount.count;
                if (sellingPlanGroupsCount === 0)
                    return this.stopRejectingFormSubmissions();
                const sellingPlanGroup = product.sellingPlanGroups.edges.find((sellingPlanGroup) => sellingPlanGroup.node.merchantCode === "Dropdeck Preorder");
                if (!sellingPlanGroup)
                    return this.stopRejectingFormSubmissions();
                const sellingPlan = sellingPlanGroup.node.sellingPlans.edges[0];
                if (!sellingPlan)
                    return this.stopRejectingFormSubmissions();
                const dropdeckPreorderData = {
                    sellingPlanGroupId: sellingPlanGroup.node.id,
                    sellingPlanId: sellingPlan.node.id,
                    releaseDate: sellingPlan.node.deliveryPolicy.fulfillmentExactTime,
                    unitsPerCustomer: Number(sellingPlan.node.metafields.edges[0].node.value),
                };
                const { unitsPerCustomer } = dropdeckPreorderData;
                this.enforceUnitsPerCustomerLimit(elInput, unitsPerCustomer);
                this.elForm.classList.add("js-dropdeck-script-injected");
            })
                .catch((error) => {
                console.error(error);
            })
                .finally(() => {
                const loader = this.loaders.get(elInput);
                loader?.hide();
                this.stopRejectingFormSubmissions();
            });
        }
    }
    const loadScript = () => {
        const elCartAddForms = getAll('form[action="/cart/add"]');
        for (const elCartAddForm of elCartAddForms) {
            if (elCartAddForm.classList.contains("js-dropdeck-script-injected"))
                continue;
            new ApplyDropdeckToAddToCartForm(elCartAddForm);
        }
        const elCartForms = getAll('form[action="/cart"]');
        for (const elCartForm of elCartForms) {
            if (elCartForm.classList.contains("js-dropdeck-script-injected"))
                continue;
            new ApplyDropdeckToCartForm(elCartForm);
        }
    };
    document.addEventListener("DOMContentLoaded", loadScript);
    document.addEventListener("shopify:section:load", loadScript);
    document.addEventListener("dropdeck:reload", loadScript);
    window.dropdeck = {
        refresh: function () {
            return loadScript();
        }
    };
})();
