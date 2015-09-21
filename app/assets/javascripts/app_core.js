define([
  "jquery",
  "flamsteed",
  "lib/core/ad_manager",

  "sCode",
  "trackjs",
  "polyfills/xdr",
  "polyfills/function_bind",
  "polyfills/array_index_of",
  "lib/page/swipe",
  "lib/core/nav_search",
  "lib/page/scroll_perf",
  "lib/core/authenticator",
  "lib/core/shopping_cart",
  "lib/core/feature_detect",
  "lib/core/place_title_nav",
  "lib/core/cookie_compliance",
  "lib/core/advertising",
  "lib/core/block_checker",
  "lib/components/toggle_active",
  "lib/components/select_group_manager"

], function($, Flamsteed, AdManager) {

  "use strict";

  $(document).ready(function() {

    if (window.lp.ads) {
      new AdManager(window.lp.ads).init();
    }

    if (window.location.protocol !== "https:") {
      // FS can't be served over https https://trello.com/c/2RCd59vk
      window.lp.fs = new Flamsteed({
        events: window.lp.fs.buffer,
        u: window.lp.getCookie("lpUid"),
        schema: "0.2"
      });

      // Sailthru requests insecure content
      require([ "sailthru" ], function() {
        window.Sailthru.setup({ domain: "horizon.lonelyplanet.com" });
      });
    }

    // BETA
    $(document).on("click", ".js-beta-link", function(e) {
      if (window.lp.fs) {
        window.lp.fs.log({
          d: JSON.stringify({
            name: "beta registration",
            referrer: window.location.href
          })
        });
      }
      document.cookie = [ "_v", "split-12-destinations-next" ].join("=");
      window.location.reload();

      e.preventDefault();
    });

    // Navigation tracking
    $("#js-primary-nav").on("click", ".js-nav-item", function() {
      window.s.linkstacker($(this).text());
    });

    $("#js-primary-nav").on("click", ".js-nav-cart", function() {
      window.s.linkstacker("shopping-cart");
    });

    $("#js-secondary-nav").on("click", ".js-nav-item", function() {
      window.s.linkstacker($(this).text() + "-sub");
    });

    $("#js-breadcrumbs").on("click", ".js-nav-item", function() {
      window.s.linkstacker("breadcrumbs");
    });

    $("#js-footer-nav").on("click", ".js-nav-item", function() {
      window.s.linkstacker("footer");
    });

  });

});
