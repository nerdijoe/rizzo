//-----------------------------------------------------------------------------
//
// User Feed: Slide-in
//
//-----------------------------------------------------------------------------

define([ "jquery" ], function($) {

  "use strict";

  var defaults = {
    container:   "#js-row--content",
    activities:  ".js-user-feed__activities",
    messages:    ".js-user-feed__messages",
    item:        ".js-user-feed__item",
    itemLink:    ".js-user-feed__item__link",
    closeButton: ".js-user-feed--slide-in__close",
    classes: {
      icons:     [ "icon--pen--line--before", "icon--comment--line--before" ],
      unread:    "is-unread",
      active:    "is-active"
    },
    templates: {
      el:        "<div class='user-feed--slide-in'></div>",
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

    this.$el = $(this.config.templates.el).appendTo(this.$container);

    this.$el.html(html);

    this._renderCloseButtons();
    this._addTabsIconsClasses();
    this._handleUnreadContent();

    this.listen();
  };

  SlideIn.prototype.listen = function() {
    this.$el
      .on("click", "ul",
        this._handleListClick.bind(this))
      .on("click", this.config.item,
        this._handleItemClick.bind(this))
      .on("click", this.config.closeButton,
        this._handleCloseButtonClick.bind(this));
  };

  SlideIn.prototype.update = function(html) {
    var $currentLists = this.$el.find("ul"),
        $newLists = $(html).filter("ul");

    $.each($currentLists, function(index) {
      $(this).html($newLists.eq(index).html());
    });

    this._handleUnreadContent();
    this._renderCloseButtons();
  };

  SlideIn.prototype._handleUnreadContent = function() {
    var unreadClass = this.config.classes.unread,
        $target = this.$el.find("." + unreadClass).closest("ul");

    this._toggleUnread($target, true);
  };

  SlideIn.prototype._handleListClick = function(event) {
    var $target = $(event.target),
        markUnread = $target.hasClass(this.config.activities.substr(1));

    this._toggleUnread($target, !markUnread);
    this._toggleActive($target, null);
  };

  SlideIn.prototype._handleItemClick = function(event) {
    var $item = $(event.currentTarget),
        targetUrl = $item.find(this.config.itemLink).attr("href");

    window.location.href = targetUrl;
  };

  SlideIn.prototype._handleCloseButtonClick = function(event) {
    this._toggleActive($(event.target).closest("ul"), false);
    event.stopImmediatePropagation();
  };

  SlideIn.prototype._toggleUnread = function($target, state) {
    $target.toggleClass(this.config.classes.unread, state);
  };

  SlideIn.prototype._toggleActive = function($target, state) {
    $target.toggleClass(this.config.classes.active, state);
  };

  SlideIn.prototype._addTabsIconsClasses = function() {
    var $lists = this.$el.find("ul"),
        classes = this.config.classes.icons;

    $.each($lists, function(index) {
      $(this).addClass(classes[index]);
    });
  };

  SlideIn.prototype._renderCloseButtons = function() {
    $(this.config.templates.close)
      .addClass(this.config.closeButton.substr(1))
      .prependTo(this.$el.find("ul"));
  };

  return SlideIn;
});
