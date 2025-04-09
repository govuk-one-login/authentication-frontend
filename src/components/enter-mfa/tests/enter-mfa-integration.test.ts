import { describe } from "mocha";
import { expect, request, sinon } from "../../../../test/utils/test-utils";
import nock from "nock";
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
import { SendNotificationServiceInterface } from "../../common/send-notification/types";
import { DefaultApiResponse } from "../../../types";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper";

describe("Integration:: enter mfa", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;
  const PHONE_NUMBER = "7867";

  async function setupStubbedApp(
    options: {
      supportMfaResetWithIpv?: boolean;
      routeUsersToNewIpvJourney?: boolean;
    } = {
      supportMfaResetWithIpv: false,
      routeUsersToNewIpvJourney: false,
    }
  ) {
    process.env.SUPPORT_MFA_RESET_WITH_IPV = options.supportMfaResetWithIpv
      ? "1"
      : "0";
    process.env.ROUTE_USERS_TO_NEW_IPV_JOURNEY =
      options.routeUsersToNewIpvJourney ? "1" : "0";

    decache("../../../app");
    decache("../../../middleware/session-middleware");
    decache("../../common/account-recovery/account-recovery-service");
    decache("../../../../test/helpers/session-helper");
    decache("../../common/send-notification/send-notification-service");
    const sessionMiddleware = await import(
      "../../../middleware/session-middleware"
    );
    const accountRecoveryService = await import(
      "../../common/account-recovery/account-recovery-service"
    );
    const sendNotificationService = import(
      "../../common/send-notification/send-notification-service"
    );
    const { getPermittedJourneyForPath } = await import(
      "../../../../test/helpers/session-helper"
    );

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
          mfaMethods: buildMfaMethods({
            phoneNumber: PHONE_NUMBER,
            redactedPhoneNumber: PHONE_NUMBER,
          }),
          journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_MFA),
          isAccountRecoveryPermitted: true,
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

    sinon
      .stub(sendNotificationService, "sendNotificationService")
      .callsFake((): SendNotificationServiceInterface => {
        async function sendNotification() {
          const fakeAxiosResponse: AxiosResponse = {
            data: "test",
            status: HTTP_STATUS_CODES.OK,
          } as AxiosResponse;

          return createApiResponse<DefaultApiResponse>(fakeAxiosResponse);
        }

        return { sendNotification };
      });

    app = await (await import("../../../app")).createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL || "";

    await request(app, (test) => test.get(PATH_NAMES.ENTER_MFA), {
      expectAnalyticsPropertiesMatchSnapshot: false,
    }).then((res) => {
      const $ = cheerio.load(res.text);
      token = $("[name=_csrf]").val();
      cookies = res.headers["set-cookie"];
    });
  }

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
    await setupStubbedApp();
    await request(app, (test) => test.get(PATH_NAMES.ENTER_MFA).expect(200));
  });

  const TEST_DATA = [
    {
      description: "when support mfa reset with ipv is off",
      supportMfaResetWithIpv: false,
      routeUsersToNewIpvJourney: false,
      expectedHref:
        PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES + "?type=SMS",
      expectedLinkText: "change how you get security codes",
    },
    {
      description:
        "when support mfa reset with ipv is off regardless of route to new journey flag",
      supportMfaResetWithIpv: false,
      routeUsersToNewIpvJourney: true,
      expectedHref:
        PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES + "?type=SMS",
      expectedLinkText: "change how you get security codes",
    },
    {
      description:
        "when support mfa reset with ipv is on and route users to new journey is on",
      supportMfaResetWithIpv: true,
      routeUsersToNewIpvJourney: true,
      expectedHref: PATH_NAMES.MFA_RESET_WITH_IPV,
      expectedLinkText: "check if you can change how you get security codes",
    },
    {
      description:
        "when support mfa reset with ipv is on but route to new journeys is off",
      supportMfaResetWithIpv: true,
      routeUsersToNewIpvJourney: false,
      expectedHref:
        PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES + "?type=SMS",
      expectedLinkText: "change how you get security codes",
    },
  ];

  TEST_DATA.forEach((testData) => {
    it(`should include the correct link to change mfa methods ${testData.description}`, async () => {
      await setupStubbedApp({
        supportMfaResetWithIpv: testData.supportMfaResetWithIpv,
        routeUsersToNewIpvJourney: testData.routeUsersToNewIpvJourney,
      });
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

  it("cannot access old journey when new journey enabled", async () => {
    await setupStubbedApp({
      supportMfaResetWithIpv: true,
      routeUsersToNewIpvJourney: true,
    });
    await request(app, (test) =>
      test
        .get(PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES + "?type=SMS")
        .expect(302)
        .expect("Location", PATH_NAMES.ENTER_MFA)
    );
  });

  it("can access old journey when new journey enabled but routing users to IPV is disabled", async () => {
    await setupStubbedApp({
      supportMfaResetWithIpv: true,
      routeUsersToNewIpvJourney: false,
    });
    await request(app, (test) =>
      test
        .get(PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES + "?type=SMS")
        .expect(200)
    );
  });

  it("following a validation error it should not include link to change security codes where account recovery is not permitted", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_CODE).once().reply(400, {
      code: ERROR_CODES.INVALID_MFA_CODE,
      success: false,
    });

    await setupStubbedApp();
    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
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
            "change how you get security codes."
          );
        })
        .expect(400)
    );
  });

  it("should return error when csrf not present", async () => {
    await setupStubbedApp();
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
    await setupStubbedApp();
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
    await setupStubbedApp();
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
    await setupStubbedApp();
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
    await setupStubbedApp();
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
    await setupStubbedApp();
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
    await setupStubbedApp();
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
    await setupStubbedApp();
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
    await setupStubbedApp();
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
    await setupStubbedApp();
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
    await setupStubbedApp();
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
