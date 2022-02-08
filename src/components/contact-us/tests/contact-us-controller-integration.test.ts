import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import { PATH_NAMES } from "../../../app.constants";

describe("Integration:: contact us - public user", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let zendeskApiUrl: string;

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
        req.session.user.email = "test@test.com";
        req.session.user.phoneNumber = "******7867";

        next();
      });

    app = await require("../../../app").createApp();
    zendeskApiUrl = process.env.ZENDESK_API_URL;

    request(app)
      .get(PATH_NAMES.CONTACT_US)
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
    sinon.restore();
    app = undefined;
  });

  it("should return contact us page", (done) => {
    request(app)
      .get(PATH_NAMES.CONTACT_US)
      .query("supportType=PUBLIC")
      .expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post(PATH_NAMES.CONTACT_US)
      .query("supportType=PUBLIC")
      .type("form")
      .send({})
      .expect(500, done);
  });

  it("should return validation error when description are not entered", (done) => {
    request(app)
      .post(PATH_NAMES.CONTACT_US)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        issueDescription: "",
        feedbackContact: "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#issueDescription-error").text()).to.contains(
          "Tell us what you need help with or give us feedback"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when user selected yes to contact for feedback and left fields empty", (done) => {
    request(app)
      .post(PATH_NAMES.CONTACT_US)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        issueDescription: "issue",
        feedbackContact: "true",
        name: "",
        replyEmail: "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#name-error").text()).to.contains("Enter your name");
        expect($("#replyEmail-error").text()).to.contains("Enter your email");
      })
      .expect(400, done);
  });

  it("should redirect to success page when form submitted", (done) => {
    nock(zendeskApiUrl).post("/tickets.json").once().reply(200);

    request(app)
      .post(PATH_NAMES.CONTACT_US)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        issueDescription: "issue",
        feedbackContact: "true",
        name: "test",
        replyEmail: "test@test.com",
      })
      .expect("Location", PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS)
      .expect(302, done);
  });
});
