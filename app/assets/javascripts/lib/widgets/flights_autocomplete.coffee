define [
  "jquery", "data/countries2", "autocomplete", "lib/utils/local_store"
], ($, countries, AutoComplete, LocalStore) ->

  class FlightsWidgetAutocomplete

    API_KEY: "lp994363056324023341132625613270"

    constructor: (@$currency, @$fromAirport, @$fromCity, @$toAirport, @$toCity) ->
      @localStore = new LocalStore()
      @getAndSetCurrency()
      @getCountryCode().done => @getAndSetCurrency()
      @setupAutocomplete @$fromCity
      @setupAutocomplete @$toCity

    getCountryCode: ->
      $.ajax
        type: "GET"
        url: "http://www.lonelyplanet.com"
        success: (data, textStatus, request) =>
          @countryCode = request.getResponseHeader("X-GeoIP-CountryCode") || "US"

    getAndSetCurrency:->
      unless @userCurrency
        @userCurrency = @localStore.getCookie("lpCurrency") || countries[@countryCode]
        @_userCurrencySelect() if @userCurrency

    _userCurrencySelect: ->
      @$currency.val(@userCurrency)
      @$currency.prev().html(" #{@userCurrency} ")

    setupAutocomplete: ($el) ->
      new AutoComplete
        el: $el
        threshold: 3
        limit: 4
        fetch: @_fetchCountries
        onItem: @_onSelectCity
        templates:
          item:
            "<div class='{{isCity}}'>" +
              "<span class='autocomplete__place-name'>{{PlaceName}}</span>" +
              "<span class='autocomplete__country-name'>{{CountryName}}</span>" +
            "</div>"
          value: "{{PlaceId}}"

    _fetchCountries: (searchTerm, callback) =>
      $.ajax
        type: "GET"
        dataType: "JSONP"
        url: @__buildUrl(searchTerm)

      .done (data) ->
        places = data.Places.filter (el) ->
          el.CityId != "-sky"

        city = ""
        $.each places, (i, place) ->
          place.PlaceName +=
            if place.PlaceId == place.CityId
            then " (Any)"
            else " (#{place.PlaceId.slice(0, -4)})"
          place.isCity =
            if city == place.CityId
            then "child"
            else  city = place.CityId; "parent"

        callback(places)

    __buildUrl: (searchTerm) ->
      "http://partners.api.skyscanner.net/apiservices/xd/autosuggest/v1.0/" +
      "#{@countryCode}/#{@userCurrency}/en-GB?query=#{searchTerm}&apikey=#{@API_KEY}"

    _onSelectCity: ($item) =>
      selectedCode = $item.data("value").slice(0, -4)
      selectedValue = $item.text()
      selectedValue = selectedValue.substring 0, selectedValue.indexOf(")")
      isFrom = $item.parent().parent().parent().find("#js-from-city").length

      fromTo = if isFrom then "from" else "to"
      @["$#{fromTo}Airport"].val(selectedCode)
      @["$#{fromTo}City"].val(selectedValue + ")")
