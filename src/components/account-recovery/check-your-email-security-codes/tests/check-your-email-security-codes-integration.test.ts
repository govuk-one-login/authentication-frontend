import { describe } from "mocha";
import type { AxiosResponse } from "axios";
import {
  expect,
  sinon,
  request,
} from "../../../../../test/utils/test-utils.js";
import nock from "nock";
import * as cheerio from "cheerio";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../../app.constants.js";
import {
  ERROR_CODES,
  SecurityCodeErrorType,
} from "../../../common/constants.js";
import type { SendNotificationServiceInterface } from "../../../common/send-notification/types.js";
import type { DefaultApiResponse } from "../../../../types.js";
import { createApiResponse } from "../../../../utils/http.js";
import type {
  AccountInterventionsInterface,
  AccountInterventionStatus,
} from "../../../account-intervention/types.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../../test/helpers/session-helper.js";
import esmock from "esmock";

describe("Integration:: check your email security codes", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;

  before(async () => {
    const { createApp } = await esmock(
      "../../../../app.js",
      {},
      {
        "../../../../middleware/session-middleware.js": {
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
              isAccountRecoveryPermitted: true,
              journey: getPermittedJourneyForPath(
                PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES
              ),
            };

            next();
          }),
        },
        "../../../account-intervention/account-intervention-service.js": {
          accountInterventionService: sinon.fake(
            (): AccountInterventionsInterface => {
              async function accountInterventionStatus() {
                const fakeAxiosResponse: AxiosResponse = {
                  data: {
                    passwordResetRequired: false,
                    blocked: false,
                    temporarilySuspended: false,
                  },
                  status: HTTP_STATUS_CODES.OK,
                } as AxiosResponse;

                return createApiResponse<AccountInterventionStatus>(
                  fakeAxiosResponse
                );
              }

              return { accountInterventionStatus };
            }
          ),
        },
        "../../../common/send-notification/send-notification-service.js": {
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

    process.env.SUPPORT_ACCOUNT_RECOVERY = "1";

    app = await createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL || "";

    await request(
      app,
      (test) => test.get(PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES),
      { expectAnalyticsPropertiesMatchSnapshot: false }
    ).then((res) => {
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

  it("should return verify email page", async () => {
    await request(app, (test) =>
      test.get(PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES).expect(200)
    );
  });

  it("should return error when csrf not present", async () => {
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES)
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
        .post(PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES)
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
        .post(PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES)
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
        .post(PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES)
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
    process.env.SUPPORT_ACCOUNT_RECOVERY = "1";
    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES)
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

  it("should redirect to /get-security-codes when valid code entered", async () => {
    process.env.SUPPORT_ACCOUNT_RECOVERY = "1";
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_CODE)
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123456",
        })
        .expect("Location", PATH_NAMES.GET_SECURITY_CODES)
        .expect(302)
    );
  });

  it("should return validation error when incorrect code entered", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_CODE).once().reply(400, {
      code: ERROR_CODES.INVALID_VERIFY_EMAIL_CODE,
      success: false,
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES)
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

  it("should return error page when when incorrect code entered more than 5 times", async () => {
    nock(baseApi).post(API_ENDPOINTS.VERIFY_CODE).times(6).reply(400, {
      code: ERROR_CODES.ENTERED_INVALID_VERIFY_EMAIL_CODE_MAX_TIMES,
      success: false,
    });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          code: "123455",
        })
        .expect(
          "Location",
          `${PATH_NAMES.SECURITY_CODE_INVALID}?actionType=${SecurityCodeErrorType.EmailMaxRetries}`
        )
        .expect(302)
    );
  });
});
