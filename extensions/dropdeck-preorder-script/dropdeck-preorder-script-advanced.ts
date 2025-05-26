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

  class ApplyDropdeckToAddToCartForm {
    // Elements
    elForm: HTMLFormElement;

    constructor(form: HTMLFormElement) {
      this.elForm = form;
    }
  }

  class ApplyDropdeckToCartForm {
    // Elements
    elForm: HTMLFormElement;

    constructor(form: HTMLFormElement) {
      this.elForm = form;
    }
  }

  const loadScript = () => {
    const elCartAddForms = getAll<HTMLFormElement>('form[action="/cart/add"]');
    for (const elCartAddForm of elCartAddForms) {
      // The script has already been run on this element.
      if (elCartAddForm.classList.contains("js-dropdeck-script-injected")) continue;

      new ApplyDropdeckToAddToCartForm(elCartAddForm);
    }

    const elCartForms = getAll<HTMLFormElement>('form[action="/cart"]');
    for (const elCartForm of elCartForms) {
      // The script has already been run on this element.
      if (elCartForm.classList.contains("js-dropdeck-script-injected")) continue;

      new ApplyDropdeckToCartForm(elCartForm);
    }
  };

  document.addEventListener("DOMContentLoaded", loadScript);
  document.addEventListener("shopify:section:load", loadScript);
  document.addEventListener("dropdeck:reload", loadScript);

  // Define window.dropdeck type at file level
  type DropdeckWindow = Window & {
    dropdeck: {
      refresh?: () => void;
    }
  }

  // Initialize dropdeck object
  ((window as unknown) as DropdeckWindow).dropdeck = {
    refresh: function() {
      return loadScript();
    }
  };
})();
