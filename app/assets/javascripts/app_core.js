define([
  "jquery",
  "flamsteed",
  "lib/core/ad_manager",
  "lib/utils/local_store",
  "lib/core/sailthru_form",
  "rizzo-next",

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

], function($, Flamsteed, AdManager, LocalStore, SailthruForm, Rizzo) {
  /* global utag */

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

    // TODO: BETA code
    var ls = new LocalStore(),
        $bannerTmpl = $($("#tmpl-banner").html()),
        numRand = Math.random(),
        showBanner = (numRand < 0.10 && $("#tmpl-banner").length);

    if (showBanner && !$(".alert--beta").length) {
      $bannerTmpl.appendTo(".beta-banner");

      if (window.utag && window.utag.link) {
        utag.link({
          /* jshint ignore:start */
          ga_event_category: "Destinations Next",
          ga_event_action: "Banner Show",
          ga_event_label: window.location.pathname
          /* jshint ignore:end */
        });
      }
    }

    new SailthruForm({
      el: ".js-newsletter-footer",
      alert: ".js-newsletter-footer"
    });

    if (window.lp.isNewNav) {
      new Rizzo.Header({ el: $(".header") });
      new Rizzo.Login();
    }

    $(document).on("click", ".beta-banner", function(e) {
      e.preventDefault();

      if (window.lp.fs) {
        window.lp.fs.log({
          d: JSON.stringify({
            name: "beta registration",
            referrer: window.location.href
          })
        });
      }

      if (window.utag && window.utag.link) {
        utag.link({
          /* jshint ignore:start */
          ga_event_category: "Destinations Next",
          ga_event_action: "Beta Sign Up",
          ga_event_label: window.location.pathname
          /* jshint ignore:end */
        });
      }

      ls.setCookie("_v", "split-12-destinations-next", 14);
      window.location.reload();
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
