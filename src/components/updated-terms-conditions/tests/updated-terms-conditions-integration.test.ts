import request from "supertest";
import { beforeEach, describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";

function nockClientInfo(baseApi: string) {
  nock(baseApi)
    .get("/client-info")
    .reply(200, {
      client_id: "0wmWMtSCIRmNtbi_UaenAkt9D7o",
      client_name: "testclient",
      scopes: ["openid", "email", "phone"],
      redirectUri: "http://localhost:5000/callback",
      state: "test",
    });
}

describe("Integration:: updated-terms-code", () => {
  let sandbox: sinon.SinonSandbox;
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(() => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    sandbox = sinon.createSandbox();
    sandbox
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        res.locals.clientSessionId = "tDy103saszhcxbQq0-mjdzU33d";
        req.session.email = "test@test.com";
        req.session.phoneNumber = "******7867";
        req.session.redirectUri = "http://localhost:5000/callback";

        next();
      });

    app = require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    nockClientInfo(baseApi);

    request(app)
      .get("/updated-terms-and-conditions")
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

  it("should return update terms and conditions page", (done) => {
    nockClientInfo(baseApi);
    request(app).get("/updated-terms-and-conditions").expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post("/updated-terms-and-conditions")
      .type("form")
      .send({
        termsAndConditionsResult: "reject",
      })
      .expect(500, done);
  });

  it("should redirect to /auth_code when terms accepted", (done) => {
    nock(baseApi).post("/update-profile").once().reply(200, {
      sessionState: "UPDATED_TERMS_AND_CONDITIONS_ACCEPTED",
    });

    request(app)
      .post("/updated-terms-and-conditions")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        termsAndConditionsResult: "accept",
      })
      .expect("Location", "/auth-code")
      .expect(302, done);
  });

  it("should redirect to /share-info consent required", (done) => {
    nock(baseApi).post("/update-profile").once().reply(200, {
      sessionState: "CONSENT_REQUIRED",
    });

    request(app)
      .post("/updated-terms-and-conditions")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        termsAndConditionsResult: "accept",
      })
      .expect("Location", "/share-info")
      .expect(302, done);
  });
});
