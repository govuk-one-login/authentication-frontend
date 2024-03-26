import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { getFrontendApiBaseUrl } from "../../../config";

describe("Integration::setup-authenticator-app", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        res.locals.clientSessionId = "csy103saszhcxbQq0-mjdzU854";
        res.locals.persistentSessionId = "dips-123456-abc";

        req.session.user = {
          email: "test@test.com",
          journey: {
            nextPath: PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP,
          },
          authAppSecret: "secret",
        };

        next();
      });

    app = await require("../../../app").createApp();
    baseApi = getFrontendApiBaseUrl();

    request(app)
      .get(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
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

  it("should return setup authenticator app page", (done) => {
    request(app)
      .get(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
      .expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
      .type("form")
      .send({
        code: "123456",
      })
      .expect(500, done);
  });

  it("should return validation error when access code not entered", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the security code shown in your authenticator app"
        );
        expect($("#secret-key").text()).to.not.be.empty;
      })
      .expect(400, done);
  });

  it("should return validation error when access code is too long (more than 6 digits)", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "12345678910",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the security code using only 6 digits"
        );
        expect($("#secret-key").text()).to.not.be.empty;
      })
      .expect(400, done);
  });

  it("should return validation error when code has non-digit characters", (done) => {
    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "asdfgh",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "Enter the security code using only 6 digits"
        );
        expect($("#secret-key").text()).to.not.be.empty;
      })
      .expect(400, done);
  });

  it("should redirect to /account-created page when successful validation of code", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_MFA_CODE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT, { success: true });
    nock(baseApi)
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT, { success: true });

    request(app)
      .post(PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect("Location", PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL)
      .expect(302, done);
  });
});
