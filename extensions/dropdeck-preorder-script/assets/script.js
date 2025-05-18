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
            this.buttonPreorderText = "Preorder";
            this.load = () => {
                if (!this.elBtn)
                    return;
                if (!this.vId) {
                    this.createFatalErrorElement();
                    return;
                }
                // Prevent form submission immediately
                this.elForm.addEventListener("submit", this.rejectFormSubmission, {
                    capture: true,
                });
                this.injectSellingPlan();
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
            this.addLoaderElement = () => {
                const hasPreorderStyles = get("#dropdeck-preorder-styles");
                // Inject CSS only one.
                if (!hasPreorderStyles) {
                    const styleEl = document.createElement("style");
                    styleEl.id = "dropdeck-preorder-styles";
                    styleEl.textContent = `
          .dropdeck-preorder-loader {
            position: absolute;
            z-index: 3;
            display: flex;
            aspect-ratio: 1;
            width: 1.8rem;
            height: 1.8rem;
            opacity: 0;
            will-change: opacity;
            transition: opacity 300ms ease;
            pointer-events: none;
            align-items: center;
            justify-content: center;
            background-color: #ffffff70;
            width: 100%;
            height: 100%;
          }

          .dropdeck-preorder-loader.visible {
            opacity: 1;
          }

          .dropdeck-preorder-loader__spinner {
            display: inline-flex;
            height: 3.6rem;
            width: 3.6rem;
          }

          .dropdeck-preorder-loader__spinner .spinner {
            animation: rotator 1.4s linear infinite;
          }

          .dropdeck-preorder-loader__spinner .path {
            transform-origin: center;
            stroke-dasharray: 280;
            stroke-dashoffset: 0;
            animation: dash 1.4s ease-in-out infinite;
          }

          @media screen and (forced-colors: active) {
            .dropdeck-preorder-loader__spinner .path {
              stroke: canvastext;
            }
          }

          @keyframes rotator {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(270deg); }
          }

          @keyframes dash {
            0% { stroke-dashoffset: 280; }
            50% { transform: rotate(135deg); stroke-dashoffset: 75; }
            100% { transform: rotate(450deg); stroke-dashoffset: 280; }
          }
        `;
                    document.head.append(styleEl);
                }
                const elLoader = document.createElement("div");
                elLoader.classList.add("dropdeck-preorder-loader");
                elLoader.ariaHidden = "true";
                // Create spinner SVG
                elLoader.innerHTML = `
        <div class="dropdeck-preorder-loader__spinner">
          <svg
            class="spinner"
            focusable="false"
            viewBox="0 0 66 66"
            xmlns="http://www.w3.org/2000/svg"
            stroke="inherit"
            width="66"
            height="66"
          >
            <circle class="path" fill="none" stroke-width="6" cx="33" cy="33" r="30"></circle>
          </svg>
        </div>
      `;
                this.elForm.style.position = "relative";
                this.elForm.style.overflow = "hidden";
                this.elForm.prepend(elLoader);
                return {
                    show: () => {
                        elLoader.style.pointerEvents = "all";
                        elLoader.style.opacity = "1";
                    },
                    hide: () => {
                        elLoader.style.pointerEvents = "none";
                        elLoader.style.opacity = "0";
                    },
                };
            };
            this.handleVariantIdChanges = () => {
                // Watch for changes to the variant ID input
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
                // Watch for changes to the variant ID input
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
                const button = this.elBtn;
                const buttonContainer = button.parentElement;
                if (!buttonContainer)
                    return;
                const variant = this.getVariant();
                if (!variant)
                    return;
                const { availableForSale, inventoryPolicy, inventoryQuantity } = variant.node;
                // Create preorder button
                const preorderButton = document.createElement("button");
                preorderButton.type = "submit";
                preorderButton.className = button.className;
                buttonContainer.prepend(preorderButton);
                const originalButtonText = button.textContent?.trim();
                if (!originalButtonText)
                    return;
                this.updatePreorderButton(availableForSale, inventoryPolicy, inventoryQuantity, preorderButton, originalButtonText);
                // Hide original button but keep it in DOM for observation
                button.style.display = "none";
                // Create observer to watch for text changes
                const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        if (mutation.type === "characterData" ||
                            mutation.type === "childList") {
                            const originalButtonText = button.textContent?.trim();
                            if (!originalButtonText)
                                return;
                            const newVariant = this.getVariant();
                            if (!newVariant)
                                return;
                            const { availableForSale, inventoryPolicy, inventoryQuantity } = newVariant.node;
                            this.updatePreorderButton(availableForSale, inventoryPolicy, inventoryQuantity, preorderButton, originalButtonText);
                        }
                    }
                });
                // Start observing the original button for text changes
                observer.observe(button, {
                    characterData: true,
                    childList: true,
                    subtree: true,
                });
                preorderButton.addEventListener("click", () => {
                    this.elForm.removeEventListener("submit", this.rejectFormSubmission, {
                        capture: true,
                    });
                    this.elBtn?.click();
                    this.elForm.addEventListener("submit", this.rejectFormSubmission, {
                        capture: true,
                    });
                });
            };
            this.updatePreorderButton = (availableForSale, inventoryPolicy, inventoryQuantity, targetButton, originalButtonText) => {
                if (!availableForSale ||
                    (inventoryPolicy === "deny" && inventoryQuantity <= 0)) {
                    targetButton.setAttribute("disabled", "");
                    targetButton.textContent = originalButtonText;
                }
                else {
                    targetButton.removeAttribute("disabled");
                    targetButton.textContent = this.buttonPreorderText;
                }
            };
            this.elForm = form;
            this.vId =
                get('input[name="id"]', form)?.value ??
                    new FormData(form).get("id");
            this.elBtn = get("button[type='submit']", form);
            this.load();
        }
        injectSellingPlan() {
            const loader = this.addLoaderElement();
            loader.show();
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
                return res.json();
            })
                .then((res) => {
                this.vData = res.data;
                const { product } = this.vData.productVariant;
                const sellingPlanGroupsCount = product.sellingPlanGroupsCount.count;
                if (sellingPlanGroupsCount === 0)
                    return;
                const sellingPlanGroup = product.sellingPlanGroups.edges.find((sellingPlanGroup) => sellingPlanGroup.node.merchantCode === "Dropdeck Preorder");
                if (!sellingPlanGroup)
                    return;
                const sellingPlan = sellingPlanGroup.node.sellingPlans.edges[0];
                if (!sellingPlan)
                    return;
                const elSellingPlanInput = get('input[name="selling_plan"]', this.elForm);
                if (!elSellingPlanInput) {
                    const sellingPlanId = sellingPlan.node.id.replace("gid://shopify/SellingPlan/", "");
                    const sellingPlanInput = document.createElement("input");
                    sellingPlanInput.setAttribute("name", "selling_plan");
                    sellingPlanInput.setAttribute("type", "hidden");
                    sellingPlanInput.setAttribute("value", sellingPlanId);
                    this.elForm.prepend(sellingPlanInput);
                }
                const dropdeckPreorderProperty = document.createElement("input");
                dropdeckPreorderProperty.setAttribute("name", "properties[_dropdeck_preorder]");
                dropdeckPreorderProperty.setAttribute("id", "dropdeck_preorder");
                dropdeckPreorderProperty.setAttribute("type", "hidden");
                dropdeckPreorderProperty.setAttribute("value", "true");
                this.elForm.prepend(dropdeckPreorderProperty);
                this.handleVariantIdChanges();
                this.createPreorderSubmitButton();
            })
                .catch((error) => {
                console.error(error);
            })
                .finally(() => {
                loader.hide();
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

