(function () {
  class Dropdeck {
    // Elements
    elForms = document.querySelectorAll('form[action="/cart/add"]');

    constructor() {
      for (const elForm of this.elForms) {
        const elProductIdInput = elForm.querySelector('input[name="product-id"]');
        if (!elProductIdInput) continue;

        const productId = elProductIdInput.value;
        this.injectSellingPlan(elForm, productId);
      }
    }

    injectSellingPlan(elForm, productId) {
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ productId })
      }
  
      return fetch('/apps/px', fetchOptions)
        .then(res => {
          console.log('res', res); 
          return res.json();
        })
        .then(res => {
          const { product } = res.data;
          const sellingPlanGroupsCount = product.sellingPlanGroupsCount.count;
          if (sellingPlanGroupsCount === 0) return;

          const sellingPlanGroups = product.sellingPlanGroups.edges;
          const sellingPlanGroup = sellingPlanGroups.find((sellingPlanGroup) => sellingPlanGroup.node.merchantCode === "Dropdeck Preorder").node;
          if (!sellingPlanGroup) return;

          const sellingPlan = sellingPlanGroup.sellingPlans.edges[0].node;
          if (!sellingPlan) return;

          const elSellingPlanInput = elForm.querySelector('input[name="selling_plan"]');
          if (!elSellingPlanInput) {
            const sellingPlanId = sellingPlan.id.replace('gid://shopify/SellingPlan/', '');
            const sellingPlanInput = document.createElement('input');
            sellingPlanInput.setAttribute('name', 'selling_plan');
            sellingPlanInput.setAttribute('type', 'hidden');
            sellingPlanInput.setAttribute('value', sellingPlanId);
            elForm.prepend(sellingPlanInput);
          }

          console.log(dropdeckSellingPlan);
        });
    }
  }

  new Dropdeck();
})();
