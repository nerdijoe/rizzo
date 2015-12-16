define([
  "jquery",
  "lib/utils/alert"
], function($, Alert) {

  "use strict";

  var defaults = {
    el: ".js-newsletter-footer",
    alert: ".js-newsletter-footer"
  };

  // @args = {}
  // el: {string} selector for form
  // alert: {string} selector for alert wrapper,
  //        will display notifications after submit,
  //        by default in place of submitted form (see defaults)
  function NewsletterForm(args) {
    this.config = $.extend({}, defaults, args);
    this.$el = $(this.config.el);
    this.$alert = $(this.config.alert);
    this.$el.length && this.init();
  }

  NewsletterForm.prototype.init = function() {
    this.alert = new Alert({ container: this.$alert });
    this.listen();
  };

  NewsletterForm.prototype.listen = function() {
    this.$el.on("submit", this._handleSubmit.bind(this));
  };

  NewsletterForm.prototype._handleSubmit = function(event) {
    event.preventDefault();

    $.post(this.$el.attr("action"), this.$el.serialize())
      .done(this._handleSubmitSuccess.bind(this))
      .fail(this._handleSubmitError.bind(this));
  };

  NewsletterForm.prototype._handleSubmitSuccess = function() {
    this.alert.success({
      title: "Success!",
      content: "Thank you for subscribing, " +
        "you'll soon receive an email confirming your subscription."
    }, true);
  };

  NewsletterForm.prototype._handleSubmitError = function(xhr) {
    if (xhr.status === 409) {
      this.alert.announcement({
        title: "",
        content: "You are already subscribed."
      }, true);
    } else {
      this.error({
        title: "Error. ",
        content: "Something went wrong."
      }, true);
    }
  };

  $(document).ready(function() {
    new NewsletterForm;
  });

  return NewsletterForm;
});
