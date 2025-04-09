import { describe } from "mocha";
import { sinon, request } from "../../../../../test/utils/test-utils";
import nock from "nock";
import * as cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../../app.constants";
import { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../../test/helpers/session-helper";
import { buildMfaMethods } from "../../../../../test/helpers/mfa-helper";

describe("Integration:: resend SMS mfa code (account creation variant)", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    decache("../../../../app");
    decache("../../../../middleware/session-middleware");
    const sessionMiddleware = await import(
      "../../../../middleware/session-middleware"
    );
    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (
        req: Request,
        res: Response,
        next: NextFunction
      ): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

        req.session.user = {
          email: "test@test.com",
          mfaMethods: buildMfaMethods({ phoneNumber: "7867" }),
          journey: getPermittedJourneyForPath(
            PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION
          ),
        };

        next();
      });

    app = await (await import("../../../../app")).createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL as string;

    await request(
      app,
      (test) => test.get(PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION),
      { expectAnalyticsPropertiesMatchSnapshot: false }
    ).then((res) => {
      const $ = cheerio.load(res.text);
      token = $("[name=_csrf]").val();
      cookies = res.headers["set-cookie"];
    });
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return resend mfa code page", async () => {
    await request(app, (test) =>
      test.get(PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION).expect(200)
    );
  });

  it("should return error when csrf not present", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION)
        .type("form")
        .send({
          code: "123456",
        })
        .expect(403)
    );
  });

  it("should redirect to /check-your-phone when new code requested", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          isResendCodeRequest: true,
        })
        .expect("Location", PATH_NAMES.CHECK_YOUR_PHONE)
        .expect(302)
    );
  });

  it("should return 500 error screen when API call fails", async () => {
    nock(baseApi).post(API_ENDPOINTS.SEND_NOTIFICATION).once().reply(500, {
      errorCode: "1234",
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESEND_MFA_CODE_ACCOUNT_CREATION)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
        })
        .expect(500)
    );
  });
});
