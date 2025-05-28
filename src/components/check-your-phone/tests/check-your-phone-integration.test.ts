import { describe } from "mocha";
import { expect, sinon, request } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import * as cheerio from "cheerio";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import { ERROR_CODES, SecurityCodeErrorType } from "../../common/constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";
describe("Integration:: check your phone", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    const { createApp } = await esmock(
      "../../../app.js",
      {},
      {
        "../../../middleware/session-middleware.js": {
          validateSessionMiddleware: sinon.fake(function (
            req: Request,
            res: Response,
            next: NextFunction
          ): void {
            res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

            req.session.user = {
              isAccountCreationJourney: true,
              email: "test@test.com",
              journey: getPermittedJourneyForPath(PATH_NAMES.CHECK_YOUR_PHONE),
            };

            next();
          }),
        },
      }
    );

    app = await createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL;

    await request(app, (test) => test.get(PATH_NAMES.CHECK_YOUR_PHONE)).then(
      (res) => {
        const $ = cheerio.load(res.text);
        token = $("[name=_csrf]").val();
        cookies = res.headers["set-cookie"];
      }
    );
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return check your phone page", async () => {
    await request(app, (test) =>
      test.get(PATH_NAMES.CHECK_YOUR_PHONE).expect(200)
    );
  });

  // TODO: AUT-4272 PR 3: Reinstate this test once csrf validation is re-enabled.
  it.skip("should return error when csrf not present", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_PHONE)
        .type("form")
        .send({
          code: "123456",
        })
        .expect(403)
    );
  });

  it("should return validation error when code not entered", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_PHONE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#code-error").text()).to.contains("Enter the code");
        })
        .expect(400)
    );
  });

  it("should return validation error when code is less than 6 characters", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_PHONE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "2",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#code-error").text()).to.contains(
            "Enter the code using only 6 digits"
          );
        })
        .expect(400)
    );
  });

  it("should return validation error when code is greater than 6 characters", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_PHONE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "1234567",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#code-error").text()).to.contains(
            "Enter the code using only 6 digits"
          );
        })
        .expect(400)
    );
  });

  it("should return validation error when code entered contains letters", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_PHONE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "12ert-",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#code-error").text()).to.contains(
            "Enter the code using only 6 digits"
          );
        })
        .expect(400)
    );
  });

  it("should redirect to /create-password when valid code entered", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_MFA_CODE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {})
      .post(API_ENDPOINTS.SEND_NOTIFICATION)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT);

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_PHONE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123456",
        })
        .expect("Location", PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL)
        .expect(302)
    );
  });

  it("should return validation error when incorrect code entered", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_MFA_CODE).once().reply(400, {
      code: ERROR_CODES.INVALID_VERIFY_PHONE_NUMBER_CODE,
      success: false,
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_PHONE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123455",
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#code-error").text()).to.contains(
            "The code you entered is not correct, or may have expired, try entering it again or request a new code"
          );
        })
        .expect(400)
    );
  });

  it("should redirect to security code expired when incorrect code has been entered 5 times", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_MFA_CODE).times(6).reply(400, {
      code: ERROR_CODES.ENTERED_INVALID_VERIFY_PHONE_NUMBER_CODE_MAX_TIMES,
      success: false,
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_PHONE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123455",
        })
        .expect(
          "Location",
          `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=${SecurityCodeErrorType.OtpMaxRetries}`
        )
        .expect(302)
    );
  });

  it('should render the "you requested too many codes" pages when incorrect code has requested more than 5 times', async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_MFA_CODE).reply(400, {
      code: ERROR_CODES.VERIFY_PHONE_NUMBER_CODE_REQUEST_BLOCKED,
      success: false,
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_PHONE)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123455",
        })
        .expect(
          "Location",
          `${PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED}?actionType=${SecurityCodeErrorType.OtpBlocked}`
        )
        .expect(302)
    );

    await request(app, (test) =>
      test
        .get(PATH_NAMES.CHECK_YOUR_PHONE)
        .expect((res) => {
          res.text.includes("Wait 2 hours");
        })
        .expect(200)
    );
  });
});
