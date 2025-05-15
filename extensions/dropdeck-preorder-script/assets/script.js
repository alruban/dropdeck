(function () {
  function loadScript() {
    console.log('Preorder Limit Script loaded');

    function getPreorderInfo() {
      console.log('getPreorderInfo');
      const fetchOptions = {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
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
    

  // const productId = window.meta?.product?.id; // use Shopify's meta object
  // const customerId = window.meta?.customer?.id;

  // async function getCart() {
  //   const res = await fetch('/cart.js');
  //   return res.json();
  // }

  // function enforceLimit(cart) {
  //   const preorderItem = cart.items.find(item => item.product_id === productId);

  //   if (preorderItem && preorderItem.quantity > 2) {
  //     alert('You cannot order more than 2 units of this product.');
  //     // Optionally auto-correct
  //     fetch(`/cart/change.js`, {
  //       method: 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ id: preorderItem.key, quantity: 2 })
  //     }).then(() => location.reload());
  //   }
  // }

  // getCart().then(enforceLimit);
  }

  document.addEventListener('DOMContentLoaded', loadScript);
  document.addEventListener('shopify:section:load', loadScript);
})();
