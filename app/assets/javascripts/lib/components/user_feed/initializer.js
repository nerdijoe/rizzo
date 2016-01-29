//-----------------------------------------------------------------------------
//
// User Feed: Initializer
//
//-----------------------------------------------------------------------------

define([ "jquery" ], function($) {

  "use strict";

  var defaults = {
    feedUrl: "https://www.lonelyplanet.com/thorntree/users/feed"
  };

  function Initializer(args) {
    this.config = $.extend({}, defaults, args);

    this.init();
  }

  Initializer.prototype.init = function() {
    $.ajax({
      url: this.config.feedUrl,
      dataType: "json",
      cache: false,
      success: this._handleFeedDataSuccess.bind(this)
    });
  };

  //---------------------------------------------------------------------------
  // Private functions
  //---------------------------------------------------------------------------

  Initializer.prototype._handleFeedDataSuccess = function(data) {
    data && this.config.onSuccess(data);
  };

  return Initializer;
});
