import { describe } from "mocha";
import { expect, request, sinon } from "../../../../test/utils/test-utils";
import * as cheerio from "cheerio";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import decache from "decache";
import nock = require("nock");
import { ERROR_CODES, SecurityCodeErrorType } from "../../common/constants";

describe("Integration::2fa sms (in reset password flow)", () => {
  let app: any;
  let baseApi: string;
  let token: string | string[];
  let cookies: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        req.session.user = {
          email: "test@test.com",
          journey: {
            nextPath: PATH_NAMES.RESET_PASSWORD_2FA_SMS,
          },
        };

        next();
      });

    app = await require("../../../app").createApp();

    baseApi = process.env.FRONTEND_API_BASE_URL;

    nock(baseApi).persist().post("/mfa").reply(204);

    await request(app, (test) => test.get(PATH_NAMES.RESET_PASSWORD_2FA_SMS), {
      expectTaxonomyMatchSnapshot: false,
    }).then((res) => {
      const $ = cheerio.load(res.text);
      token = $("[name=_csrf]").val();
      cookies = res.headers["set-cookie"];
    });
  });

  beforeEach(() => {
    nock.cleanAll();
    process.env.SUPPORT_2HR_LOCKOUT = "0";
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return check your phone page", async () => {
    nock(baseApi).persist().post("/mfa").reply(204);
    await request(app, (test) =>
      test.get("/reset-password-2fa-sms").expect(200)
    );
  });

  it("should render index-security-code-entered-exceeded.njk when user is locked out due to too many incorrect codes", async () => {
    process.env.SUPPORT_2HR_LOCKOUT = "1";
    nock(baseApi).persist().post("/mfa").reply(400, {
      code: ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES,
    });
    await request(app, (test) =>
      test
        .get("/reset-password-2fa-sms")
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($(".govuk-heading-l").text()).to.contains(
            "You cannot sign in at the moment"
          );
          expect($(".govuk-body").text()).to.contains("Wait for 2 hours");
        })
        .expect(200)
    );
  });

  it("should redirect to reset password step when valid sms code is entered", async () => {
    nock(baseApi)
      .persist()
      .post(API_ENDPOINTS.VERIFY_CODE)
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    request(app, (test) =>
      test
        .post(PATH_NAMES.RESET_PASSWORD_2FA_SMS)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123456",
        })
        .expect("Location", PATH_NAMES.RESET_PASSWORD)
        .expect(302)
    );
  });

  it("should return error page when when user is locked out", async () => {
    nock(baseApi).persist().post(API_ENDPOINTS.VERIFY_CODE).reply(400, {
      code: ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES,
      success: false,
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.RESET_PASSWORD_2FA_SMS)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123456",
        })
        .expect(
          "Location",
          `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=${SecurityCodeErrorType.MfaMaxRetries}`
        )
        .expect(302)
    );
  });
});
