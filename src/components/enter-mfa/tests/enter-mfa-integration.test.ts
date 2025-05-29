import { describe } from "mocha";
import { expect, request, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import * as cheerio from "cheerio";
import type { AxiosResponse } from "axios";
import { API_ENDPOINTS, HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants.js";
import { ERROR_CODES, SecurityCodeErrorType } from "../../common/constants.js";
import type {
  AccountRecoveryInterface,
  AccountRecoveryResponse,
} from "../../common/account-recovery/types.js";
import { createApiResponse } from "../../../utils/http.js";
import type { Request, Response, NextFunction } from "express";
import type { SendNotificationServiceInterface } from "../../common/send-notification/types.js";
import type { DefaultApiResponse } from "../../../types.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";

describe("Integration:: enter mfa", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;
  const DEFAULT_PHONE_NUMBER = "7867";
  const BACKUP_PHONE_NUMBER = "1234";
  const DEFAULT_PHONE_NUMBER_ID = "test-id";
  const BACKUP_PHONE_NUMBER_ID = "test-id-backup";

  async function setupStubbedApp(
    partialMfaMethods: { redactedPhoneNumber?: string; id: string }[] = [
      { id: DEFAULT_PHONE_NUMBER_ID, redactedPhoneNumber: DEFAULT_PHONE_NUMBER },
    ],
    isAccountRecoveryPermitted: boolean = true
  ) {
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
              email: "test@test.com",
              mfaMethods: buildMfaMethods(partialMfaMethods),
              activeMfaMethodId: DEFAULT_PHONE_NUMBER_ID,
              journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_MFA),
            };
            next();
          }),
        },
        "../../common/account-recovery/account-recovery-service.js": {
          accountRecoveryService: sinon.fake((): AccountRecoveryInterface => {
            async function accountRecovery() {
              const fakeAxiosResponse: AxiosResponse = {
                data: { accountRecoveryPermitted: isAccountRecoveryPermitted },
                status: HTTP_STATUS_CODES.OK,
              } as AxiosResponse;

              return createApiResponse<AccountRecoveryResponse>(fakeAxiosResponse);
            }

            return { accountRecovery };
          }),
        },
        "../../common/send-notification/send-notification-service.js": {
          sendNotificationService: sinon.fake((): SendNotificationServiceInterface => {
            async function sendNotification() {
              const fakeAxiosResponse: AxiosResponse = {
                data: "test",
                status: HTTP_STATUS_CODES.OK,
              } as AxiosResponse;

              return createApiResponse<DefaultApiResponse>(fakeAxiosResponse);
            }

            return { sendNotification };
          }),
        },
      }
    );

    app = await createApp();
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
    sinon.restore();
    app = undefined;
  });

  it("should return check your phone page with sign in analytics properties", async () => {
    await setupStubbedApp();
    await request(app, (test) => test.get(PATH_NAMES.ENTER_MFA).expect(200));
  });

  [
    {
      partialMfaMethods: [
        { redactedPhoneNumber: DEFAULT_PHONE_NUMBER, id: DEFAULT_PHONE_NUMBER_ID },
      ],
      isAccountRecoveryPermitted: false,
      expectedLink: undefined,
    },
    {
      partialMfaMethods: [
        { redactedPhoneNumber: DEFAULT_PHONE_NUMBER, id: DEFAULT_PHONE_NUMBER_ID },
      ],
      isAccountRecoveryPermitted: true,
      expectedLink: {
        href: PATH_NAMES.MFA_RESET_WITH_IPV,
        text: "check if you can change how you get security codes",
      },
    },
    {
      partialMfaMethods: [
        { redactedPhoneNumber: DEFAULT_PHONE_NUMBER, id: DEFAULT_PHONE_NUMBER_ID },
        { authApp: BACKUP_PHONE_NUMBER, id: BACKUP_PHONE_NUMBER_ID },
      ],
      isAccountRecoveryPermitted: true,
      expectedLink: {
        href: PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES,
        text: "try another way to get a security code",
      },
    },
  ].forEach(({ partialMfaMethods, isAccountRecoveryPermitted, expectedLink }) =>
    it(`should include the correct link to change mfa methods when the user has ${partialMfaMethods.length} mfaMethods`, async () => {
      await setupStubbedApp(partialMfaMethods, isAccountRecoveryPermitted);
      await request(app, (test) =>
        test
          .get(PATH_NAMES.ENTER_MFA)
          .expect(200)
          .expect(function (res) {
            const $ = cheerio.load(res.text);

            if (expectedLink) {
              expect(
                $("a")
                  .toArray()
                  .some(
                    (link) =>
                      $(link).attr("href") === expectedLink.href &&
                      $(link).text().trim() === expectedLink.text
                  )
              ).to.be.true;
            } else {
              expect(
                $("a")
                  .toArray()
                  .some(
                    (link) =>
                      $(link).attr("href") === PATH_NAMES.MFA_RESET_WITH_IPV ||
                      $(link).attr("href") === PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES
                  )
              ).to.be.false;
            }
          })
      );
    })
  );

  it("following a validation error it should not include link to change security codes where account recovery is not permitted", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_CODE)
      .once()
      .reply(400, { code: ERROR_CODES.INVALID_MFA_CODE, success: false });

    await setupStubbedApp();
    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123456",
          phoneNumber: DEFAULT_PHONE_NUMBER,
          accountRecoveryPermitted: false,
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("body").text()).to.not.contains("change how you get security codes.");
        })
        .expect(400)
    );
  });

  it("should return error when csrf not present", async () => {
    await setupStubbedApp();
    await request(app, (test) =>
      test.post(PATH_NAMES.ENTER_MFA).type("form").send({ code: "123456" }).expect(403)
    );
  });

  it("should return validation error when code not entered", async () => {
    await setupStubbedApp();
    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({ _csrf: token, code: "", phoneNumber: DEFAULT_PHONE_NUMBER })
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
        .send({ _csrf: token, code: "2", phoneNumber: DEFAULT_PHONE_NUMBER })
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
        .send({ _csrf: token, code: "1234567", phoneNumber: DEFAULT_PHONE_NUMBER })
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
        .send({ _csrf: token, code: "12ert-", phoneNumber: DEFAULT_PHONE_NUMBER })
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
        .send({ _csrf: token, code: "123456", phoneNumber: DEFAULT_PHONE_NUMBER })
        .expect("Location", PATH_NAMES.AUTH_CODE)
        .expect(302)
    );
  });

  it("should return validation error when incorrect code entered", async () => {
    await setupStubbedApp();
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_CODE)
      .once()
      .reply(400, { code: ERROR_CODES.INVALID_MFA_CODE, success: false });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({ _csrf: token, code: "123455", phoneNumber: DEFAULT_PHONE_NUMBER })
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
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_CODE)
      .times(6)
      .reply(400, { code: ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES, success: false });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({ _csrf: token, code: "123455" })
        .expect(
          "Location",
          `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=${SecurityCodeErrorType.MfaMaxRetries}`
        )
        .expect(302)
    );
  });

  it("should redirect to security code requests blocked when exceeded request limit", async () => {
    await setupStubbedApp();
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_CODE)
      .times(1)
      .reply(400, { code: ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED, success: false });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({ _csrf: token, code: "123455" })
        .expect(
          "Location",
          `${PATH_NAMES.SECURITY_CODE_WAIT}?actionType=${SecurityCodeErrorType.MfaBlocked}`
        )
        .expect(302)
    );
  });

  it("should redirect to security code requested too many times when exceed request limit", async () => {
    await setupStubbedApp();
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_CODE)
      .times(6)
      .reply(400, { code: ERROR_CODES.MFA_SMS_MAX_CODES_SENT, success: false });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({ _csrf: token, code: "123455" })
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
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_CODE)
      .times(6)
      .reply(400, { code: ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES, success: false });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({ _csrf: token, code: "123455" })
        .expect(
          "Location",
          `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=${SecurityCodeErrorType.MfaMaxRetries}`
        )
        .expect(302)
    );
  });
});
