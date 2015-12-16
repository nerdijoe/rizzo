//-----------------------------------------------------------------------------
//
// User Feed: Slide-in
//
//-----------------------------------------------------------------------------

define([ "jquery", "lib/utils/local_store" ], function($, LocalStore) {

  "use strict";

  var defaults = {
    container:   "body",
    shroud:      ".js-user-feed--slide-in__shroud",
    activities:  ".js-user-feed__activities",
    messages:    ".js-user-feed__messages",
    item:        ".js-user-feed__item",
    itemLink:    ".js-user-feed__item__link",
    classes: {
      icons:     [ "icon--pen--line--before", "icon--comment--line--before" ],
      unread:    "is-unread",
      active:    "is-active"
    },
    templates: {
      el:        "<div class='user-feed--slide-in'></div>",
      shroud:    "<div class='user-feed--slide-in__shroud'></div>",
      close:     "<li class='user-feed--slide-in__close'>" +
                   "<span class='icon--chevron-right icon--white'></span>" +
                 "</li>"
    }
  };

  function SlideIn(args) {
    this.config = $.extend({}, defaults, args);
    this.localStore = new LocalStore();

    this.$container = $(this.config.container);
  }

  SlideIn.prototype.init = function(html) {
    html = html.replace("is-active", ""); // prevent any active-by-default

    this.$el = $(this.config.templates.el)
                .html(html)
                .appendTo(this.$container);

    this._renderShroud();
    this._addTabsIconsClasses();
    this._handleUnreadContent();

    this.listen();
  };

  //-----------------------------------------------------------------------------
  // Subscribe to events
  //-----------------------------------------------------------------------------

  SlideIn.prototype.listen = function() {
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

  //-----------------------------------------------------------------------------
  // Functions
  //-----------------------------------------------------------------------------

  SlideIn.prototype.update = function(html) {
    var $currentLists = this.$el.find("ul"),
        $newLists = $(html).filter("ul");

    $.each($currentLists, function(index) {
      $(this).html($newLists.eq(index).html());
    });

    this._handleUnreadContent();
  };

  //-----------------------------------------------------------------------------
  // Private functions
  //-----------------------------------------------------------------------------

  SlideIn.prototype._handleUnreadContent = function() {
    var unreadSelector = "li." + this.config.classes.unread,
        $allLists = this.$el.find("ul"),
        $targetList = this.$el.find(unreadSelector).closest("ul");

    this._setRead($allLists);
    $targetList.length && this._setUnread($targetList);
  };

  SlideIn.prototype._listenToMouseleave = function() {
    this.$el.one("mouseleave", this._handleShroudClick.bind(this));
  };

  SlideIn.prototype._handleMouseEnter = function(event) {
    if (this._isDesktop()) {
      this._handleListClick(event);

      // delay forced by slide animation:
      setTimeout(this._listenToMouseleave.bind(this), 200);
    }
  };

  SlideIn.prototype._handleListClick = function(event) {
    var $target = $(event.target);

    if ($target.is("ul")) {
      var isActive = $target.hasClass(this.config.classes.active);

      !isActive && this._setActive($target);
    }
  };

  SlideIn.prototype._handleItemClick = function(event) {
    var $item = $(event.currentTarget),
        itemHref = $item.find(this.config.itemLink).attr("href");

    this._handleShroudClick();
    window.location.href = itemHref;
  };

  SlideIn.prototype._handleShroudClick = function() {
    var activeSelector = "." + this.config.classes.active,
        $targetList = this.$el.find("ul" + activeSelector),
        $items = $targetList.find(this.config.item),
        isActivitiesList = $targetList.is(this.config.activities),
        isMessagesList = $targetList.is(this.config.messages);

    this._setInactive($targetList);
    this._setRead($targetList);
    this._setRead($items);

    if (isActivitiesList) {
      this.localStore.set(
        "lastActivityTimestamp.read",
        this.localStore.get("lastActivityTimestamp")
      );
    }

    if (isMessagesList) {
      this.localStore.set(
        "lastMessageTimestamp.read",
        this.localStore.get("lastMessageTimestamp")
      );
    }
  };

  SlideIn.prototype._setUnread = function($target) {
    $target.addClass(this.config.classes.unread);
  };

  SlideIn.prototype._setRead = function($target) {
    $target.removeClass(this.config.classes.unread);
  };

  SlideIn.prototype._setActive = function($target) {
    var activeClass = this.config.classes.active;

    this.$el.addClass(activeClass);
    $target.addClass(activeClass);
  };

  SlideIn.prototype._setInactive = function($target) {
    var activeClass = this.config.classes.active;

    this.$el.removeClass(activeClass);
    $target.removeClass(activeClass);
  };

  SlideIn.prototype._addTabsIconsClasses = function() {
    var $lists = this.$el.find("ul"),
        classes = this.config.classes.icons;

    $.each($lists, function(index) {
      $(this).addClass(classes[index]);
    });
  };

  SlideIn.prototype._renderShroud = function() {
    $(this.config.templates.shroud)
      .addClass(this.config.shroud.substr(1))
      .appendTo(this.$el);
  };

  SlideIn.prototype._isDesktop = function() {
    return window.innerWidth >= 980;
  };

  return SlideIn;
});
