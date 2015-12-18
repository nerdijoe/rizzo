//-----------------------------------------------------------------------------
//
// User Feed: Content: Messages
//
//-----------------------------------------------------------------------------

define([
  "jquery",
  "./_shared",
  "lib/utils/local_store"
], function($, shared, LocalStore) {

  "use strict";

  var defaults = {
    container:     ".js-user-feed__messages",
    unreadCounter: ".js-user-feed__messages__unread-counter",
    footer:        ".js-user-feed__messages__footer"
  };

  function Messages(args) {
    this.config = $.extend({}, defaults, args);

    this.$container = $(this.config.container);
    this.$unreadCounter = $(this.config.unreadCounter);
    this.$footer = $(this.config.footer);

    this.localStore = new LocalStore();

    this.unreadCount = 0;
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
        this._onRender.bind(
          this,
          !!itemsArray.length,
          data.unreadMessagesCount
        )
      );
    }
  };

  //---------------------------------------------------------------------------
  // Private functions
  //---------------------------------------------------------------------------

  Messages.prototype._getLastReadTimestamp = function() {
    return this.localStore.get("lastMessageTimestamp.read");
  };

  Messages.prototype._storeLastReadTimestamp = function(timestamp) {
    this.localStore.set("lastMessageTimestamp.read", timestamp);
  };

  Messages.prototype._storeLastTimestamp = function(timestamp) {
    this.localStore.set("lastMessageTimestamp", timestamp);
  };

  Messages.prototype._onRender = function(showFooter, totalUnreadMessages) {
    this._markUnread();
    this._renderMobileCounter(totalUnreadMessages);
    this._updateFooter(showFooter);
  };

  Messages.prototype._renderMobileCounter = function(count) {
    var counterText = count > 0 ? "(" + count + ")" : "";

    this.$unreadCounter.text("Messages " + counterText);
  };

  Messages.prototype._updateFooter = function(state) {
    var $footer = this.$footer;

    !$footer.closest("html").length && this.$container.append($footer);
    $footer.toggleClass("is-hidden", !state);
  };

  return Messages;
});
