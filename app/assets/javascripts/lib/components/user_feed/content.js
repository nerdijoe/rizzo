//-----------------------------------------------------------------------------
//
// User Feed: Content
//
//-----------------------------------------------------------------------------

define([
  "jquery",
  "lib/core/timeago",
  "lib/utils/local_store",
  "./content/activities",
  "./content/messages",
], function($, Timeago, LocalStore, Activities, Messages) {

  "use strict";

  var defaults = {
    shroud:      ".js-user-feed__shroud",
    activities:  ".js-user-feed__activities",
    messages:    ".js-user-feed__messages",
    item:        ".js-user-feed__item",
    itemLink:    ".js-user-feed__item__link"
  };

  function Content(args) {
    this.config = $.extend({}, defaults, args);

    this.$el = this.config.$el;
    this.documentTitle = document.title;
    this.localStore = new LocalStore();

    this.init();
  }

  Content.prototype.init = function() {
    this.activities = new Activities({ item: this.config.item });
    this.messages = new Messages({ item: this.config.item });
    this.timeago = new Timeago({ context: this.$el });

    this.listen();
  };

  //-----------------------------------------------------------------------------
  // Subscribe to events
  //-----------------------------------------------------------------------------

  Content.prototype.listen = function() {
    var config = this.config;

    this.$el
      .on("click", "ul",
        this._handleListClick.bind(this))
      .on("click", config.item,
        this._handleItemClick.bind(this))
      .on("click", config.shroud,
        this._handleShroudClick.bind(this))
      .on("mouseenter",
        this._handleMouseEnter.bind(this));
  };

  //---------------------------------------------------------------------------
  // Functions
  //---------------------------------------------------------------------------

  Content.prototype.update = function(data) {
    this.activities.update(data);
    this.messages.update(data);
    this.timeago.refresh();

    this._handleListStatusMarking();
  };

  Content.prototype.show = function() {
    if (!this.isVisible) {
      this.$el.removeClass("is-hidden");
      this.isVisible = true;
    }
  };

  Content.prototype.hide = function() {
    if (this.isVisible) {
      this.$el.addClass("is-hidden");
      this.isVisible = false;
    }
  };

  Content.prototype.getLatest = function(maxActivityAge) {
    var $activities = this._getLatestByType("activities"),
        $messages = this._getLatestByType("messages");

    if (typeof maxActivityAge === "number") {
      $activities = this._filterByMaxAge($activities, maxActivityAge);
    }

    return $activities.add($messages);
  };

  //---------------------------------------------------------------------------
  // Private functions
  //---------------------------------------------------------------------------

  Content.prototype._listenToMouseleave = function() {
    this.$el.one("mouseleave", this._handleShroudClick.bind(this));
  };

  Content.prototype._handleMouseEnter = function(event) {
    if (this._isDesktop()) {
      this._handleListClick(event);

      // timeout forced by slide animation:
      setTimeout(this._listenToMouseleave.bind(this), 200);
    }
  };

  Content.prototype._handleListClick = function(event) {
    var $target = $(event.target);

    if ($target.is("ul")) {
      this.$el.find("ul").removeClass("is-active");
      this._setActive($target);
    }
  };

  Content.prototype._handleItemClick = function(event) {
    var $item = $(event.currentTarget),
        itemHref = $item.find(this.config.itemLink).attr("href");

    this._handleShroudClick();

    window.location.href = itemHref;
  };

  Content.prototype._handleShroudClick = function() {
    var $targetList = this.$el.find("ul.is-active"),
        $items = $targetList.find(this.config.item),
        isActivitiesList = $targetList.is(this.config.activities),
        isMessagesList = $targetList.is(this.config.messages);

    this._setInactive($targetList);
    this._setRead($targetList);
    this._setRead($items);

    isActivitiesList && this._setLastActivityTimestamp();
    isMessagesList && this._setLastMessageTimestamp();
  };

  Content.prototype._handleListStatusMarking = function() {
    var $all = this.$el.find("ul"),
        $unread = $all.find(".is-unread").not(".is-author").closest("ul");

    $all.removeClass("is-unread"); // marks as read on multiple tabs
    if ($unread.length) {
      $unread.addClass("is-unread");
      document.title = "* " + this.documentTitle; // indicate in tab title
    } else {
      document.title = this.documentTitle;
    }
  };

  Content.prototype._filterByMaxAge = function($collection, maxAge) {
    var now = new Date().getTime();

    return $collection.filter(function() {
      var timestamp = $(this).find(".js-timeago").attr("datetime"),
          itemAge = (now - new Date(timestamp).getTime()) / 1000;

      return itemAge <= maxAge;
    });
  };

  Content.prototype._getLatestByType = function(type) {
    var latestCount = this[type].latestCount;

    return this[type].$container
      .find(this.config.item)
      .slice(0, latestCount)
      .not(".is-author");
  };

  Content.prototype._setLastActivityTimestamp = function() {
    this.localStore.set(
      "lastActivityTimestamp.read",
      this.localStore.get("lastActivityTimestamp")
    );
  };

  Content.prototype._setLastMessageTimestamp = function() {
    this.localStore.set(
      "lastMessageTimestamp.read",
      this.localStore.get("lastMessageTimestamp")
    );
  };

  Content.prototype._setRead = function($target) {
    $target.removeClass("is-unread");
    document.title = this.documentTitle;
  };

  Content.prototype._setActive = function($target) {
    var activeClass = "is-active";

    this.$el.addClass(activeClass);
    $target.addClass(activeClass);
  };

  Content.prototype._setInactive = function($target) {
    var activeClass = "is-active";

    this.$el.removeClass(activeClass);
    $target.removeClass(activeClass);
  };

  Content.prototype._isDesktop = function() {
    return window.innerWidth >= 980;
  };

  return Content;
});
