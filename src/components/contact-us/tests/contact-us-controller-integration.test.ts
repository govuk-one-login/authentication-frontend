import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";

describe("Integration:: contact us - end user", () => {
  let sandbox: sinon.SinonSandbox;
  let token: string | string[];
  let cookies: string;
  let app: any;

  before(() => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    sandbox = sinon.createSandbox();
    sandbox
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        req.session.email = "test@test.com";
        req.session.phoneNumber = "******7867";

        next();
      });

    app = require("../../../app").createApp();

    request(app)
      .get("/contact-us")
      .query("supportType=PUBLIC")
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

  it("should return contact us end user mfa code page", (done) => {
    request(app)
      .get("/contact-us")
      .query("supportType=PUBLIC")
      .expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post("/contact-us")
      .query("supportType=PUBLIC")
      .type("form")
      .send({
        serviceType: "",
      })
      .expect(500, done);
  });

  it("should return validation error when service name and description are not entered", (done) => {
    request(app)
      .post("/contact-us-submit")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        serviceType: "",
        issueDescription: "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#serviceType-error").text()).to.contains(
          "Enter the name of the service you were using"
        );
        expect($("#issueDescription-error").text()).to.contains(
          "Tell us what you need help with"
        );
      })
      .expect(400, done);
  });
});
