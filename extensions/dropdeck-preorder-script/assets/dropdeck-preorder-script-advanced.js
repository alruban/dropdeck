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
            this.elForm = form;
        }
    }
    class ApplyDropdeckToCartForm {
        constructor(form) {
            this.elForm = form;
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
