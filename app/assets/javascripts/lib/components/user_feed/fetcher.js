//-----------------------------------------------------------------------------
//
// User Feed: Fetcher
//
//-----------------------------------------------------------------------------

define([ "jquery", "lib/utils/local_store" ], function($, LocalStore) {

  "use strict";

  var defaults = {
    feedUrl: "https://www.lonelyplanet.com/thorntree/users/feed",
    interval: 15000
  };

  function Fetcher(args) {
    this.config = $.extend({}, defaults, args);

    this.localStore = new LocalStore();
    this._isPaused = false;

    this.init();
  }

  Fetcher.prototype.init = function() {
    this._handleFetch();

    this.cycle = setInterval(
      this._handleFetch.bind(this),
      this.config.interval
    );
  };

  Fetcher.prototype.pause = function() {
    this._isPaused = true;
  };

  Fetcher.prototype.unpause = function() {
    this._isPaused = false;
  };

  //---------------------------------------------------------------------------
  // Private functions
  //---------------------------------------------------------------------------

  Fetcher.prototype._handleFetch = function() {
    !this._isPaused && this._fetch();
  };

  Fetcher.prototype._fetch = function() {
    var feedUrl = this.config.feedUrl.concat(
      "?activities_timestamp=",
      this.localStore.get("lastActivityTimestamp.read"),
      "&messages_timestamp=",
      this.localStore.get("lastMessageTimestamp.read")
    );

    $.ajax({
      url:           feedUrl,
      dataType:      "json",
      cache:         false,
      success:       this.config.onSuccess
    });
  };

  return Fetcher;
});
