import { describe } from "mocha";
import decache from "decache";
import { expect, request, sinon } from "../../../../test/utils/test-utils";
import {
  API_ENDPOINTS,
  CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../../app.constants";
import express from "express";
import nock from "nock";
import * as cheerio from "cheerio";

describe.only("Integration:: ipv callback", () => {
  let app: express.Application;
  let baseApi: string;

  before(async () => {
    process.env.SUPPORT_MFA_RESET_WITH_IPV = "1";
  });

  after(() => {
    delete process.env.SUPPORT_MFA_RESET_WITH_IPV;
  });

  describe("ipv callback", () => {
    before(async () => {
      baseApi = process.env.FRONTEND_API_BASE_URL;
      app = await createApp();
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
    afterEach(() => {
      app = undefined;
      sinon.restore();
    });

    it("returns a dummy page when an option is selected", async () => {
      const app = await createApp();
      const { token, cookies } =
        await getCannotChangeSecurityCodesAndReturnTokenAndCookies(
          app,
          PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES
        );

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
          cannotChangeHowGetSecurityCodeAction:
            CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.HELP_DELETE_ACCOUNT,
        })
        .expect(function (res) {
          expect(res.text).to.equals("In development");
        })
        .expect(200);
    });

    it("returns a validation error when no option is selected", async () => {
      const app = await createApp();
      const { token, cookies } =
        await getCannotChangeSecurityCodesAndReturnTokenAndCookies(
          app,
          PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES
        );

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

    it("goes to /enter-code when user selects retry security code radio button and their mfaMethodType is SMS", async () => {
      const app = await createApp();
      const { token, cookies } =
        await getCannotChangeSecurityCodesAndReturnTokenAndCookies(
          app,
          PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
          MFA_METHOD_TYPE.SMS
        );

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
          cannotChangeHowGetSecurityCodeAction:
            CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE,
        })
        .expect("Location", PATH_NAMES.ENTER_MFA)
        .expect(302);
    });

    it("goes to /enter-authenticator-app-code when user selects retry security code radio button and their mfaMethodType is AUTH_APP", async () => {
      const app = await createApp();
      const { token, cookies } =
        await getCannotChangeSecurityCodesAndReturnTokenAndCookies(
          app,
          PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES,
          MFA_METHOD_TYPE.AUTH_APP
        );

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
          cannotChangeHowGetSecurityCodeAction:
            CANNOT_CHANGE_HOW_GET_SECURITY_CODES_ACTION.RETRY_SECURITY_CODE,
        })
        .expect("Location", PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
        .expect(302);
    });
  });
});

const createApp = async (): Promise<express.Application> => {
  decache("../../../app");
  return await require("../../../app").createApp();
};

const getCannotChangeSecurityCodesAndReturnTokenAndCookies = async (
  app: express.Application,
  nextPath: string,
  mfaMethodType?: MFA_METHOD_TYPE
) => {
  app._router.stack
    .filter((layer: any) => layer.name === "router")
    .forEach((router: any) => {
      router.handle.stack.forEach((routerStack: any) => {
        routerStack.route.stack.forEach((routeStack: any) => {
          if (routeStack.name === "validateSessionMiddleware") {
            routeStack.handle = sinon.stub().callsFake(function (
              req: any,
              res: any,
              next: any
            ): void {
              res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

              req.session.user = {
                email: "test@test.com",
                phoneNumber: "7867",
                journey: {
                  nextPath: nextPath,
                },
                mfaMethodType: mfaMethodType,
              };

              console.log("Stubbed validateSessionMiddleware called");

              next();
            });
          }
        });
      });
    });

  let cookies, token;
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
  return { token, cookies };
};
