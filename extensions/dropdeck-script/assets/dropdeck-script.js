(function () {
  function hijackButtons() {
    console.log('hijackButtons loaded');
  }

  document.addEventListener('DOMContentLoaded', hijackButtons);
  document.addEventListener('shopify:section:load', hijackButtons);
})();