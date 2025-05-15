document.addEventListener('DOMContentLoaded', function () {
  console.log('Preorder Limit Script loaded');

  const productId = window.meta?.product?.id; // use Shopify's meta object
  const customerId = window.meta?.customer?.id;

  async function getCart() {
    const res = await fetch('/cart.js');
    return res.json();
  }

  function enforceLimit(cart) {
    const preorderItem = cart.items.find(item => item.product_id === productId);

    if (preorderItem && preorderItem.quantity > 2) {
      alert('You cannot order more than 2 units of this product.');
      // Optionally auto-correct
      fetch(`/cart/change.js`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: preorderItem.key, quantity: 2 })
      }).then(() => location.reload());
    }
  }

  getCart().then(enforceLimit);
});
