import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants";

function nockClientInfo(baseApi: string) {
  nock(baseApi)
    .get(API_ENDPOINTS.CLIENT_INFO)
    .once()
    .reply(200, {
      client_id: "0wmWMtSCIRmNtbi_UaenAkt9D7o",
      client_name: "testclient",
      scopes: ["openid", "email", "phone"],
      redirectUri: "http://localhost:5000/callback",
      state: "test",
      serviceType: "test",
      cookieConsentShared: false,
      consentEnabled: false,
    });
}

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

        next();
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    nockClientInfo(baseApi);

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
    nockClientInfo(baseApi);
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
        expect($("#share-info-error").text()).to.contains(
          "Select if you want to share your email address and phone number or not"
        );
      })
      .expect(400, done);
  });

  it("should redirect to /auth-code page when consentValue valid", (done) => {
    nock(baseApi).post(API_ENDPOINTS.UPDATE_PROFILE).once().reply(200);

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

  it("should return internal server error when /client-info API call response is 500", (done) => {
    nock(baseApi).get(API_ENDPOINTS.CLIENT_INFO).once().reply(500, {});
    request(app).get(PATH_NAMES.SHARE_INFO).expect(500, done);
  });
});
