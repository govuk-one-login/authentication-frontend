import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  PATH_NAMES,
} from "../../../app.constants.js";
import esmock from "esmock";
import type { NextFunction, Request, Response } from "express";
import type express from "express";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import * as cheerio from "cheerio";
import { MfaMethodPriority } from "../../../types.js";
import type { MfaMethod } from "../../../types.js";
import nock from "nock";
import request from "supertest";

const getTokenAndCookies = async (app: express.Application) => {
  let cookies, token;
  await request(app)
    .get(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES)
    .then((res) => {
      const $ = cheerio.load(res.text);
      token = $("[name=_csrf]").val();
      cookies = res.headers["set-cookie"];
    });
  return { token, cookies };
};

const mockSessionMiddleware = (
  mfaMethods: MfaMethod[],
  mfaMethodId: string,
  isPasswordResetJourney: boolean
) =>
  sinon.fake(function (req: Request, res: Response, next: NextFunction) {
    res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
    req.session.user = {
      email: "test@test.com",
      mfaMethods: mfaMethods,
      activeMfaMethodId: mfaMethodId,
      journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_MFA),
      isAccountRecoveryPermitted: true,
      isPasswordResetJourney,
    };
    next();
  });

describe("Integration::how do you want security codes", () => {
  let app: any;
  let baseApi: string;
  const DEFAULT_PHONE_NUMBER = "7867";
  const DEFAULT_PHONE_NUMBER_ID = "default-sms-mfa-method-id";
  const BACKUP_PHONE_NUMBER = "1234";
  const BACKUP_PHONE_NUMBER_ID = "backup-sms-mfa-method-id";
  const DEFAULT_AUTH_APP_ID = "default-auth-app-mfa-method-id";
  const BACKUP_AUTH_APP_ID = "backup-auth-app-mfa-method-id";

  before(() => {
    baseApi = process.env.FRONTEND_API_BASE_URL;
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  describe("GET /how-do-you-want-security-codes", () => {
    const testCases = [
      {
        description: "SMS user with SMS backup",
        mfaMethods: [
          {
            id: DEFAULT_PHONE_NUMBER_ID,
            redactedPhoneNumber: DEFAULT_PHONE_NUMBER,
          },
          {
            id: BACKUP_PHONE_NUMBER_ID,
            redactedPhoneNumber: BACKUP_PHONE_NUMBER,
          },
        ],
        expectedRadioValues: [BACKUP_PHONE_NUMBER_ID, DEFAULT_PHONE_NUMBER_ID],
      },
      {
        description: "SMS user with AUTH APP backup",
        mfaMethods: [
          {
            id: DEFAULT_PHONE_NUMBER_ID,
            redactedPhoneNumber: DEFAULT_PHONE_NUMBER,
          },
          { id: BACKUP_AUTH_APP_ID, authApp: true },
        ],
        expectedRadioValues: [BACKUP_AUTH_APP_ID, DEFAULT_PHONE_NUMBER_ID],
      },
      {
        description: "AUTH APP user with SMS backup",
        mfaMethods: [
          {
            id: DEFAULT_AUTH_APP_ID,
            authApp: true,
          },
          {
            id: BACKUP_PHONE_NUMBER_ID,
            redactedPhoneNumber: BACKUP_PHONE_NUMBER,
          },
        ],
        expectedRadioValues: [BACKUP_PHONE_NUMBER_ID, DEFAULT_AUTH_APP_ID],
      },
    ];

    testCases.forEach(({ description, mfaMethods, expectedRadioValues }) => {
      it(`should return page as expected for ${description}`, async () => {
        const builtMfaMethods = buildMfaMethods(mfaMethods);
        const { createApp } = await esmock(
          "../../../app.js",
          {},
          {
            "../../../middleware/session-middleware.js": {
              validateSessionMiddleware: mockSessionMiddleware(
                builtMfaMethods,
                builtMfaMethods.find(
                  (mfaMethod) =>
                    mfaMethod.priority === MfaMethodPriority.DEFAULT
                ).id,
                false
              ),
            },
          }
        );

        app = await createApp();

        await request(app)
          .get(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES)
          .expect(200)
          .expect(function (res: any) {
            const $ = cheerio.load(res.text);
            expect(
              $("a")
                .toArray()
                .some(
                  (link) =>
                    $(link).attr("href") === PATH_NAMES.MFA_RESET_WITH_IPV &&
                    $(link).text().trim() ===
                      "check if you can change how you get security codes"
                )
            ).to.be.eq(true, "mfa reset link presence");

            const form = $(`form[action="/how-do-you-want-security-codes"]`);
            expect(form.toArray().some(Boolean)).to.be.eq(
              true,
              "form presence"
            );
            expect(
              form
                .first()
                .find("button[type=Submit]")
                .toArray()
                .some((link) => $(link).text().trim() === "Continue")
            ).to.be.eq(true, "submit button presence");

            const radioArray = form.first().find("input[type=radio]").toArray();
            expect(radioArray.length).to.be.eq(2);
            expectedRadioValues.forEach((name, index) => {
              expect($(radioArray[index]).val()).to.be.eq(
                name,
                `radio input presence for ${name} in correct order`
              );
            });
          });
      });
    });
  });

  describe("POST /how-do-you-want-security-codes", () => {
    it("returns a validation error when no option is selected", async () => {
      const app = await createDefaultSmsBackupAppExpressApp();
      const { token, cookies } = await getTokenAndCookies(app);

      await request(app)
        .post(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
        })
        .expect(function (res) {
          const $ = cheerio.load(res.text);
          expect($("#mfa-method-id-error").text()).to.contains(
            "Select how you want to get a security code"
          );
        })
        .expect(400);
    });

    [
      {
        selectedMfaMethodId: DEFAULT_PHONE_NUMBER_ID,
        isPasswordResetJourney: false,
        expectedPath: PATH_NAMES.ENTER_MFA,
      },
      {
        selectedMfaMethodId: BACKUP_AUTH_APP_ID,
        isPasswordResetJourney: false,
        expectedPath: PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
      },
      {
        selectedMfaMethodId: DEFAULT_PHONE_NUMBER_ID,
        isPasswordResetJourney: true,
        expectedPath: PATH_NAMES.RESET_PASSWORD_2FA_SMS,
      },
      {
        selectedMfaMethodId: BACKUP_AUTH_APP_ID,
        isPasswordResetJourney: true,
        expectedPath: PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP,
      },
    ].forEach(
      ({ selectedMfaMethodId, isPasswordResetJourney, expectedPath }) => {
        it(`redirects to ${expectedPath} when ${selectedMfaMethodId} is selected and isPasswordResetJourney is ${isPasswordResetJourney}`, async () => {
          const app = await createDefaultSmsBackupAppExpressApp(
            isPasswordResetJourney
          );
          const { token, cookies } = await getTokenAndCookies(app);

          if (selectedMfaMethodId === DEFAULT_PHONE_NUMBER_ID) {
            nock(baseApi)
              .post(API_ENDPOINTS.MFA)
              .once()
              .reply(HTTP_STATUS_CODES.NO_CONTENT);
          }

          await request(app)
            .post(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES)
            .type("form")
            .set("Cookie", cookies)
            .send({
              _csrf: token,
              "mfa-method-id": selectedMfaMethodId,
            })
            .expect("Location", expectedPath)
            .expect(302);
        });
      }
    );

    it("should render lockout page when MFA returns indefinite international SMS block error", async () => {
      app = await createDefaultSmsBackupAppExpressApp(
        false,
        BACKUP_AUTH_APP_ID
      );
      const { token, cookies } = await getTokenAndCookies(app);

      nock(baseApi).post(API_ENDPOINTS.MFA).once().reply(400, {
        code: 1092,
        message:
          "User is indefinitely blocked from sending SMS to international numbers",
      });

      const result = await request(app)
        .post(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          "mfa-method-id": DEFAULT_PHONE_NUMBER_ID,
        })
        .expect(200);

      const $ = cheerio.load(result.text);
      expect($("h1").text()).to.contains("Sorry, there is a problem");
      expect($("body").text()).to.contains("Try again later");
    });

    async function createDefaultSmsBackupAppExpressApp(
      isPasswordResetJourney: boolean = false,
      activeMfaMethodId: string = DEFAULT_PHONE_NUMBER_ID
    ): Promise<express.Application> {
      const { createApp } = await esmock(
        "../../../app.js",
        {},
        {
          "../../../middleware/session-middleware.js": {
            validateSessionMiddleware: mockSessionMiddleware(
              buildMfaMethods([
                {
                  id: DEFAULT_PHONE_NUMBER_ID,
                  redactedPhoneNumber: DEFAULT_PHONE_NUMBER,
                },
                {
                  id: BACKUP_AUTH_APP_ID,
                  authApp: true,
                },
              ]),
              activeMfaMethodId,
              isPasswordResetJourney
            ),
          },
        }
      );

      return await createApp();
    }
  });
});
