import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";

function createClientInfoNock(baseApi: string) {
  nock(baseApi)
    .get("/client-info")
    .once()
    .reply(200, {
      client_id: "client_test",
      client_name: "client_test_name",
      scopes: ["email", "phone"],
    });
}

describe("Integration::share info", () => {
  let sandbox: sinon.SinonSandbox;
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    sandbox = sinon.createSandbox();
    sandbox
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        res.locals.clientSessionId = "csy103saszhcxbQq0-mjdzU854";
        res.locals.persistentSessionId = "dips-123456-abc";
        req.session.email = "test@test.com";
        next();
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    createClientInfoNock(baseApi);

    request(app)
      .get("/share-info")
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
    sandbox.restore();
    app = undefined;
  });

  it("should return share info page", (done) => {
    createClientInfoNock(baseApi);
    request(app).get("/share-info").expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post("/share-info")
      .type("form")
      .send({
        consentValue: "true",
      })
      .expect(500, done);
  });

  it("should return validation error when consentValue not selected", (done) => {
    request(app)
      .post("/share-info")
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
    nock(baseApi).post("/update-profile").once().reply(200, {
      sessionState: "CONSENT_ADDED",
    });

    request(app)
      .post("/share-info")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        consentValue: "true",
      })
      .expect("Location", "/auth-code")
      .expect(302, done);
  });

  it("should return internal server error when /update-profile API call response is 500", (done) => {
    nock(baseApi).post("/update-profile").once().reply(500, {});

    request(app)
      .post("/share-info")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        consentValue: "true",
      })
      .expect(500, done);
  });

  it("should return internal server error when /client-info API call response is 500", (done) => {
    nock(baseApi).get("/client-info").once().reply(500, {});
    request(app).get("/share-info").expect(500, done);
  });
});
