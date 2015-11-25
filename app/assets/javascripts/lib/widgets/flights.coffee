define [
  "jquery",
  "lib/widgets/flights_autocomplete",
  "lib/analytics/flights",
  "lib/analytics/flights_omniture",
  "pickerDate",
], ($, FlightsAutocomplete, GoogleAnalytics, Omniture) ->

  class FlightsWidget

    constructor: ->
      @googleAnalytics = new GoogleAnalytics("#js-flights-form")
      @omniture        = new Omniture("#js-flights-submit")

    init: ->
      @$el          = $(".js-flights-widget")
      @$currency    = @$el.find(".js-currency-select .js-select")
      @$departDate  = @$el.find(".js-av-start")
      @$returnDate  = @$el.find(".js-av-end")
      @$fromAirport = @$el.find(".js-from-airport")
      @$fromCity    = @$el.find("#js-from-city")
      @$toAirport   = @$el.find(".js-to-airport")
      @$toCity      = @$el.find("#js-to-city")
      @$errorMsg    = @$el.find("#js-flights-submit .js-btn-error")
      @oneWay    = -> @$el.find(".js-oneway-btn").prop("checked")

      @autocomplete = new FlightsAutocomplete(@$currency, @$fromAirport, @$fromCity, @$toAirport, @$toCity)
      @omniture.init()

      @initDatePickers()
      @listen()

    initDatePickers: ->
      today = new Date()
      @_startDate @$departDate, today
      @_startDate @$returnDate, today, true unless @oneWay()

    listen: ->
      @$el.find("#js-flights-form").on  "submit", @_checkErrorsAndProceed
      @$el.find("[type=radio]").on      "change", @_selectTripType
      @$el.find(".input--text").on      "focus",  @_removeError
      @$el.find(".js-city-input").on    "click", -> @select()
      @$el.find(".js-datepicker").on    "click", =>
        $input = $(this).closest(".input--regular--dark")
        @_removeError.bind($input)
      @$departDate.on "change", @_updateReturnDate

    _checkErrorsAndProceed: (e) =>
      e.preventDefault()
      if @__validateForm()
      then  @__proceed()
      else  @__showError()

    _selectTripType: =>
      if @oneWay()
        @$returnDate.prop("disabled", true).val("One Way")
      else
        @$returnDate.removeProp("disabled")
        @__setDate @$returnDate, new Date(@$departDate.val()), true

    _removeError: ->
      $(@).removeClass "form--error"

    _updateReturnDate: =>
      departDate = new Date @$departDate.val()
      returnDate = new Date @$returnDate.val()

      if !@oneWay() and departDate.getDate() > returnDate.getDate()
        @__setDate @$returnDate, departDate, true

    _startDate: (calendar, day, nextDay) ->
      calendar.pickadate
        editable: false,
        format: "d mmm yyyy",
        onStart: => @__setDate(calendar, day, nextDay)

    __setDate: (calendar, day, nextDay) ->
      selectDay = if nextDay then @__nextDay(day) else day
      calendar.pickadate "set", min: day, select: selectDay

    __nextDay: (day) ->
      new Date day.getTime() + 24 * 60 * 60 * 1000

    __validateForm: ->
      !@$el.find(".input--text")
        .filter -> $(@).val() == ""
        .each ->
          $input = if $(@).hasClass("js-city-input") then $(@) else $(@).closest(".input--regular--dark")
          $input.addClass("form--error")
        .length

    __showError: ->
        @$errorMsg.show()
        setTimeout =>
          @$errorMsg.hide()
        , 2000

    __proceed: ->
      @googleAnalytics.track()
      window.open @__buildUrl()

    __buildUrl: ->
      departDate = @__formatDate new Date @$departDate.val()
      returnDate = if @oneWay() then "" else @__formatDate new Date @$returnDate.val()

      url = "http://flights.lonelyplanet.com/Flights?" +
      "&outboundDate=#{departDate}&inboundDate=#{returnDate}" +
      "&originPlace=#{@$fromAirport.val() || @$fromCity.val()}" +
      "&destinationPlace=#{@$toAirport.val() || @$toCity.val()}" +
      "&adults=#{$(".js-adult-num .js-select").val()}" +
      "&children=#{$(".js-child-num .js-select").val()}" +
      "&infants=#{$(".js-baby-num .js-select").val()}" +
      "&country=#{@autocomplete.countryCode}&currency=#{@$currency.val()}" +
      "&locationSchema=sky&cabinClass=economy&searchcontrols=true"

    __formatDate: (date) ->
      date.toISOString().split("T")[0]
