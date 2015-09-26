//-----------------------------------------------------------------------------
//
// User Feed: Fetcher
//
//-----------------------------------------------------------------------------

define([ "jquery" ], function($) {

  "use strict";

  var defaults = {
    ajax: {
      url:           "https://www.lonelyplanet.com/thorntree/users/feed",
      dataType:      "jsonp",
      jsonpCallback: "lpUserFeedCallback",
      cache:         false
    },
    interval: 15000
  };

  function Fetcher(args) {
    this.config = $.extend(true, defaults, args);

    this.init();
  }

  Fetcher.prototype.init = function() {
    this._handleFetch();
    this.cycle = setInterval(
      this._handleFetch.bind(this),
      this.config.interval
    );
  };

  //---------------------------------------------------------------------------
  // Private functions
  //---------------------------------------------------------------------------

  Fetcher.prototype._handleFetch = function() {
    this.pause ? this.config.onPause() : this._fetch();
  };

  Fetcher.prototype._fetch = function() {
    $.ajax(this.config.ajax);
  };

  return Fetcher;
});
