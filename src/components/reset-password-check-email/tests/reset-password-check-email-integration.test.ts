import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import decache from "decache";

import cheerio from "cheerio";
import { PATH_NAMES } from "../../../app.constants";

describe("Integration::reset password check email ", () => {
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
            nextPath: PATH_NAMES.ENTER_PASSWORD,
            optionalPaths: [PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL],
          },
        };

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
          "You tried to reset your password too many times"
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
          "You cannot reset your password at the moment"
        );
      })
      .expect(200, done);
  });

  it("should redisplay page with error", (done) => {
    nock(baseApi)
      .post("/verify-code")
      .reply(400, { code: 1021 });

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
});
