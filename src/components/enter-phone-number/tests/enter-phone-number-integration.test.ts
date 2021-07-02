import request from "supertest";
import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import * as sessionMiddleware from "../../../middleware/session-middleware";

describe("Integration::enter phone number", () => {
  let sandbox: sinon.SinonSandbox;
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(() => {
    sandbox = sinon.createSandbox();
    sandbox
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        req.session.user = {
          id: "12sadjk",
          scope: "openid",
          email: "test@test.com",
        };
        next();
      });

    app = require("../../../app").createApp();
    baseApi = process.env.API_BASE_URL;

    request(app)
      .get("/enter-phone-number")
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
  });

  it("should return enter phone number page", (done) => {
    request(app).get("/enter-phone-number").expect(200, done);
  });

  it("should return error when csrf not present", (done) => {
    request(app)
      .post("/enter-phone-number")
      .type("form")
      .send({
        phoneNumber: "123456789",
      })
      .expect(500, done);
  });

  it("should return validation error when phone number not entered", (done) => {
    request(app)
      .post("/enter-phone-number")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#phoneNumber-error").text()).to.contains(
          "Enter a UK phone number"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when phone number entered is not valid", (done) => {
    request(app)
      .post("/enter-phone-number")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "123456789",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#phoneNumber-error").text()).to.contains(
          "Enter a UK phone number"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when phone number entered contains text", (done) => {
    request(app)
      .post("/enter-phone-number")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "123456789dd",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#phoneNumber-error").text()).to.contains(
          "Phone number must only include numbers"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when phone number entered less than 12 characters", (done) => {
    request(app)
      .post("/enter-phone-number")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "123",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#phoneNumber-error").text()).to.contains(
          "Enter a UK phone number, like 01632 960000 or 07700 900000"
        );
      })
      .expect(400, done);
  });

  it("should return validation error when phone number entered greater than 12 characters", (done) => {
    request(app)
      .post("/enter-phone-number")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "123123123123123123",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#phoneNumber-error").text()).to.contains(
          "Enter a UK phone number, like 01632 960000 or 07700 900000"
        );
      })
      .expect(400, done);
  });

  it("should redirect to /check-your-phone page when valid UK phone number entered", (done) => {
    nock(baseApi)
      .post("/update-profile")
      .once()
      .reply(200, {
        sessionState: "ADDED_UNVERIFIED_PHONE_NUMBER",
      })
      .post("/send-notification")
      .once()
      .reply(200, {});

    request(app)
      .post("/enter-phone-number")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "07738394991",
      })
      .expect("Location", "/check-your-phone")
      .expect(302, done);
  });

  it("should return internal server error if /update-profile api call fails", (done) => {
    nock(baseApi)
      .post("/update-profile")
      .once()
      .reply(500, {
        sessionState: "done",
      })
      .post("/send-notification")
      .once()
      .reply(200, {});

    request(app)
      .post("/enter-phone-number")
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        phoneNumber: "07738394991",
      })
      .expect(500, done);
  });
});
