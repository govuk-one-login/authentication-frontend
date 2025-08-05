import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import request from "supertest";
import * as cheerio from "cheerio";
import type { AxiosResponse } from "axios";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import { ERROR_CODES, SecurityCodeErrorType } from "../../common/constants.js";
import type {
  AccountRecoveryInterface,
  AccountRecoveryResponse,
} from "../../common/account-recovery/types.js";
import { createApiResponse } from "../../../utils/http.js";
import type { NextFunction, Request, Response } from "express";
import type { SendNotificationServiceInterface } from "../../common/send-notification/types.js";
import type { DefaultApiResponse } from "../../../types.js";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";
import type { PartialMfaMethod } from "../../../../test/helpers/mfa-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";

describe("Integration:: enter authenticator app code", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  async function setupStubbedApp(
    partialMfaMethods: PartialMfaMethod[] = [
      {
        authApp: true,
      },
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
            res.locals = {
              ...res.locals,
              sessionId: "tDy103saszhcxbQq0-mjdzU854",
              clientSessionId: "test-client-session-id",
              persistentSessionId: "test-persistent-session-id",
            };

            req.session.user = {
              email: "test@test.com",
              mfaMethods: buildMfaMethods(partialMfaMethods),
              journey: getPermittedJourneyForPath(
                PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE
              ),
            };

            if (process.env.TEST_SETUP_REAUTH_SESSION === "1") {
              req.session.user.reauthenticate = "reauth";
            }
            next();
          }),
        },
        "../../common/account-recovery/account-recovery-service.js": {
          accountRecoveryService: sinon.fake((): AccountRecoveryInterface => {
            async function accountRecovery() {
              const fakeAxiosResponse: AxiosResponse = {
                data: {
                  accountRecoveryPermitted: isAccountRecoveryPermitted,
                },
                status: HTTP_STATUS_CODES.OK,
              } as AxiosResponse;

              return createApiResponse<AccountRecoveryResponse>(
                fakeAxiosResponse
              );
            }

            return { accountRecovery };
          }),
        },
        "../../common/send-notification/send-notification-service.js": {
          sendNotificationService: sinon.fake(
            (): SendNotificationServiceInterface => {
              async function sendNotification() {
                const fakeAxiosResponse: AxiosResponse = {
                  data: "test",
                  status: HTTP_STATUS_CODES.OK,
                } as AxiosResponse;

                return createApiResponse<DefaultApiResponse>(fakeAxiosResponse);
              }

              return { sendNotification };
            }
          ),
        },
      }
    );

    app = await createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL || "";

    await request(app)
      .get(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .then((res) => {
        const $ = cheerio.load(res.text);
        token = $("[name=_csrf]").val();
        cookies = res.headers["set-cookie"];
      });
  }

  beforeEach(() => {
    process.env.SUPPORT_REAUTHENTICATION = "0";
    process.env.TEST_SETUP_REAUTH_SESSION = "0";
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return enter authenticator app security code with sign in analytics properties", async () => {
    await setupStubbedApp();
    await request(app).get(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE).expect(200);
  });

  [
    {
      partialMfaMethods: [
        {
          authApp: true,
        },
      ],
      isAccountRecoveryPermitted: false,
      expectedLink: undefined,
    },
    {
      partialMfaMethods: [
        {
          authApp: true,
        },
      ],
      isAccountRecoveryPermitted: true,
      expectedLink: {
        href: PATH_NAMES.MFA_RESET_WITH_IPV,
        text: "check if you can change how you get security codes",
      },
    },
    {
      partialMfaMethods: [
        {
          authApp: true,
        },
        {
          redactedPhoneNumber: "1234",
        },
      ],
      isAccountRecoveryPermitted: true,
      expectedLink: {
        href: PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES,
        text: "try another way to get a security code",
      },
    },
  ].forEach(({ partialMfaMethods, isAccountRecoveryPermitted, expectedLink }) =>
    it(`should include the correct link to change/reset mfa methods when the user has ${partialMfaMethods.length} mfaMethods`, async () => {
      await setupStubbedApp(partialMfaMethods, isAccountRecoveryPermitted);
      await request(app)
        .get(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
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
                    $(link).attr("href") ===
                      PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES
                )
            ).to.be.false;
          }
        });
    })
  );

  it("should return enter authenticator app security code with reauth analytics properties", async () => {
    await setupStubbedApp();
    process.env.SUPPORT_REAUTHENTICATION = "1";
    process.env.TEST_SETUP_REAUTH_SESSION = "1";

    await request(app).get(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE).expect(200);
  });

  it("should return error when csrf not present", async () => {
    await setupStubbedApp();
    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .send({
        code: "123456",
      })
      .expect(403);
  });

  it("should return validation error when code not entered", async () => {
    await setupStubbedApp();
    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
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
      .expect(400);
  });

  it("should return validation error when code is less than 6 characters", async () => {
    await setupStubbedApp();
    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
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
      .expect(400);
  });

  it("should return validation error when code is greater than 6 characters", async () => {
    await setupStubbedApp();
    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
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
      .expect(400);
  });

  it("should return validation error when code entered contains letters", async () => {
    await setupStubbedApp();
    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
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
      .expect(400);
  });

  it("following a validation error it should not include link to change security codes where account recovery is not permitted", async () => {
    await setupStubbedApp();
    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "12ert-",
        isAccountRecoveryPermitted: false,
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("body").text()).to.not.contains(
          "You can securely change how you get security codes"
        );
      })
      .expect(400);
  });

  it("should redirect to /auth-code when valid code entered", async () => {
    await setupStubbedApp();
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_MFA_CODE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123456",
      })
      .expect("Location", PATH_NAMES.AUTH_CODE)
      .expect(302);
  });

  it("should return validation error when incorrect code entered", async () => {
    await setupStubbedApp();
    nock(baseApi).post(API_ENDPOINTS.VERIFY_MFA_CODE).once().reply(400, {
      code: ERROR_CODES.AUTH_APP_INVALID_CODE,
      success: false,
    });

    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123455",
      })
      .expect(function (res) {
        const $ = cheerio.load(res.text);
        expect($("#code-error").text()).to.contains(
          "The code you entered is not correct, check your authenticator app and try again"
        );
      })
      .expect(400);
  });

  it("should redirect to security code expired when incorrect code has been entered 5 times", async () => {
    await setupStubbedApp();
    nock(baseApi).post(API_ENDPOINTS.VERIFY_MFA_CODE).times(6).reply(400, {
      code: ERROR_CODES.AUTH_APP_INVALID_CODE_MAX_ATTEMPTS_REACHED,
      success: false,
    });

    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        code: "123455",
      })
      .expect(
        "Location",
        `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=${SecurityCodeErrorType.AuthAppMfaMaxRetries}`
      )
      .expect(302);
  });
});
