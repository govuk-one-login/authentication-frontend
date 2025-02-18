import { describe } from "mocha";
import { expect, request, sinon } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import { AxiosResponse } from "axios";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants";
import { ERROR_CODES, SecurityCodeErrorType } from "../../common/constants";
import {
  AccountRecoveryInterface,
  AccountRecoveryResponse,
} from "../../common/account-recovery/types";
import { createApiResponse } from "../../../utils/http";
import { Request, Response, NextFunction } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper";

describe("Integration:: enter mfa", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;
  const PHONE_NUMBER = "7867";

  before(async () => {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    decache("../../common/account-recovery/account-recovery-service");
    const sessionMiddleware = require("../../../middleware/session-middleware");
    const accountRecoveryService = require("../../common/account-recovery/account-recovery-service");

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (
        req: Request,
        res: Response,
        next: NextFunction
      ): void {
        res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

        req.session.user = {
          email: "test@test.com",
          phoneNumber: PHONE_NUMBER,
          redactedPhoneNumber: PHONE_NUMBER,
          journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_MFA),
        };
        next();
      });

    sinon
      .stub(accountRecoveryService, "accountRecoveryService")
      .callsFake((): AccountRecoveryInterface => {
        async function accountRecovery() {
          const fakeAxiosResponse: AxiosResponse = {
            data: {
              accountRecoveryPermitted: true,
            },
            status: HTTP_STATUS_CODES.OK,
          } as AxiosResponse;

          return createApiResponse<AccountRecoveryResponse>(fakeAxiosResponse);
        }

        return { accountRecovery };
      });

    app = await require("../../../app").createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL || "";

    await request(app, (test) => test.get(PATH_NAMES.ENTER_MFA), {
      expectAnalyticsPropertiesMatchSnapshot: false,
    }).then((res) => {
      const $ = cheerio.load(res.text);
      token = $("[name=_csrf]").val();
      cookies = res.headers["set-cookie"];
    });
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    process.env.SUPPORT_REAUTHENTICATION = "0";
    delete process.env.SUPPORT_MFA_RESET_WITH_IPV;
    delete process.env.ROUTE_USERS_TO_NEW_IPV_JOURNEY;
    sinon.restore();
    app = undefined;
  });

  it("should return check your phone page with sign in analytics properties", async () => {
    await request(app, (test) => test.get(PATH_NAMES.ENTER_MFA).expect(200));
  });

  const TEST_DATA = [
    {
      description: "when support mfa reset with ipv is off",
      supportMfaResetWithIpv: "0",
      routeUsersToNewIpvJourney: "0",
      expectedHref:
        PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES + "?type=SMS",
      expectedLinkText: "change how you get security codes",
    },
    {
      description:
        "when support mfa reset with ipv is off regardless of route to new journey flag",
      supportMfaResetWithIpv: "0",
      routeUsersToNewIpvJourney: "1",
      expectedHref:
        PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES + "?type=SMS",
      expectedLinkText: "change how you get security codes",
    },
    {
      description:
        "when support mfa reset with ipv is on and route users to new journey is on",
      supportMfaResetWithIpv: "1",
      routeUsersToNewIpvJourney: "1",
      expectedHref: PATH_NAMES.MFA_RESET_WITH_IPV,
      expectedLinkText: "check if you can change how you get security codes",
    },
    {
      description:
        "when support mfa reset with ipv is on but route to new journeys is off",
      supportMfaResetWithIpv: "1",
      routeUsersToNewIpvJourney: "0",
      expectedHref:
        PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES + "?type=SMS",
      expectedLinkText: "change how you get security codes",
    },
  ];

  TEST_DATA.forEach((testData) => {
    it(`should include the correct link to change mfa methods ${testData.description}`, async () => {
      process.env.SUPPORT_MFA_RESET_WITH_IPV = testData.supportMfaResetWithIpv;
      process.env.ROUTE_USERS_TO_NEW_IPV_JOURNEY =
        testData.routeUsersToNewIpvJourney;
      await request(app, (test) =>
        test
          .get(PATH_NAMES.ENTER_MFA)
          .expect(200)
          .expect(function (res) {
            const $ = cheerio.load(res.text);
            expect(
              $("a")
                .toArray()
                .some(
                  (link) =>
                    $(link).attr("href") === testData.expectedHref &&
                    $(link).text().trim() === testData.expectedLinkText
                )
            ).to.be.true;
          })
      );
    });
  });

  it("following a validation error it should not include link to change security codes where account recovery is not permitted", async () => {
    await request(app, (test) =>
      test
        .get(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123456",
          phoneNumber: PHONE_NUMBER,
          supportAccountRecovery: false,
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("body").text()).to.not.contains(
            "You can securely change how you get security codes"
          );
        })
        .expect(200)
    );
  });

  it("should return error when csrf not present", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
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
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "",
          phoneNumber: PHONE_NUMBER,
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
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "2",
          phoneNumber: PHONE_NUMBER,
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
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "1234567",
          phoneNumber: PHONE_NUMBER,
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
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "12ert-",
          phoneNumber: PHONE_NUMBER,
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

  it("should redirect to /auth-code when valid code entered", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_CODE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123456",
          phoneNumber: PHONE_NUMBER,
        })
        .expect("Location", PATH_NAMES.AUTH_CODE)
        .expect(302)
    );
  });

  it("should return validation error when incorrect code entered", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_CODE).once().reply(400, {
      code: ERROR_CODES.INVALID_MFA_CODE,
      success: false,
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123455",
          phoneNumber: PHONE_NUMBER,
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#code-error").text()).to.contains(
            " The code you entered is not correct, or may have expired, try entering it again or request a new code"
          );
        })
        .expect(400)
    );
  });

  it("should redirect to security code expired when incorrect code has been entered 5 times", async () => {
    process.env.SUPPORT_REAUTHENTICATION = "0";
    nock(baseApi).post(API_ENDPOINTS.VERIFY_CODE).times(6).reply(400, {
      code: ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES,
      success: false,
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123455",
        })
        .expect(
          "Location",
          `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=${SecurityCodeErrorType.MfaMaxRetries}`
        )
        .expect(302)
    );
  });

  it("should redirect to security code requests blocked when exceeded request limit", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_CODE).times(1).reply(400, {
      code: ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED,
      success: false,
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123455",
        })
        .expect(
          "Location",
          `${PATH_NAMES.SECURITY_CODE_WAIT}?actionType=${SecurityCodeErrorType.MfaBlocked}`
        )
        .expect(302)
    );
  });

  it("should redirect to security code requested too many times when exceed request limit", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_CODE).times(6).reply(400, {
      code: ERROR_CODES.MFA_SMS_MAX_CODES_SENT,
      success: false,
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123455",
        })
        .expect(
          "Location",
          `${PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED}?actionType=${SecurityCodeErrorType.MfaMaxCodesSent}`
        )
        .expect(302)
    );
  });

  it("should lock user if he entered 6 incorrect codes in the reauth journey and the logout switch is turned off", async () => {
    process.env.SUPPORT_REAUTHENTICATION = "0";
    nock(baseApi).post(API_ENDPOINTS.VERIFY_CODE).times(6).reply(400, {
      code: ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES,
      success: false,
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123455",
        })
        .expect(
          "Location",
          `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=${SecurityCodeErrorType.MfaMaxRetries}`
        )
        .expect(302)
    );
  });
});
