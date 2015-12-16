//-----------------------------------------------------------------------------
//
// User Feed: Content
//
//-----------------------------------------------------------------------------

define([
  "jquery",
  "lib/core/timeago",
  "./content/activities",
  "./content/messages",
], function($, Timeago, Activities, Messages) {

  "use strict";

  var defaults = {
    item:     ".js-user-feed__item",
    itemLink: ".js-user-feed__item__link"
  };

  function Content(args) {
    this.config = $.extend({}, defaults, args);

    this.$context = $(this.config.context);

    this.init();
  }

  Content.prototype.init = function() {
    this.activities = new Activities({ item: this.config.item });
    this.messages = new Messages({ item: this.config.item });
    this.timeago = new Timeago({ context: this.$context });

    this.listen();
  };

  //---------------------------------------------------------------------------
  // Functions
  //---------------------------------------------------------------------------

  Content.prototype.update = function(data) {
    this.activities.update(data);
    this.messages.update(data);
    this.timeago.refresh();
  };

  Content.prototype.getLatest = function(maxAge) {
    var $activities = this._getLatestByType("activities"),
        $messages = this._getLatestByType("messages");

    return this._filterByMaxAge($activities, maxAge).add($messages);
  };

  //---------------------------------------------------------------------------
  // Subscribe to events
  //---------------------------------------------------------------------------

  Content.prototype.listen = function() {
    this.$context.on("click", this.config.item, this._handleClick.bind(this));
  };

  //---------------------------------------------------------------------------
  // Private functions
  //---------------------------------------------------------------------------

  Content.prototype._handleClick = function(event) {
    var $item = $(event.currentTarget),
        targetUrl = $item.find(this.config.itemLink).attr("href");

    window.location.href = targetUrl;
  };

  Content.prototype._filterByMaxAge = function($collection, maxAge) {
    var now = new Date().getTime();

    return $collection.filter(function() {
      var timestamp = $(this).find(".js-timeago").attr("datetime"),
          itemAge = (now - new Date(timestamp).getTime()) / 1000;

      return itemAge <= (maxAge || Infinity);
    });
  };

  Content.prototype._getLatestByType = function(type) {
    var latestCount = this[type].latestCount;

    return this[type].$container
      .find(this.config.item)
      .slice(0, latestCount)
      .not(".is-author");
  };

  return Content;
});
