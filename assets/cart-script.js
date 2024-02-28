
  document.addEventListener('DOMContentLoaded', function () {
    function isIE() {
      const ua = window.navigator.userAgent;
      const msie = ua.indexOf('MSIE ');
      const trident = ua.indexOf('Trident/');

      return msie > 0 || trident > 0;
    }

    if (!isIE()) return;
    const cartSubmitInput = document.createElement('input');
    cartSubmitInput.setAttribute('name', 'checkout');
    cartSubmitInput.setAttribute('type', 'hidden');
    document.querySelector('#cart').appendChild(cartSubmitInput);
    document.querySelector('#checkout').addEventListener('click', function (event) {
      document.querySelector('#cart').submit();
    });
  });


  class CartCol extends HTMLElement{
    constructor() {
      super()
      this.sliderInit()
      this.querySelectorAll("form").forEach(form => form.addEventListener("submit", this.handleSubmitEvent.bind(this)))
      this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
    }

    sliderInit() {
      new Swiper(".drawer__collection .swiper", {
        slidesPerView: 1.1,
        spaceBetween: 15,
        breakpoints: {
          480: {
            slidesPerView: 1.2,
            spaceBetween: 15,
          },
          768: {
            slidesPerView: 1.3,
            spaceBetween: 15,
          },
          1020: {
            slidesPerView: 1.5,
            spaceBetween: 19,
          }
        },
      })
    }

    handleSubmitEvent(e) {
      e.preventDefault()
      this.handleFetchData(e) 
    }

    handleFetchData(e) {
      let formData = new FormData(e.target);
      let cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
  
      const config = fetchConfig('javascript');
      config.headers['X-Requested-With'] = 'XMLHttpRequest';
      delete config.headers['Content-Type'];
      if (cart) {
        formData.append(
          'sections',
          cart.getSectionsToRender().map((section) => section.id)
        );
        formData.append('sections_url', window.location.pathname);
        cart.setActiveElement(document.activeElement);
      }
      config.body = formData;
      fetch(window.Shopify.routes.root + 'cart/add.json', config)
      .then(response => response.json())
      .then(response => cart.renderContents(response))
      .catch((error) => console.error('Error:', error))
      .finally(res => {
        if (cart && cart.classList.contains('is-empty')) cart.classList.remove('is-empty'); 
        this.sliderInit()
      })
    }
  }

customElements.define("dc-element", CartCol)
