
  class NpThumSwiper extends HTMLElement {
    constructor() {
      super()
      NpThumSwiper.scrollSlider()
      NpThumSwiper.thumbSlider()
      NpThumSwiper.activeSlide(this.dataset.src)
      // NpThumSwiper.scrollSwiper.controller.control = NpThumSwiper.thumbSwiper;
      // NpThumSwiper.thumbSwiper.controller.control = NpThumSwiper.scrollSwiper;
    }
    static thumbSlider() {
      NpThumSwiper.thumbSwiper = new Swiper(".mpThumbSwiepr", {
        autoHeight: true,
        pagination: {
          el: ".np-ts-pagimation",
          clickable: true
        },
        spaceBetween: 10,
        thumbs: {
          swiper: NpThumSwiper.scrollSwiper
        }
      })
    }
    
    static scrollSlider() {
      NpThumSwiper.scrollSwiper = new Swiper(".mpScrollSwiper", {
        direction: 'vertical',
        spaceBetween: 24,
        slidesPerView: 4,
        freeMode: true,
        watchSlidesVisibility: true,
        watchSlidesProgress: true,
      })
    }

    static gotoSlide(index) {
      NpThumSwiper.thumbSwiper.slideTo(index)
    }

    static activeSlide(src) {
      document.querySelectorAll(".np-swiper-slide").forEach(slide => {
        if(slide.dataset.src === src) {
          NpThumSwiper.gotoSlide(slide.dataset.index)
        }
      })
    }
  }

  customElements.define("np-media", NpThumSwiper)

  


  class NpQuantity extends HTMLElement{
    constructor() {
      super()
      this.querySelectorAll("button").forEach(btn => btn.addEventListener("click", this.clickEventHandler.bind(this)))
      this.input = this.querySelector("input")
    }

    clickEventHandler(e) {
      e.preventDefault()
      switch(e.target.dataset.type) {
        case 'plus':
          this.qtyHandler(1)
          break;
        case 'minus':
          this.qtyHandler(-1)
          break;
      }
    }

    qtyHandler(n) {
      let value = parseInt(this.input.value)
      value += n
      if(value < 1) value = 1
      
      this.input.value = value      
    }
  }

  customElements.define("np-quantity", NpQuantity)


  class NpVariants extends HTMLElement{
    constructor() {
      super()
    }

    connectedCallback() {
      this.form = this.querySelector("form")
      this.form.addEventListener("input", this.inputEventHandler.bind(this))
    }

    inputEventHandler() {
      this.getProductData()
      this.updateOptions()
      this.updateMasterId()
      this.slideTo()
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
    }

    getProductData() {
      this.product = this.product || JSON.parse(document.querySelector('[type="application/json-product"]').textContent);
      this.variants = this.product?.variants
      this.options = new Array(this.product?.options?.length)
    }

    updateOptions() {
      this.querySelectorAll('select').forEach(select => this.options.splice(parseInt(select.dataset.index)-1, 1, select.value))
      Array.from(this.querySelectorAll('.np-variant-button-wrapper')).map((fieldset) => this.options.splice(parseInt(Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).dataset.index)-1, 1, Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value))
    }

    updateMasterId() {
      this.currentVariant = this.variants?.find((variant) => !variant.options.map((option, index) => this.options[index] === option).includes(false))
    }

    slideTo() {
      NpThumSwiper.activeSlide(this.currentVariant?.featured_image?.src)
    }

    updateURL() {
      if (!this.currentVariant) return;
      window.history.replaceState({}, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
    }

    updateVariantInput() {
      const productForm = document.querySelector(".npForm")
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }

    renderProductInfo() {
      const requestedVariantId = this.currentVariant.id;
      const sectionId = this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section;
  
      fetch(
        `${this.dataset.url}?variant=${requestedVariantId}&section_id=${
          this.dataset.originalSection ? this.dataset.originalSection : this.dataset.section
        }`
      )
      .then((response) => response.text())
      .then((responseText) => {
        if (this.currentVariant.id !== requestedVariantId) return;
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        document.querySelector(".np-price-wrapper").innerHTML = html.querySelector(".np-price-wrapper").innerHTML
        document.querySelector(".npf-submit-wrapper").innerHTML = html.querySelector(".npf-submit-wrapper").innerHTML
      });
    }

  }

  customElements.define("np-variants", NpVariants)