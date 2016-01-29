define([
  "jquery",
  "lib/components/user_feed",
], function($, UserFeed) {

  "use strict";

  var instance, request;

  describe("UserFeed", function() {

    beforeEach(function() {
      loadFixtures("user_feed.html");

      jasmine.Ajax.install();

      instance = new UserFeed({
        context: "#context",
        feedUrl: "/bar",
        maxActivityAgeForPopup: Infinity
      });
    });

    afterEach(function() {
      jasmine.Ajax.uninstall();
    });

    it("is defined", function() {
      expect(instance).toBeDefined();
    });

    describe("Default props", function() {

      beforeEach(function() {
        instance = new UserFeed({ context: false }); // disable init
      });

      it("contain proper feed url", function() {
        expect(instance.config.feedUrl)
          .toBe("https://www.lonelyplanet.com/thorntree/users/feed");
      });

      it("contain proper activity age for popup", function() {
        expect(instance.config.maxActivityAgeForPopup).toEqual(60);
      });
    });

    describe("Initialization", function() {

      beforeEach(function() {
        spyOn(instance, "init");
      });

      describe("User signed out", function() {

        beforeEach(function() {
          // respond to Initializer's feed request
          jasmine.Ajax.requests.mostRecent().respondWith({
            status: 200,
            responseText: "{}"
          });
        });

        it("doesn't initialize", function() {
          expect(instance.init).not.toHaveBeenCalled();
        });
      });

      describe("User signed in", function() {

        describe("Slide-in & Popups disabled", function() {

          beforeEach(function() {
            jasmine.Ajax.requests.mostRecent().respondWith({
              status: 200,
              responseText: JSON.stringify({ popupsMode: 0, slideInMode: 0 })
            });
          });

          it("doesn't initialize", function() {
            expect(instance.init).not.toHaveBeenCalled();
          });
        });

        describe("Only Slide-in enabled", function() {

          beforeEach(function() {
            jasmine.Ajax.requests.mostRecent().respondWith({
              status: 200,
              responseText: JSON.stringify({ popupsMode: 0, slideInMode: 1 })
            });
          });

          it("initializes", function() {
            expect(instance.init).toHaveBeenCalled();
          });
        });

        describe("Only Popups enabled", function() {

          beforeEach(function() {
            jasmine.Ajax.requests.mostRecent().respondWith({
              status: 200,
              responseText: JSON.stringify({ popupsMode: 1, slideInMode: 0 })
            });
          });

          it("initializes", function() {
            expect(instance.init).toHaveBeenCalled();
          });
        });
      });
    });

    describe("Functionality", function() {
      var container, content, activities, messages, isDesktopSpy,
          popups, fetcher, request, feedData;

      beforeEach(function() {
        jasmine.clock().install();

        isDesktopSpy = spyOn(instance, "_isDesktop");

        isDesktopSpy.and.returnValue(true);

        jasmine.Ajax.requests.mostRecent().respondWith({
          status: 200,
          responseText: JSON.stringify({ popupsMode: 1, slideInMode: 1 })
        });

        container = instance.container;
        content = instance.content;
        popups = instance.popups;
        activities = content.activities;
        messages = content.messages;
        fetcher = instance.fetcher;
      });

      afterEach(function() {
        jasmine.clock().uninstall();
      });

      describe("Fetch returns nothing", function() {
        var contentBeforeUpdate, contentAfterUpdate;

        beforeEach(function() {
          contentBeforeUpdate = container.$el.html();

          request = jasmine.Ajax.requests.mostRecent();
          request.respondWith({
            status: 200,
            responseText: "{}"
          });

          contentAfterUpdate = container.$el.html();
        });

        it("leaves all feed elements unchanged", function() {
          expect(contentBeforeUpdate).toBe(contentAfterUpdate);
        });
      });

      describe("Fetch returns 5 activities (0 unread) & 5 messages (3 unread)", function() {

        beforeEach(function() {
          feedData = JSON.stringify(JSON.parse($("#sample-response-1").html()));

          request = jasmine.Ajax.requests.mostRecent();
          request.respondWith({
            status: 200,
            responseText: feedData
          });
        });

        it("renders activities list", function() {
          expect(activities.$container.find(content.config.item)).toHaveLength(5);
        });

        it("renders messages list", function() {
          expect(messages.$container.find(content.config.item)).toHaveLength(5);
        });

        it("renders & unhides messages footer", function() {
          expect(messages.$footer).toExist();
          expect(messages.$footer).not.toHaveClass("is-hidden");
        });

        describe("and fetches again", function() {
          var contentBeforeUpdate, contentAfterUpdate;

          beforeEach(function() {
            jasmine.clock().tick(fetcher.config.interval + 1);
            request = jasmine.Ajax.requests.mostRecent();
          });

          describe("returns same data", function() {

            beforeEach(function() {
              contentBeforeUpdate = container.$el.html();

              request.respondWith({
                status: 200,
                responseText: feedData
              });

              contentAfterUpdate = container.$el.html();
            });

            it("leaves all feed elements unchanged", function() {
              expect(contentBeforeUpdate).toBe(contentAfterUpdate);
            });
          });

          describe("returns 2 new activities & 1 new message", function() {
            var popupTimers;

            beforeEach(function() {
              popupTimers = popups.config.timers;
              feedData = JSON.stringify(JSON.parse($("#sample-response-2").html()));

              request.respondWith({
                status: 200,
                responseText: feedData
              });
            });

            it("marks new activities as unread", function() {
              expect(activities.$container.find(".is-unread")).toHaveLength(2);
            });

            it("shows popups for new items that are not self-activity", function() {
              jasmine.clock().tick(3 * popupTimers.renderDelay + 1);
              // Waits for three new but pops only two.
              // One of three is own-activity.
              expect($(popups.selector)).toHaveLength(2);
            });

            it("adds close button to each popup", function() {
              jasmine.clock().tick(3 * popupTimers.renderDelay + 1);
              expect($("." + popups.$close.attr("class").split(" ")[0])).toHaveLength(2);
            });

            it("removes popups after defined time", function() {
              jasmine.clock().tick(popupTimers.ttl + 3 * popupTimers.removeDelay + 1);
              expect($(popups.selector)).not.toExist();
            });

            describe("and again - returns 1 new activity & 1 new message", function() {

              beforeEach(function() {
                feedData = JSON.stringify(JSON.parse($("#sample-response-3").html()));

                jasmine.clock().tick(2 * fetcher.config.interval + 1);
                request = jasmine.Ajax.requests.mostRecent();

                request.respondWith({
                  status: 200,
                  responseText: feedData
                });
              });

              it("marks new activities as unread", function() {
                expect(activities.$container.find(".is-unread")).toHaveLength(3);
              });

              it("shows popups for latest items only", function() {
                jasmine.clock().tick(2 * popupTimers.renderDelay + 1);
                expect($(popups.selector)).toHaveLength(2);
              });

              it("removes popups after defined time", function() {
                jasmine.clock().tick(popupTimers.ttl + 2 * popupTimers.removeDelay + 1);
                expect($(popups.selector)).not.toExist();
              });
            });
          });
        });
      });

      describe("Modules visibility", function() {

        it("is disabled if mode is set to 0", function() {
          expect(instance._canShowModule(0)).toBeFalsy();
        });

        it("is disabled if mode is set to 1 and the viewport is mobile", function() {
          isDesktopSpy.and.returnValue(false);
          expect(instance._canShowModule(1)).toBeFalsy();
        });

        it("is enabled if mode is set to 1 and the viewport is desktop", function() {
          isDesktopSpy.and.returnValue(true);
          expect(instance._canShowModule(1)).toBeTruthy();
        });

        it("is enabled if mode is set to 2", function() {
          expect(instance._canShowModule(2)).toBeTruthy();
        });
      });
    });
  });
});
