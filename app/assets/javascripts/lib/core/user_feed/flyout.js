//-----------------------------------------------------------------------------
//
// User Feed: Flyout
//
//-----------------------------------------------------------------------------

define([ "jquery" ], function($) {

  "use strict";

  var defaults = {
    trigger: ".js-user-signed-in"
  };

  function Flyout(args) {
    this.config = $.extend({}, defaults, args);

    this.$trigger = $(this.config.trigger);
    this.$resizeTarget = $(this.config.resizeTarget);

    this.init();
  }

  Flyout.prototype.init = function() {
    this.listen();
  };

  //---------------------------------------------------------------------------
  // Subscribe to events
  //---------------------------------------------------------------------------

  Flyout.prototype.listen = function() {
    this.$trigger.on("mouseenter", this._adaptHeight.bind(this));
  };

  //---------------------------------------------------------------------------
  // Private functions
  //---------------------------------------------------------------------------

  Flyout.prototype._adaptHeight = function() {
    var $target = this.$resizeTarget,
        targetHeight = $target.height(),
        topOffset = $target.offset().top,
        windowHeight = window.innerHeight,
        doShrink = (windowHeight - (targetHeight + topOffset)) < 21,
        maxHeight = doShrink ? (windowHeight - topOffset - 20) : "100%";

    $target.css("max-height", maxHeight);
  };

  return Flyout;
});
