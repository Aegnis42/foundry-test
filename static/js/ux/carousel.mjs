/**
 * A UI/UX framework which supports the carousel feature on the homepage.
 */
export default class Carousel {
  constructor(element) {
    this.#container = element;
    this.#slides = element.querySelector(".carousel-figures");

    // Set initial conditions
    this.#index = -1;
    this.forwards();

    // Activate interaction
    this.#registerEventListeners();

    // Begin (slow) animation
    const duration = Number(this.#container.dataset.animationDuration || 10000);
    const offset = Number(this.#container.dataset.animationOffset || 0);
    window.setTimeout(() => this.animate(duration), offset * duration)
  }

  /**
   * A reference to the container of carousel slides
   * @type {HTMLElement}
   */
  #slides;

  /**
   * The carousel container.
   * @type {HTMLElement}
   */
  #container;

  /**
   * The index position of the active slide
   * @type {number}
   */
  #index;

  /**
   * An active animation identifier
   * @type {number|null}
   */
  #animation = null;

  /* ------------------------------------------ */

  forwards() {
    const active = this.#getNextIndex(this.#index);
    const next = this.#getNextIndex(active);
    const previous = this.#getPreviousIndex(active);
    return this.#updateSlides(active, next, previous);
  }

  /* ------------------------------------------ */

  backwards() {
    const active = this.#getPreviousIndex(this.#index);
    const next = this.#getNextIndex(active);
    const previous = this.#getPreviousIndex(active);
    return this.#updateSlides(active, next, previous);
  }

  /* ------------------------------------------ */

  animate(duration=10000) {
    this.stop();
    this.#animation = window.setInterval(this.forwards.bind(this), duration);
  }

  /* ------------------------------------------ */

  stop() {
    if ( !this.#animation ) return;
    window.clearInterval(this.#animation);
    this.#animation = null;
  }

  /* ------------------------------------------ */

  #getNextIndex(current) {
    const n = this.#slides.children.length;
    return current < (n - 1) ? current + 1 : 0;
  }

  #getPreviousIndex(current) {
    const n = this.#slides.children.length;
    return current > 0 ? current - 1 : n - 1;
  }

  /* ------------------------------------------ */

  #updateSlides(active, next, previous, direction="right") {
    const slides = this.#slides.children;
    for ( let i=0; i<slides.length; i++ ) {

      // Update slide class
      const slide = slides[i];
      slide.classList.remove("active", "next", "previous", "offstage");
      if ( i === active ) slide.classList.add("active");
      else if ( i === next ) slide.classList.add("next");
      else if ( i === previous ) slide.classList.add("previous");
      else slide.classList.add("offstage");

      // Lazy-load banner image
      const img = slide.querySelector("img");
      if ( img.dataset.src && !slide.classList.contains("offstage") ) {
        img.src = img.dataset.src;
        delete img.dataset.src;
      }
    }
    this.#index = active;
  }

  /* ------------------------------------------ */
  /*  Event Listeners and Handlers              */
  /* ------------------------------------------ */

  /**
   * Activate event listeners which manage carousel control actions.
   */
  #registerEventListeners() {
    for ( const button of this.#container.querySelectorAll(".control[data-action]") ) {
      button.addEventListener("click", this.#onClickAction.bind(this));
    }
  }

  /* ------------------------------------------ */

  /**
   * Handle click events on carousel control buttons.
   * @param {PointerEvent} event    The initiating click event
   */
  #onClickAction(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const action = button.dataset.action;
    switch ( action ) {
      case "next":
        if ( this.#animation ) this.stop();
        return this.forwards();
      case "previous":
        if ( this.#animation ) this.stop();
        return this.backwards();
      case "focus":
        if ( !this.#animation ) this.animate();
        return scrollToElement(this.#container, 1000);
    }
  }

  /* ------------------------------------------ */
  /*  Initialization                            */
  /* ------------------------------------------ */

  /**
   * Initialize Carousel elements which should be active within the current page.
   */
  static initializePage() {
    if ( !document.body.classList.contains("home") ) return;
    globalThis.ui.carousels ||= {};
    for ( const carousel of document.body.querySelectorAll("nav.carousel") ) {
      globalThis.ui.carousels[carousel.id] = new Carousel(carousel);
    }
  }
}
