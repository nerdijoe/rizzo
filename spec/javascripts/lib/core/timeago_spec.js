define([ "jquery", "lib/core/timeago" ], function($, TimeAgo) {

  "use strict";

  describe("TimeAgo", function() {

    var timeago;

    beforeEach(function() {
      var date = new Date(new Date() - 1000 * 60 * 60).toISOString(); // 1h ago

      loadFixtures("timeago.html");

      $(".js-timeago").attr("datetime", date);
      $(".js-timeago-full").attr("datetime", date);

      timeago = new TimeAgo();
    });

    describe("Initialisation", function() {

      it("is defined", function() {
        expect(timeago).toBeDefined();
      });

      it("finds all elements", function() {
        expect(timeago.$fullTimeagos).toExist();
        expect(timeago.$responsiveTimeagos).toExist();
      });
    });

    describe("Functionality", function() {

      describe("Screen width > breakpoint", function() {

        beforeEach(function() {
          spyOn(timeago, "_isAboveBreakpoint").and.returnValue(true);
          timeago.updateAll();
        });

        it("displays full strings in all timeagos", function() {
          expect($(".js-timeago")).toHaveText("an hour ago");
          expect($(".js-timeago-full")).toHaveText("an hour ago");
        });
      });

      describe("Screen width < breakpoint", function() {

        beforeEach(function() {
          spyOn(timeago, "_isAboveBreakpoint").and.returnValue(false);
          timeago.updateAll();
        });

        it("displays full string for '.js-timeago-full'", function() {
          expect($(".js-timeago-full")).toHaveText("an hour ago");
        });

        it("displays short strings for '.js-timeago'", function() {
          expect($(".js-timeago")).toHaveText("1h");
        });

        describe("for dates older than 1 month", function() {

          beforeEach(function() {
            spyOn(Date, "now").and.returnValue(1423954800000); // 2015.02.15 00:00
          });

          it("returns correct month name", function() {
            var monthName = timeago._getMonthName(null, 3024000000); // 35 days
            expect(monthName).toEqual("Jan");
          });

          it("returns correct year", function() {
            var fullYear = timeago._getFullYear(null, 31968000000); // 370 days
            expect(fullYear).toEqual("2014");
          });

        });
      });
    });
  });
});
