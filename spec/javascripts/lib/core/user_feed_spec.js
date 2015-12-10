define([
  "jquery",
  "lib/core/user_feed",
], function($, UserFeed) {

  "use strict";

  describe("UserFeed", function() {
    var instance;

    beforeEach(function() {
      loadFixtures("user_feed.html");
    });

    describe("Initialization", function() {

      beforeEach(function() {
        spyOn(UserFeed.prototype, "init"); // prevents Fetcher from hitting production
        instance = new UserFeed();
      });

      it("is defined", function() {
        expect(instance).toBeDefined();
      });

      it("finds user feed element", function() {
        expect(instance.$el).toExist();
      });

      it("defines proper request url", function() {
        expect(instance.config.ajaxUrl)
          .toBe("https://www.lonelyplanet.com/thorntree/users/feed");
      });
    });

    describe("Functionality", function() {
      var tabs, flyout, content, activities,
          messages, popups, unreadCounter, fetcher,
          request, feedJSONP;

      beforeEach(function() {
        jasmine.Ajax.install();
        jasmine.clock().install();

        window.lp.userFeed.popups = true;
        instance = new UserFeed({ ajaxUrl: "/foo" });

        tabs = instance.tabs;
        flyout = instance.flyout;
        content = instance.content;
        popups = instance.popups;
        activities = content.activities;
        messages = content.messages;
        unreadCounter = instance.unreadCounter;
        fetcher = instance.fetcher;

        instance.maxActivityAgeForPopup = Infinity;
      });

      afterEach(function() {
        jasmine.Ajax.uninstall();
        jasmine.clock().uninstall();
      });

      describe("Fetch returns nothing", function() {
        var contentBeforeUpdate, contentAfterUpdate;

        beforeEach(function() {
          contentBeforeUpdate = instance.$el.html();

          request = jasmine.Ajax.requests.mostRecent();
          request.respondWith({
            status: 200,
            responseText: "lpUserFeedCallback({})"
          });

          contentAfterUpdate = instance.$el.html();
        });

        it("leaves all feed elements unchanged", function() {
          expect(contentBeforeUpdate).toBe(contentAfterUpdate);
        });
      });

      describe("Fetch returns 5 activities (0 unread) & 5 messages (3 unread)", function() {

        beforeEach(function() {
          feedJSONP = JSON.stringify(JSON.parse($("#sample-response-1").html()));

          request = jasmine.Ajax.requests.mostRecent();
          request.respondWith({
            status: 200,
            responseText: "lpUserFeedCallback(" + feedJSONP + ")"
          });
        });

        it("from proper url with jsonp callback", function() {
          expect(request.url.indexOf("/foo?callback=lpUserFeedCallback")).toBe(0);
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

        it("leaves activities unread counter empty", function() {
          expect(activities.$unreadCounters.eq(0)).toHaveText("");
        });

        it("updates messages unread counters (tab & mobile menu)", function() {
          expect(messages.$unreadCounters.eq(0)).toHaveText("(3)");
          expect(messages.$unreadCounters.eq(1)).toHaveText("Messages (3)");
        });

        describe("and fetches again", function() {
          var contentBeforeUpdate, contentAfterUpdate;

          beforeEach(function() {
            jasmine.clock().tick(fetcher.config.interval + 1);
            request = jasmine.Ajax.requests.mostRecent();
          });

          describe("returns same data", function() {

            beforeEach(function() {
              contentBeforeUpdate = instance.$el.html();

              request.respondWith({
                status: 200,
                responseText: "lpUserFeedCallback(" + feedJSONP + ")"
              });

              contentAfterUpdate = instance.$el.html();
            });

            it("leaves all feed elements unchanged", function() {
              expect(contentBeforeUpdate).toBe(contentAfterUpdate);
            });
          });

          describe("returns 2 new activities & 1 new message", function() {
            var popupTimers;

            beforeEach(function() {
              popupTimers = popups.config.timers;
              feedJSONP = JSON.stringify(JSON.parse($("#sample-response-2").html()));

              request.respondWith({
                status: 200,
                responseText: "lpUserFeedCallback(" + feedJSONP + ")"
              });
            });

            it("marks new activities as unread", function() {
              expect(activities.$container.find(".is-unread")).toHaveLength(2);
            });

            it("updates activities unread counter", function() {
              expect(activities.$unreadCounters.eq(0)).toHaveText("(2)");
            });

            it("updates messages unread counters", function() {
              expect(messages.$unreadCounters.eq(0)).toHaveText("(4)");
              expect(messages.$unreadCounters.eq(1)).toHaveText("Messages (4)");
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
                feedJSONP = JSON.stringify(JSON.parse($("#sample-response-3").html()));

                jasmine.clock().tick(2 * fetcher.config.interval + 1);
                request = jasmine.Ajax.requests.mostRecent();

                request.respondWith({
                  status: 200,
                  responseText: "lpUserFeedCallback(" + feedJSONP + ")"
                });
              });

              it("marks new activities as unread", function() {
                expect(activities.$container.find(".is-unread")).toHaveLength(3);
              });

              it("updates activities unread counter", function() {
                expect(activities.$unreadCounters.eq(0)).toHaveText("(3)");
              });

              it("updates messages unread counters", function() {
                expect(messages.$unreadCounters.eq(0)).toHaveText("(5)");
                expect(messages.$unreadCounters.eq(1)).toHaveText("Messages (5)");
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

      describe("Popups display", function() {

        describe("when window argument is truthy", function() {

          beforeEach(function() {
            window.lp.userFeed.popups = true;
          });

          it("is disabled if mode === 0", function() {
            expect(instance._canShowModule("popups", 0)).toBeFalsy();
          });

          it("is disabled if mode === 1 and the view has mobile width", function() {
            spyOn(instance, "_isMobile").and.returnValue(true);
            expect(instance._canShowModule("popups", 1)).toBeFalsy();
          });

          it("is enabled if mode === 1 and the view has desktop width", function() {
            spyOn(instance, "_isMobile").and.returnValue(false);
            expect(instance._canShowModule("popups", 1)).toBeTruthy();
          });

          it("is enabled if mode === 2", function() {
            expect(instance._canShowModule("popups", 2)).toBeTruthy();
          });
        });

        describe("when window argument is falsy", function() {

          beforeEach(function() {
            window.lp.userFeed.popups = false;
          });

          it("is always disabled", function() {
            spyOn(instance, "_isMobile").and.returnValue(false);
            expect(instance._canShowModule("popups", 1)).toBeFalsy();
            expect(instance._canShowModule("popups", 2)).toBeFalsy();
          });
        });
      });
    });
  });
});
