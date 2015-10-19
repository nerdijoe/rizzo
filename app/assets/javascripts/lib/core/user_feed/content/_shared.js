//-----------------------------------------------------------------------------
//
// User Feed: Content: Activities & Messages shared functions
//
//-----------------------------------------------------------------------------

define([], function() {

  "use strict";

  var shared = function() {

    this._handleUpdate = function(itemsArray, onRender, unreadCount) {
      var newHtml = this._getHtml(itemsArray),
          doRender = this._hasNewContent(newHtml);

      this.latestCount = this._getLatestCount(itemsArray);

      if (unreadCount === undefined) {
        this.unreadCount = this._getUnreadCount(itemsArray);
      } else {
        this.unreadCount = unreadCount;
      }

      if (doRender) {
        this._renderItems(newHtml);
        this._renderCounters();
        onRender();
      }
    };

    this._getHtml = function(itemsArray) {
      var html = "", i, l = itemsArray.length;

      for (i = 0; i < l; i++) {
        html += itemsArray[i].text;
      }

      return html;
    };

    this._hasNewContent = function(html) {
      var hasNew = this.currentHtml != html;

      hasNew && (this.currentHtml = html);

      return hasNew;
    };

    this._renderItems = function(html) {
      this.$container.html(html);
    };

    this._renderCounters = function() {
      var count = this.unreadCount,
          counterText = count > 0 ? " (" + count + ")" : "";

      // This updates all standalone & appended counters,
      // e.g. "(3)", "Messages (3)"
      this.$unreadCounters.text(function(index, oldText) {
        var titleEnd = oldText.lastIndexOf("("), newText;

        newText = oldText
          .slice(0, titleEnd > -1 ? titleEnd : oldText.length)
          .trim().concat(counterText).trim();

        return newText;
      });
    };

    this._getTimestamps = function(itemsArray) {
      var timestamps = [], i = 0, l = itemsArray.length;

      for (i = 0; i < l; i++) {
        timestamps.push(new Date(itemsArray[i].timestamp).getTime());
      }

      return timestamps;
    };

    this._getLatestCount = function(itemsArray) {
      var latestCount = 0;

      if (this._lastTimestamp) {
        var newTimestamps = this._getTimestamps(itemsArray),
            i = 0;

        while (newTimestamps[i] > this._lastTimestamp) {
          latestCount++; i++;
        }

        this._lastTimestamp = newTimestamps[0];

      } else {
        this._lastTimestamp = new Date(itemsArray[0].timestamp).getTime();
      }

      return latestCount;
    };
  };

  return shared;
});
