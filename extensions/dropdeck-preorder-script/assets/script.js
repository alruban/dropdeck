(function () {
  class Dropdeck {
    // Elements
    elForms = document.querySelectorAll('form[action="/cart/add"]');

    constructor() {
      for (const elForm of this.elForms) {
        const elProductIdInput = elForm.querySelector('input[name="product-id"]');
        if (!elProductIdInput) continue;

        const productId = elProductIdInput.value;
        this.loadScript(productId);
      }
    }

    loadScript(productId) {
      console.log('Preorder Limit Script loaded');

      function getPreorderInfo() {
        console.log('getPreorderInfo');
        const fetchOptions = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            productId
          })
        }
    
        return fetch('/apps/px', fetchOptions)
          .then(res => {
            console.log('res', res); 
            return res.json();
          })
          .then(data => {
            console.log(data);
          });
      }

      getPreorderInfo()
    }
  }

  new Dropdeck();
})();
