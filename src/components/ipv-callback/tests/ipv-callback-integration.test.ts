import { describe } from "mocha";
import decache from "decache";
import { expect, request, sinon } from "../../../../test/utils/test-utils";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants";
import express from "express";
import nock from "nock";
import * as cheerio from "cheerio";

describe("Integration:: ipv callback", () => {
  let app: express.Application;
  let baseApi: string;
  let sessionMiddleware: any;

  after(() => {
    delete process.env.SUPPORT_MFA_RESET_WITH_IPV;
  });

  describe("ipv callback", () => {
    before(async () => {
      decache("../../../app");
      decache("../../../middleware/session-middleware");
      process.env.SUPPORT_MFA_RESET_WITH_IPV = "1";
      baseApi = process.env.FRONTEND_API_BASE_URL;
      sessionMiddleware = require("../../../middleware/session-middleware");

      sinon
        .stub(sessionMiddleware, "validateSessionMiddleware")
        .callsFake(function (req: any, res: any, next: any): void {
          res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

          req.session.user = {
            email: "test@test.com",
            phoneNumber: "7867",
            journey: {
              nextPath: PATH_NAMES.IPV_CALLBACK,
            },
          };

          next();
        });

      app = await require("../../../app").createApp();
    });

    after(() => {
      app = undefined;
      nock.cleanAll();
      sinon.restore();
    });

    it("should redirect to GET_SECURITY_CODES when the reverification result is successful", async () => {
      nock(baseApi)
        .post(API_ENDPOINTS.REVERIFICATION_RESULT)
        .once()
        .reply(200, { success: true });

      const requestPath = PATH_NAMES.IPV_CALLBACK + "?code=" + "12345";

      await request(
        app,
        (test) =>
          test
            .get(requestPath)
            .expect(302)
            .expect("Location", PATH_NAMES.GET_SECURITY_CODES),
        {
          expectAnalyticsPropertiesMatchSnapshot: false,
        }
      );
    });

    it("should redirect to CANNOT_CHANGE_SECURITY_CODES when the reverification result is successful", async () => {
      nock(baseApi)
        .post(API_ENDPOINTS.REVERIFICATION_RESULT)
        .once()
        .reply(200, { success: false, failure_code: "no_identity_available" });

      const requestPath = PATH_NAMES.IPV_CALLBACK + "?code=" + "12345";

      await request(
        app,
        (test) =>
          test
            .get(requestPath)
            .expect(302)
            .expect("Location", PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES),
        {
          expectAnalyticsPropertiesMatchSnapshot: false,
        }
      );
    });
  });

  describe("cannot change how get security codes", () => {
    let token: string | string[];
    let cookies: string;

    before(async () => {
      decache("../../../app");
      decache("../../../middleware/session-middleware");
      process.env.SUPPORT_MFA_RESET_WITH_IPV = "1";
      sessionMiddleware = require("../../../middleware/session-middleware");

      sinon
        .stub(sessionMiddleware, "validateSessionMiddleware")
        .callsFake(function (req: any, res: any, next: any): void {
          res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

          req.session.user = {
            email: "test@test.com",
            phoneNumber: "7867",
            journey: {
              nextPath: PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
            },
          };

          next();
        });

      app = await require("../../../app").createApp();

      await request(
        app,
        (test) => test.get(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES),
        {
          expectAnalyticsPropertiesMatchSnapshot: false,
        }
      ).then((res) => {
        const $ = cheerio.load(res.text);
        token = $("[name=_csrf]").val();
        cookies = res.headers["set-cookie"];
      });
    });

    after(() => {
      app = undefined;
      nock.cleanAll();
      sinon.restore();
    });

    it("returns a dummy page when an option is selected", async () => {
      await request(
        app,
        (test) => test.post(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES),
        {
          expectAnalyticsPropertiesMatchSnapshot: false,
        }
      )
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          cannotChangeHowGetSecurityCodeAction: "help-to-delete-account",
        })
        .expect(function (res) {
          expect(res.text).to.equals("In development");
        })
        .expect(200);
    });

    it("returns a validation error when no option is selected", async () => {
      await request(
        app,
        (test) => test.post(PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES),
        {
          expectAnalyticsPropertiesMatchSnapshot: false,
        }
      )
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          cannotChangeHowGetSecurityCodeAction: "",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect(
            $("#cannotChangeHowGetSecurityCodeAction-error").text()
          ).to.contains("Select what you would like to do");
        })
        .expect(400);
    });
  });
});
