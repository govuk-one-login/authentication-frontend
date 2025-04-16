import { describe } from "mocha";
import {
  expect,
  sinon,
  request,
} from "../../../../../test/utils/test-utils.js";
import * as cheerio from "cheerio";
import decache from "decache";
import { PATH_NAMES, ANALYTICS_COOKIES } from "../../../../app.constants.js";
describe("Integration:: cookies controller", () => {
  let app: any;
  let $: any;
  const dynamicGACookieName = "_gat_UA-[number]";
  const analyticsCookieNamesListedInCookieNotice: string[] = [];

  describe("get cookies", () => {
    before(async () => {
      decache("../../../../app");

      app = await (await import("../../../../app.js")).createApp();

      await request(app, (test) => test.get(PATH_NAMES.COOKIES_POLICY)).then(
        (res) => {
          $ = cheerio.load(res.text);
          $("table#analytics-cookies tbody td:first-child").each(
            (i: any, elem: any) => {
              const cookieName = $(elem).text();
              analyticsCookieNamesListedInCookieNotice.push(cookieName);
            }
          );
        }
      );
    });

    after(() => {
      sinon.restore();
      app = undefined;
    });

    describe("The cookies policy page", () => {
      describe("table with an id of `analytics-cookies`", () => {
        it("should exist, once", () => {
          expect($("table#analytics-cookies").length).to.eq(1);
        });
        it(`should include the dynamic Google Analytics cookie name, ${dynamicGACookieName}`, () => {
          expect(analyticsCookieNamesListedInCookieNotice).to.include(
            dynamicGACookieName
          );
        });
        it("should list all items in the ANALYTICS_COOKIES array", () => {
          ANALYTICS_COOKIES.forEach((i) => {
            expect(analyticsCookieNamesListedInCookieNotice).to.include(i);
          });
        });
      });
    });
    describe("the ANALYTICS_COOKIES array", () => {
      describe("when the dynamic Google Analytics cookie name is added", () => {
        it("should include all measurement cookies listed the cookie policy page", () => {
          expect(analyticsCookieNamesListedInCookieNotice).to.have.same.members(
            [...ANALYTICS_COOKIES, dynamicGACookieName]
          );
        });
      });
    });
  });

  describe("post cookies", () => {
    let token: string | string[];
    let cookies: string;
    let app: any;

    before(async () => {
      decache("../../../../app");

      app = await (await import("../../../../app.js")).createApp();

      await request(app, (test) => test.get(PATH_NAMES.COOKIES_POLICY), {
        expectAnalyticsPropertiesMatchSnapshot: false,
      }).then((res) => {
        const $ = cheerio.load(res.text);
        token = $("[name=_csrf]").val();
        cookies = res.headers["set-cookie"];
      });
    });

    it("successfully makes a call to update the cookie policy", async () => {
      await request(app, (test) => test.post(PATH_NAMES.COOKIES_POLICY), {
        expectAnalyticsPropertiesMatchSnapshot: false,
      })
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          cookiePreferences: true,
        })
        .expect(200);
    });
  });
});
