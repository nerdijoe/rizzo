// ------------------------------------------------------------------------------
//
// FlightsWidget
//
// ------------------------------------------------------------------------------

define([
  "jquery",
  "lib/widgets/flights_autocomplete",
  "lib/analytics/flights",
  "lib/analytics/flights_omniture",
  "pickerDate"
], function($, FlightsAutocomplete, GoogleAnalytics, Omniture) {

  "use strict";

  function FlightsWidget() {
    this._updateReturnDate      = this._updateReturnDate.bind(this);
    this._selectTripType        = this._selectTripType.bind(this);
    this._checkErrorsAndProceed = this._checkErrorsAndProceed.bind(this);
    this.googleAnalytics        = new GoogleAnalytics("#js-flights-form");
    this.omniture               = new Omniture("#js-flights-submit");
  }

  FlightsWidget.prototype.init = function() {
    this.$el          = $(".js-flights-widget");
    this.$currency    = this.$el.find(".js-currency-select .js-select");
    this.$departDate  = this.$el.find(".js-av-start");
    this.$returnDate  = this.$el.find(".js-av-end");
    this.$fromAirport = this.$el.find(".js-from-airport");
    this.$fromCity    = this.$el.find("#js-from-city");
    this.$toAirport   = this.$el.find(".js-to-airport");
    this.$toCity      = this.$el.find("#js-to-city");
    this.$errorMsg    = this.$el.find("#js-flights-submit .js-btn-error");
    this.oneWay = function() {
      return this.$el.find(".js-oneway-btn").prop("checked");
    };
    this.autocomplete = new FlightsAutocomplete(this.$currency, this.$fromAirport, this.$fromCity, this.$toAirport, this.$toCity);
    this.omniture.init();
    this.initDatePickers();
    this.listen();
  };

  FlightsWidget.prototype.initDatePickers = function() {
    var today;
    today = new Date();
    this._startDate(this.$departDate, today);
    if (!this.oneWay()) {
      this._startDate(this.$returnDate, today, true);
    }
  };

  // -------------------------------------------------------------------------
  // Subscribe to Events
  // -------------------------------------------------------------------------

  FlightsWidget.prototype.listen = function() {
    this.$el.find("#js-flights-form").on("submit", this._checkErrorsAndProceed);
    this.$el.find("[type=radio]").on("change", this._selectTripType);
    this.$el.find(".input--text").on("focus", this._removeError);
    this.$el.find(".js-city-input").on("click", function() {
      this.select();
    });
    this.$el.find(".js-datepicker").on("click", function() {
      var $input = $(this).closest(".input--regular--dark");
      this._removeError.bind($input);
    }.bind(this));
    this.$departDate.on("change", this._updateReturnDate);
  };

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  FlightsWidget.prototype._checkErrorsAndProceed = function(e) {
    e.preventDefault();
    if (this.__validateForm()) {
      this.__proceed();
    } else {
      this.__showError();
    }
  };

  FlightsWidget.prototype._selectTripType = function() {
    if (this.oneWay()) {
      this.$returnDate.prop("disabled", true).val("One Way");
    } else {
      this.$returnDate.removeProp("disabled");
      this.__setDate(this.$returnDate, new Date(this.$departDate.val()), true);
    }
  };

  FlightsWidget.prototype._removeError = function() {
    $(this).removeClass("form--error");
  };

  FlightsWidget.prototype._updateReturnDate = function() {
    var departDate, returnDate;
    departDate = new Date(this.$departDate.val());
    returnDate = new Date(this.$returnDate.val());
    if (!this.oneWay() && departDate.getDate() > returnDate.getDate()) {
      this.__setDate(this.$returnDate, departDate, true);
    }
  };

  FlightsWidget.prototype._startDate = function(calendar, day, nextDay) {
    calendar.pickadate({
      editable: false,
      format: "d mmm yyyy",
      onStart: function() { this.__setDate(calendar, day, nextDay) }.bind(this)
    });
  };

  FlightsWidget.prototype.__setDate = function(calendar, day, nextDay) {
    var selectDay;
    selectDay = nextDay ? this.__nextDay(day) : day;
    calendar.pickadate("set", {
      min: day,
      select: selectDay
    });
  };

  FlightsWidget.prototype.__nextDay = function(day) {
    return new Date(day.getTime() + 24 * 60 * 60 * 1000);
  };

  FlightsWidget.prototype.__validateForm = function() {
    return !this.$el.find(".input--text").filter(function() {
      return $(this).val() === "";
    }).each(function() {
      var $input;
      $input = $(this).hasClass("js-city-input") ? $(this) : $(this).closest(".input--regular--dark");
      $input.addClass("form--error");
    }).length;
  };

  FlightsWidget.prototype.__showError = function() {
    this.$errorMsg.show();
    setTimeout(
      function() {
        this.$errorMsg.hide();
      }.bind(this), 2000);
  };

  FlightsWidget.prototype.__proceed = function() {
    this.googleAnalytics.track();
    window.open(this.__buildUrl());
  };

  FlightsWidget.prototype.__buildUrl = function() {
    var departDate, returnDate, url;
    departDate = this.__formatDate(new Date(this.$departDate.val()));
    returnDate = this.oneWay() ? "" : this.__formatDate(new Date(this.$returnDate.val()));
    return url = "http://flights.lonelyplanet.com/Flights?" + ("&outboundDate=" + departDate + "&inboundDate=" + returnDate) + ("&originPlace=" + (this.$fromAirport.val() || this.$fromCity.val())) + ("&destinationPlace=" + (this.$toAirport.val() || this.$toCity.val())) + ("&adults=" + ($(".js-adult-num .js-select").val())) + ("&children=" + ($(".js-child-num .js-select").val())) + ("&infants=" + ($(".js-baby-num .js-select").val())) + ("&country=" + this.autocomplete.countryCode + "&currency=" + (this.$currency.val())) + "&locationSchema=sky&cabinClass=economy&searchcontrols=true";
  };

  FlightsWidget.prototype.__formatDate = function(date) {
    return date.toISOString().split("T")[0];
  };

  return FlightsWidget;

});
