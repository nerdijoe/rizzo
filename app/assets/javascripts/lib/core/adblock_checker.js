define(function() {

  "use strict";

  // AdBlock tracking
  window.lp.analytics.api.trackEvent({
    category: "adblock",
    action: "blocked",
    label: "Blocked Ads"
  });

});
