//-----------------------------------------------------------------------------
//
// User Feed: Content: Activities
//
//-----------------------------------------------------------------------------

define([ "jquery", "./_shared" ], function($, shared) {

  "use strict";

  var defaults = {
    container:     ".js-user-feed__activities",
    unreadCounter: ".js-user-feed__activities__unread-counter"
  };

  function Activities(args) {
    this.config = $.extend({}, defaults, args);

    this.$container = $(this.config.container);
    this.$unreadCounters = $(this.config.unreadCounter);

    this.unreadCount = 0;
  }

  //---------------------------------------------------------------------------
  // Mixins
  //---------------------------------------------------------------------------

  shared.call(Activities.prototype);

  //---------------------------------------------------------------------------
  // Functions
  //---------------------------------------------------------------------------

  Activities.prototype.update = function(data) {
    var itemsArray = data.activities || [];

    if (itemsArray.length) {
      this._handleUpdate(itemsArray, this._markUnread.bind(this));
    }
  };

  //---------------------------------------------------------------------------
  // Private functions
  //---------------------------------------------------------------------------

  Activities.prototype._getUnreadCount = function(itemsArray) {
    var unreadCount = 0;

    if (this._lastReadTimestamp) {
      var newTimestamps = this._getTimestamps(itemsArray),
          i, l = newTimestamps.length;

      for (i = 0; i < l; i++) {
        (newTimestamps[i] > this._lastReadTimestamp) && unreadCount++;
      }

    } else {
      this._lastReadTimestamp = new Date(itemsArray[0].timestamp).getTime();
    }

    return unreadCount;
  };

  Activities.prototype._markUnread = function() {
    var $items = this.$container.find(this.config.item);

    $items.slice(0, this.unreadCount).addClass("is-unread");
  };

  return Activities;
});
