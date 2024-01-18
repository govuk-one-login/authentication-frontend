import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import decache from "decache";

import cheerio from "cheerio";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import nock = require("nock");

describe("Integration::reset password check email ", () => {
  let app: any;
  let baseApi: string;
  let token: string | string[];
  let cookies: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");

    process.env.SUPPORT_2FA_B4_PASSWORD_RESET = "1";

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        req.session.user = {
          email: "test@test.com",
          journey: {
            nextPath: PATH_NAMES.ENTER_PASSWORD,
            optionalPaths: [PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL],
          },
        };
        req.session.user.enterEmailMfaType = "SMS";
        next();
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    nock(baseApi).post("/reset-password-request").once().reply(204);

    request(app)
      .get(PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL)
      .end((err, res) => {
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

  it("should return reset password check email page", (done) => {
    nock(baseApi).post("/reset-password-request").once().reply(204);
    request(app).get("/reset-password-check-email").expect(200, done);
  });

  it("should include confirmation paragraph inside the reponse body", (done) => {
    nock(baseApi).post("/reset-password-request").once().reply(204);
    request(app)
      .get("/reset-password-check-email")
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#confirmationParagraph").length).to.eq(1);
      })
      .expect(200, done);
  });

  it("should return error page when 6 password reset codes requested", (done) => {
    nock(baseApi)
      .post("/reset-password-request")
      .times(6)
      .reply(400, { code: 1022 });

    request(app)
      .get("/reset-password-check-email")
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($(".govuk-heading-l").text()).to.contains(
          "You asked to resend the security code too many times"
        );
      })
      .expect(200, done);
  });

  it("should return error page when blocked from requesting codes", (done) => {
    nock(baseApi)
      .post("/reset-password-request")
      .once()
      .reply(400, { code: 1023 });

    request(app)
      .get("/reset-password-check-email")
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($(".govuk-heading-l").text()).to.contains(
          "You cannot get a new security code at the moment"
        );
      })
      .expect(200, done);
  });

  it("should redisplay page with error", (done) => {
    nock(baseApi).post("/verify-code").reply(400, { code: 1021 });

    request(app)
      .post("/reset-password-check-email")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "The security code you entered is not correct"
        );
      })
      .expect(400, done);
  });

  it("should return internal server error when /reset-password-request API call response is 500", (done) => {
    nock(baseApi).post("/reset-password-request").once().reply(500, {});
    request(app).get("/reset-password-check-email").expect(500, done);
  });

  it("should redirect to /reset-password-2fa-sms if user's 2FA is set to SMS", (done) => {
    nock(baseApi)
      .persist()
      .post(API_ENDPOINTS.VERIFY_CODE)
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    request(app)
      .post("/reset-password-check-email")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect("Location", PATH_NAMES.RESET_PASSWORD_2FA_SMS)
      .expect(302, done);
  });
});
