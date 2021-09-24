import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import decache from "decache";
import { USER_STATE } from "../../../app.constants";
import cheerio from "cheerio";

describe("Integration::reset password check email ", () => {
  let sandbox: sinon.SinonSandbox;
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
        req.session.user = {
          email: "test@test.com",
        };
        next();
      });

    app = require("../../../app").createApp();
    baseApi = process.env.API_BASE_URL;
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sandbox.restore();
    app = undefined;
  });

  it("should return reset password check email page", (done) => {
    nock(baseApi)
      .post("/reset-password-request")
      .once()
      .reply(200, { sessionState: USER_STATE.RESET_PASSWORD_LINK_SENT });
    request(app).get("/reset-password-check-email").expect(200, done);
  });

  it("should return error page when 6 password reset codes requested", (done) => {
    nock(baseApi)
      .post("/reset-password-request")
      .times(6)
      .reply(400, { code: "1022" });

    request(app)
      .get("/reset-password-check-email")
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($(".govuk-heading-l").text()).to.contains(
          "You requested too many password resets"
        );
      })
      .expect(200, done);
  });

  it("should return error page when blocked from requesting codes", (done) => {
    nock(baseApi)
      .post("/reset-password-request")
      .once()
      .reply(400, { code: "1023" });

    request(app)
      .get("/reset-password-check-email")
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($(".govuk-heading-l").text()).to.contains(
          "You cannot request a password reset at the moment"
        );
      })
      .expect(200, done);
  });

  it("should return internal server error when /reset-password-request API call response is 500", (done) => {
    nock(baseApi).post("/reset-password-request").once().reply(500, {});
    request(app).get("/reset-password-check-email").expect(500, done);
  });
});
