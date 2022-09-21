import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";

describe("Integration::share info", () => {
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
            nextPath: PATH_NAMES.SHARE_INFO,
          },
        };

        req.session.client = {
          name: "clientname",
          scopes: ["openid", "email", "phone"],
        };

        next();
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    request(app)
      .get(PATH_NAMES.SHARE_INFO)
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

  it("should return share info page", (done) => {
    request(app).get(PATH_NAMES.SHARE_INFO).expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post(PATH_NAMES.SHARE_INFO)
      .type("form")
      .send({
        consentValue: "true",
      })
      .expect(500, done);
  });

  it("should return validation error when consentValue not selected", (done) => {
    request(app)
      .post(PATH_NAMES.SHARE_INFO)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        consentValue: undefined,
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#consentValue-error").text()).to.contains(
          "Select if you want to share your email address and phone number or not"
        );
      })
      .expect(400, done);
  });

  it("should redirect to /auth-code page when consentValue valid", (done) => {
    nock(baseApi)
      .post(API_ENDPOINTS.UPDATE_PROFILE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    request(app)
      .post(PATH_NAMES.SHARE_INFO)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        consentValue: "true",
      })
      .expect("Location", PATH_NAMES.AUTH_CODE)
      .expect(302, done);
  });

  it("should return internal server error when /update-profile API call response is 500", (done) => {
    nock(baseApi).post(API_ENDPOINTS.UPDATE_PROFILE).once().reply(500, {});

    request(app)
      .post(PATH_NAMES.SHARE_INFO)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        consentValue: "true",
      })
      .expect(500, done);
  });
});
