//-----------------------------------------------------------------------------
//
// User Feed: Content: Messages
//
//-----------------------------------------------------------------------------

define([ "jquery", "./_shared" ], function($, shared) {

  "use strict";

  var defaults = {
    container:     ".js-user-feed__messages",
    unreadCounter: ".js-user-feed__messages__unread-counter",
    footer:        ".js-user-feed__messages__footer"
  };

  function Messages(args) {
    this.config = $.extend({}, defaults, args);

    this.$container = $(this.config.container);
    this.$unreadCounters = $(this.config.unreadCounter);
    this.$footer = $(this.config.footer);

    this.unreadCount = 0;
    this.isFirstRun = true;
  }

  //---------------------------------------------------------------------------
  // Mixins
  //---------------------------------------------------------------------------

  shared.call(Messages.prototype);

  //---------------------------------------------------------------------------
  // Functions
  //---------------------------------------------------------------------------

  Messages.prototype.update = function(data) {
    var itemsArray = data.messages || [];

    if (itemsArray.length) {
      this._handleUpdate(
        itemsArray,
        this._updateFooter.bind(this, !!itemsArray.length),
        data.unreadMessagesCount
      );
    }
  };

  //---------------------------------------------------------------------------
  // Private functions
  //---------------------------------------------------------------------------

  Messages.prototype._updateFooter = function(state) {
    var $footer = this.$footer;

    !$footer.closest("html").length && this.$container.append($footer);
    $footer.toggleClass("is-hidden", !state);
  };

  return Messages;
});
