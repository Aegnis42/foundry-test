import Carousel from "./ux/carousel.mjs";

globalThis.ui = {};

window.addEventListener("DOMContentLoaded", async function() {
  Carousel.initializePage();
});
