//-----------------------------------------------------------------------------
//
// User Feed: Unread Counter
//
//-----------------------------------------------------------------------------

define([ "jquery" ], function($) {

  "use strict";

  var defaults = {
    el:  ".js-user-feed__unread-counter",
  };

  function UnreadCounter(args) {
    this.config = $.extend({}, defaults, args);

    this.$el = $(this.config.el);
  }

  //---------------------------------------------------------------------------
  // Functions
  //---------------------------------------------------------------------------

  UnreadCounter.prototype.update = function(unreadCount) {
    this.$el.text(unreadCount).toggleClass("is-hidden", !unreadCount);
  };

  return UnreadCounter;
});
