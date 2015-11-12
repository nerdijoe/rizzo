//-----------------------------------------------------------------------------
//
// User Feed
//
//-----------------------------------------------------------------------------

define([
  "jquery",
  "lib/utils/debounce",
  "lib/components/tabs",
  "./user_feed/flyout",
  "./user_feed/fetcher",
  "./user_feed/content",
  "./user_feed/unread_counter",
  "./user_feed/popups",
  "./user_feed/slide_in"
], function($, debounce, Tabs, Flyout, Fetcher,
            Content, UnreadCounter, Popups, SlideIn) {

  "use strict";

  var defaults = {
    el:      ".js-user-feed",
    ajaxUrl: "https://www.lonelyplanet.com/thorntree/users/feed"
  };

  function UserFeed(args) {
    this.config = $.extend({}, defaults, args);

    this.$el = $(this.config.el);

    this.$el.length && this.init();
  }

  UserFeed.prototype.init = function() {
    this._isFirstRun = true;

    this.tabs = new Tabs({ selector: this.$el });
    this.flyout = new Flyout({ resizeTarget: this.tabs.$container });
    this.content = new Content({ context: this.$el });
    this.unreadCounter = new UnreadCounter();
    this.popups = new Popups();
    this.slideIn = new SlideIn();
    this.fetcher = new Fetcher({
      ajax: {
        url: this.config.ajaxUrl,
        success: this._handleUpdate.bind(this)
      },
      onPause: this._handleFetcherState.bind(this)
    });
  };

  //---------------------------------------------------------------------------
  // Private functions
  //---------------------------------------------------------------------------

  UserFeed.prototype._handleUpdate = function(data) {
    this._showPopups = this._canShowModule("popups", data.popupsMode);
    this._showSlideIn = this._canShowModule("slideIn", data.slideInMode);

    this.content.update(data);
    this.unreadCounter.update(this.content.messages.unreadCount);

    if (this._showSlideIn) {
      var action = this._isFirstRun ? "init" : "update";

      this.slideIn[action](this.tabs.$container.html());
    }

    if (this._showPopups && !this._isFirstRun) {
      this.popups.jumpOut(this.content.getLatest());
    } else {
      this._isFirstRun = false;
    }

    this._handleFetcherState();
  };

  UserFeed.prototype._handleFetcherState = function() {
    var doPause = !(this._showPopups || this._showSlideIn) && this._isMobile();

    this.fetcher.pause = doPause;
  };

  UserFeed.prototype._canShowModule = function(name, mode) {
    var state = false;

    if (window.lp.userFeed && window.lp.userFeed[name] &&
        ((mode === 1 && !this._isMobile()) || mode === 2)) {
      state = true;
    }

    return state;
  };

  UserFeed.prototype._isMobile = function() {
    return window.innerWidth < 980;
  };

  return UserFeed;
});
