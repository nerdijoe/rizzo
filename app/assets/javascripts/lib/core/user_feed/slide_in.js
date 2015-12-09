//-----------------------------------------------------------------------------
//
// User Feed: Slide-in
//
//-----------------------------------------------------------------------------

define([ "jquery" ], function($) {

  "use strict";

  var defaults = {
    container:   "#js-row--content",
    shroud:      ".js-user-feed--slide-in__shroud",
    closeButton: ".js-user-feed--slide-in__close",
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

    this.$container = $(this.config.container);
  }

  SlideIn.prototype.init = function(html) {
    html = html.replace("is-active", ""); // prevent any active-by-default

    this.$el = $(this.config.templates.el)
                .html(html)
                .appendTo(this.$container);

    this._renderCloseButtons();
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
      .on("click", config.closeButton + ", " + config.shroud,
        this._handleCloseButtonClick.bind(this));
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
    this._renderCloseButtons();
  };

  //-----------------------------------------------------------------------------
  // Private functions
  //-----------------------------------------------------------------------------

  SlideIn.prototype._handleUnreadContent = function() {
    var unreadClass = this.config.classes.unread,
        $target = this.$el.find("." + unreadClass).closest("ul");

    this._toggleUnread($target, true);
  };

  SlideIn.prototype._handleListClick = function(event) {
    var $target = $(event.target);

    $target.is("ul") && this._toggleActive($target, null);
  };

  SlideIn.prototype._handleItemClick = function(event) {
    var $item = $(event.currentTarget),
        targetUrl = $item.find(this.config.itemLink).attr("href");

    window.location.href = targetUrl;
  };

  SlideIn.prototype._handleCloseButtonClick = function() {
    var $target = this.$el.find("ul." + this.config.classes.active),
        isActivity = $target.hasClass(this.config.activities.substr(1));

    isActivity && this._toggleUnread($target, false);
    this._toggleActive($target, false);
  };

  SlideIn.prototype._toggleUnread = function($target, state) {
    $target.toggleClass(this.config.classes.unread, state);
  };

  SlideIn.prototype._toggleActive = function($target, state) {
    var activeClass = this.config.classes.active;

    this.$el.toggleClass(activeClass, state);
    $target.toggleClass(activeClass, state);
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

  SlideIn.prototype._renderCloseButtons = function() {
    $(this.config.templates.close)
      .addClass(this.config.closeButton.substr(1))
      .prependTo(this.$el.find("ul"));
  };

  return SlideIn;
});
