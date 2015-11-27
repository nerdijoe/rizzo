// ------------------------------------------------------------------------------
//
// FlightsWidgetAutocomplete
//
// ------------------------------------------------------------------------------

define([ "jquery", "data/countries2", "autocomplete", "lib/utils/local_store" ], function($, countries, AutoComplete, LocalStore) {

  "use strict";

  var __bind = function(fn, me) { return function() { return fn.apply(me, arguments); }; };

  function FlightsWidgetAutocomplete($currency, $fromAirport, $fromCity, $toAirport, $toCity) {
    this.$currency = $currency;
    this.$fromAirport = $fromAirport;
    this.$fromCity = $fromCity;
    this.$toAirport = $toAirport;
    this.$toCity = $toCity;
    this._onSelectCity = __bind(this._onSelectCity, this);
    this._fetchCountries = __bind(this._fetchCountries, this);
    this.localStore = new LocalStore();
    this.getAndSetCurrency();
    this.getCountryCode().done((function(_this) {
      return function() {
        return _this.getAndSetCurrency();
      };
    })(this));
    this.setupAutocomplete(this.$fromCity);
    this.setupAutocomplete(this.$toCity);
  }

  FlightsWidgetAutocomplete.prototype.API_KEY = "lp994363056324023341132625613270";

  FlightsWidgetAutocomplete.prototype.getCountryCode = function() {
    return $.ajax({
      type: "GET",
      url: "http://www.lonelyplanet.com",
      success: (function(_this) {
        return function(data, textStatus, request) {
          return _this.countryCode = request.getResponseHeader("X-GeoIP-CountryCode") || "US";
        };
      })(this)
    });
  };

  FlightsWidgetAutocomplete.prototype.getAndSetCurrency = function() {
    if (!this.userCurrency) {
      this.userCurrency = this.localStore.getCookie("lpCurrency") || countries[this.countryCode];
      if (this.userCurrency) {
        return this._userCurrencySelect();
      }
    }
  };

  // -------------------------------------------------------------------------
  // Private
  // -------------------------------------------------------------------------

  FlightsWidgetAutocomplete.prototype._userCurrencySelect = function() {
    this.$currency.val(this.userCurrency);
    return this.$currency.prev().html(" " + this.userCurrency + " ");
  };

  FlightsWidgetAutocomplete.prototype.setupAutocomplete = function($el) {
    return new AutoComplete({
      el: $el,
      threshold: 3,
      limit: 4,
      fetch: this._fetchCountries,
      onItem: this._onSelectCity,
      templates: {
        item: "<div class='{{isCity}}'>" + "<span class='autocomplete__place-name'>{{PlaceName}}</span>" + "<span class='autocomplete__country-name'>{{CountryName}}</span>" + "</div>",
        value: "{{PlaceId}}"
      }
    });
  };

  FlightsWidgetAutocomplete.prototype._fetchCountries = function(searchTerm, callback) {
    return $.ajax({
      type: "GET",
      dataType: "JSONP",
      url: this.__buildUrl(searchTerm)
    }).done(function(data) {
      var city, places;
      places = data.Places.filter(function(el) {
        return el.CityId !== "-sky";
      });
      city = "";
      $.each(places, function(i, place) {
        place.PlaceName += place.PlaceId === place.CityId ? " (Any)" : " (" + (place.PlaceId.slice(0, -4)) + ")";
        return place.isCity = city === place.CityId ? "child" : (city = place.CityId, "parent");
      });
      return callback(places);
    });
  };

  FlightsWidgetAutocomplete.prototype.__buildUrl = function(searchTerm) {
    return "http://partners.api.skyscanner.net/apiservices/xd/autosuggest/v1.0/" + ("" + this.countryCode + "/" + this.userCurrency + "/en-GB?query=" + searchTerm + "&apikey=" + this.API_KEY);
  };

  FlightsWidgetAutocomplete.prototype._onSelectCity = function($item) {
    var fromTo, isFrom, selectedCode, selectedValue;
    selectedCode = $item.data("value").slice(0, -4);
    selectedValue = $item.text();
    selectedValue = selectedValue.substring(0, selectedValue.indexOf(")"));
    isFrom = $item.parent().parent().parent().find("#js-from-city").length;
    fromTo = isFrom ? "from" : "to";
    this["$" + fromTo + "Airport"].val(selectedCode);
    return this["$" + fromTo + "City"].val(selectedValue + ")");
  };

  return FlightsWidgetAutocomplete;

});
