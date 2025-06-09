"use strict";
(function () {
    const decodeHTMLEntities = (text) => {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    };
    if (!document.getElementById('dropdeck-preorder-script-styles')) {
        const style = document.createElement('style');
        style.id = 'dropdeck-preorder-script-styles';
        style.textContent = `
      .dropdeck-preorder__message-container {
        margin-bottom: 12px;
        padding: 8px 12px;
        background: #f8f8f8;
        border-radius: 6px;
        border: 1px solid #e5e5e5;
        display: flex;
        flex-direction: column;
      }
      .dropdeck-preorder__message {
        display: block;
        font-size: 13px;
        color: #333;
      }
      .dropdeck-preorder__message--release-date {
        font-weight: 500;
      }
      .dropdeck-preorder__message--unit-restriction {
        color: #b15b00;
      }
      .dropdeck-preorder__error {
        position: fixed;
        top: 20px;
        right: 20px;
        color: #b15b00;
        font-size: 13px;
        padding: 12px 16px;
        background: #fff;
        border-radius: 6px;
        border: 1px solid #b15b00;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        transform: translateX(120%);
        transition: transform 0.3s ease-in-out;
        max-width: 300px;
      }
      .dropdeck-preorder__error:empty {
        display: none;
      }
      .dropdeck-preorder__error.show {
        transform: translateX(0);
      }
    `;
        document.head.appendChild(style);
    }
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
                this.createErrorMessageContainer();
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
            this.createErrorMessageContainer = () => {
                this.elErrorMessage = document.createElement("div");
                this.elErrorMessage.className = "dropdeck-preorder__error";
                this.elErrorMessage.setAttribute("role", "alert");
                this.elErrorMessage.setAttribute("aria-live", "polite");
                this.elErrorMessage.setAttribute("aria-atomic", "true");
                this.elErrorMessage.setAttribute("tabindex", "0");
                document.body.appendChild(this.elErrorMessage);
            };
            this.showErrorMessage = (message) => {
                if (!this.elErrorMessage)
                    return;
                this.elErrorMessage.textContent = decodeHTMLEntities(message);
                this.elErrorMessage.classList.add("show");
                setTimeout(() => {
                    this.elErrorMessage?.classList.remove("show");
                    setTimeout(() => {
                        if (this.elErrorMessage)
                            this.elErrorMessage.textContent = "";
                    }, 300);
                }, 5000);
            };
            this.createFatalErrorElement = () => {
                this.showErrorMessage(window.dropdeck.translations.fatal_error);
                console.error(this.elForm, window.dropdeck.translations.fatal_error);
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
            this.handleMessaging = (unitsPerCustomer, releaseDate) => {
                if (!location.pathname.includes("/products/"))
                    return;
                const { display_unit_restriction, display_release_date } = window.dropdeck.settings;
                if (display_unit_restriction || display_release_date) {
                    const elMessageContainer = document.createElement("div");
                    elMessageContainer.className = "dropdeck-preorder__message-container";
                    if (display_unit_restriction)
                        this.createUnitsPerCustomerMessage(unitsPerCustomer, elMessageContainer);
                    if (display_release_date)
                        this.createReleaseDateMessage(releaseDate, elMessageContainer);
                    this.elForm.prepend(elMessageContainer);
                }
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
            this.parseISOStringIntoFormalDate = (isoString) => {
                const dateObj = new Date(isoString);
                const day = dateObj.getDate();
                const month = dateObj.toLocaleString('default', { month: 'long' });
                const year = dateObj.getFullYear();
                const ordinal = (day) => {
                    if (day > 3 && day < 21)
                        return 'th';
                    switch (day % 10) {
                        case 1: return 'st';
                        case 2: return 'nd';
                        case 3: return 'rd';
                        default: return 'th';
                    }
                };
                return `${day}${ordinal(day)} ${month} ${year}`;
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
                const observer = new MutationObserver((mutations) => {
                    mutations.forEach((mutation) => {
                        if (mutation.type === 'attributes' && mutation.attributeName === 'value' && this.elQuantityInput) {
                            const newValue = parseInt(this.elQuantityInput.value);
                            if (newValue > unitsPerCustomer) {
                                this.elQuantityInput.value = unitsPerCustomer.toString();
                            }
                        }
                    });
                });
                observer.observe(this.elQuantityInput, {
                    attributes: true,
                    attributeFilter: ['value']
                });
                this.elQuantityInput.addEventListener('input', (e) => {
                    const target = e.target;
                    const value = parseInt(target.value);
                    if (value > unitsPerCustomer) {
                        target.value = unitsPerCustomer.toString();
                    }
                });
                this.elQuantityInput.addEventListener('change', (e) => {
                    const target = e.target;
                    const value = parseInt(target.value);
                    if (value > unitsPerCustomer) {
                        target.value = unitsPerCustomer.toString();
                    }
                });
            };
            this.createReleaseDateMessage = (releaseDate, elMessageContainer) => {
                const elReleaseDateMessage = document.createElement("small");
                elReleaseDateMessage.textContent = window.dropdeck.translations.release_date.replace("{{date}}", releaseDate);
                elReleaseDateMessage.className = "dropdeck-preorder__message dropdeck-preorder__message--release-date";
                elMessageContainer.prepend(elReleaseDateMessage);
            };
            this.createUnitsPerCustomerMessage = (unitsPerCustomer, elMessageContainer) => {
                if (unitsPerCustomer === 0)
                    return;
                const elUnitsPerCustomerMessage = document.createElement("small");
                elUnitsPerCustomerMessage.textContent = window.dropdeck.translations.limit_per_customer.replace("{{units}}", unitsPerCustomer.toString());
                elUnitsPerCustomerMessage.className = "dropdeck-preorder__message dropdeck-preorder__message--unit-restriction";
                elMessageContainer.prepend(elUnitsPerCustomerMessage);
            };
            this.createPreorderSubmitButton = (unitsPerCustomer) => {
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
                            let originalButtonText = String(button.textContent?.trim());
                            if (originalButtonText?.toLowerCase().includes(window.dropdeck.translations.added_lowercase)) {
                                originalButtonText = originalButtonText.replace(window.dropdeck.translations.added_capitalised, "").replace(window.dropdeck.translations.added_lowercase, "");
                            }
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
                this.elPreorderBtn?.addEventListener("click", async (e) => {
                    this.elPreorderBtn?.setAttribute("disabled", "");
                    if (unitsPerCustomer === 0) {
                        this.stopRejectingFormSubmissions();
                        this.elOriginalBtn?.click();
                        this.startRejectingFormSubmissions();
                        return;
                    }
                    const cartItems = await await fetch("/cart.js")
                        .then((res) => res.json())
                        .then((res) => {
                        return res.items;
                    })
                        .finally(() => {
                        this.elPreorderBtn?.removeAttribute("disabled");
                    });
                    const preorderItemInCart = cartItems.find((item) => item.id === Number(this.vId));
                    const units = (Number(this.elQuantityInput?.value) + preorderItemInCart ? preorderItemInCart.quantity : 0);
                    if (!preorderItemInCart || preorderItemInCart && units < unitsPerCustomer) {
                        this.stopRejectingFormSubmissions();
                        this.elOriginalBtn?.click();
                        this.startRejectingFormSubmissions();
                    }
                    else {
                        this.showErrorMessage(window.dropdeck.translations.limit_exceeded.replace("{{units_per_customer}}", unitsPerCustomer.toString()));
                    }
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
                const sellingPlanGroup = product.sellingPlanGroups.edges.find((sellingPlanGroup) => sellingPlanGroup.node.appId === "DROPDECK_PREORDER");
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
                const releaseDate = this.parseISOStringIntoFormalDate(sellingPlan.node.deliveryPolicy.fulfillmentExactTime);
                this.handleVariantIdChanges();
                this.handleMessaging(unitsPerCustomer, releaseDate);
                this.createPreorderSubmitButton(unitsPerCustomer);
                this.enforceUnitsPerCustomerLimit(unitsPerCustomer);
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
                this.stopRejectingFormSubmissions();
            })
                .finally(() => {
                this.loader?.hide();
            });
        }
    }
    class ApplyDropdeckToCartForm {
        constructor(form) {
            this.loaders = new Map();
            this.inputLimitCleanupMap = new WeakMap();
            this.init = () => {
                if (this.elForm.id.includes("notification"))
                    return;
                if (this.elInputs.length === 0) {
                    console.error(this.elForm, window.dropdeck.translations.fatal_error);
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
            this.disablePlusButton = (elInput, quantity, unitsPerCustomer) => {
                const lineItem = elInput.closest("tr") || elInput.closest("li");
                if (!lineItem)
                    return;
                const plusButton = get("[name=plus]", lineItem);
                if (!plusButton)
                    return;
                setTimeout(() => {
                    if (quantity === unitsPerCustomer) {
                        plusButton.setAttribute("disabled", "");
                    }
                    else {
                        plusButton.removeAttribute("disabled");
                    }
                }, 300);
            };
            this.enforceUnitsPerCustomerLimit = (elInput, unitsPerCustomer) => {
                if (unitsPerCustomer === 0)
                    return;
                const prev = this.inputLimitCleanupMap.get(elInput);
                if (prev) {
                    elInput.removeEventListener('input', prev.inputHandler);
                    elInput.removeEventListener('change', prev.inputHandler);
                    prev.observer.disconnect();
                }
                elInput.max = unitsPerCustomer.toString();
                const quantity = Number(elInput.value);
                if (quantity > unitsPerCustomer) {
                    elInput.value = unitsPerCustomer.toString();
                    setTimeout(() => {
                        this.elForm.submit();
                    }, 300);
                }
                this.disablePlusButton(elInput, quantity, unitsPerCustomer);
                const inputHandler = (e) => {
                    const target = e.target;
                    elInput.max = unitsPerCustomer.toString();
                    const quantity = parseInt(target.value);
                    if (quantity > unitsPerCustomer) {
                        target.value = unitsPerCustomer.toString();
                    }
                    this.disablePlusButton(elInput, quantity, unitsPerCustomer);
                };
                elInput.addEventListener('input', inputHandler);
                elInput.addEventListener('change', inputHandler);
                const observer = new MutationObserver(() => {
                    elInput.max = unitsPerCustomer.toString();
                    const quantity = parseInt(elInput.value);
                    if (quantity > unitsPerCustomer) {
                        elInput.value = unitsPerCustomer.toString();
                        this.elForm.submit();
                    }
                    this.disablePlusButton(elInput, quantity, unitsPerCustomer);
                });
                observer.observe(elInput, { attributes: true, attributeFilter: ['value'] });
                this.inputLimitCleanupMap.set(elInput, { inputHandler, observer });
                const lineItem = elInput.closest("tr") || elInput.closest("li");
                if (!lineItem)
                    return;
                const plusButton = get("[name=plus]", lineItem);
                if (!plusButton)
                    return;
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
            let variantId;
            for (const attr of dataAttributes) {
                const value = el.dataset[attr.dataset];
                if (value && !isNaN(Number(value))) {
                    variantId = value;
                    break;
                }
            }
            if (!variantId) {
                for (const attr of dataAttributes) {
                    const selector = `[data-${attr.selector}]`;
                    const element = el.closest(selector);
                    if (element) {
                        const value = element.dataset[attr.dataset];
                        if (value && !isNaN(Number(value))) {
                            variantId = value;
                            break;
                        }
                    }
                }
            }
            if (!variantId) {
                const lineItem = el.closest("tr") || el.closest("li");
                if (lineItem) {
                    const href = lineItem.querySelector("a")?.href;
                    if (href) {
                        let url;
                        if (href.includes("www.")) {
                            url = new URL(href);
                        }
                        else {
                            url = new URL(href, window.location.origin);
                        }
                        const value = url.searchParams.get("variant") ?? undefined;
                        if (value && !isNaN(Number(value))) {
                            variantId = value;
                        }
                    }
                }
            }
            return variantId;
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
                const sellingPlanGroup = product.sellingPlanGroups.edges.find((sellingPlanGroup) => sellingPlanGroup.node.appId === "DROPDECK_PREORDER");
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
    const elSettings = get(".js-dropdeck-script-simple-settings", document);
    if (!elSettings)
        return;
    const settings = JSON.parse(elSettings.textContent ?? '{}');
    window.dropdeck = {
        settings: settings.settings,
        translations: settings.translations,
        refresh: function () {
            return loadScript();
        }
    };
})();
