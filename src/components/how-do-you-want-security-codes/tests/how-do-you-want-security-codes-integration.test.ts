import { describe } from "mocha";
import { expect, request, sinon } from "../../../../test/utils/test-utils.js";
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

const getTokenAndCookies = async (app: express.Application) => {
  let cookies, token;
  await request(
    app,
    (test) => test.get(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES),
    {
      expectAnalyticsPropertiesMatchSnapshot: false,
    }
  ).then((res) => {
    const $ = cheerio.load(res.text);
    token = $("[name=_csrf]").val();
    cookies = res.headers["set-cookie"];
  });
  return { token, cookies };
};

const mockSessionMiddleware = (mfaMethods: MfaMethod[], mfaMethodId: string) =>
  sinon.fake(function (req: Request, res: Response, next: NextFunction) {
    res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
    req.session.user = {
      email: "test@test.com",
      mfaMethods: mfaMethods,
      activeMfaMethodId: mfaMethodId,
      journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_MFA),
      isAccountRecoveryPermitted: true,
    };
    next();
  });

describe("Integration::how do you want security codes", () => {
  let app: any;
  let baseApi: string;
  const DEFAULT_PHONE_NUMBER = "7867";
  const DEFAULT_PHONE_NUMBER_ID = "532b14c2-a11d-4882-a83b-e8d7184e0b70";
  const BACKUP_PHONE_NUMBER = "1234";
  const BACKUP_PHONE_NUMBER_ID = "6ae3be91-708f-45b2-9374-6a595eb76bce";
  const DEFAULT_AUTH_APP_ID = "9a51c939-3a39-4a30-b388-9543e0f87e3b";
  const BACKUP_AUTH_APP_ID = "8f40b828-2928-492f-a277-8432d9e76d2a";

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
                ).id
              ),
            },
          }
        );

        app = await createApp();

        await request(app, (test) =>
          test
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

              const radioArray = form
                .first()
                .find("input[type=radio]")
                .toArray();
              expect(radioArray.length).to.be.eq(2);
              expectedRadioValues.forEach((name, index) => {
                expect($(radioArray[index]).val()).to.be.eq(
                  name,
                  `radio input presence for ${name} in correct order`
                );
              });
            })
        );
      });
    });
  });

  describe("POST /how-do-you-want-security-codes", () => {
    it("returns a validation error when no option is selected", async () => {
      const app = await createDefaultSmsBackupAppExpressApp();
      const { token, cookies } = await getTokenAndCookies(app);

      await request(
        app,
        (test) => test.post(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES),
        {
          expectAnalyticsPropertiesMatchSnapshot: false,
        }
      )
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

    it("SMS/SMS user should redirect to enter mfa page", async () => {
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
                  id: BACKUP_PHONE_NUMBER_ID,
                  redactedPhoneNumber: BACKUP_PHONE_NUMBER,
                },
              ]),
              DEFAULT_PHONE_NUMBER_ID
            ),
          },
        }
      );

      app = await createApp();

      nock(baseApi)
        .post(API_ENDPOINTS.MFA)
        .once()
        .reply(HTTP_STATUS_CODES.NO_CONTENT);

      const { token, cookies } = await getTokenAndCookies(app);

      await request(
        app,
        (test) => test.post(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES),
        {
          expectAnalyticsPropertiesMatchSnapshot: false,
        }
      )
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          "mfa-method-id": BACKUP_PHONE_NUMBER_ID,
        })
        .expect(302);
    });

    it("redirects to the /enter-authenticator-app-code when 'authenticator app' is selected", async () => {
      const app = await createDefaultSmsBackupAppExpressApp();
      const { token, cookies } = await getTokenAndCookies(app);

      await request(
        app,
        (test) => test.post(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES),
        {
          expectAnalyticsPropertiesMatchSnapshot: false,
        }
      )
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
          "mfa-method-id": BACKUP_AUTH_APP_ID,
        })
        .expect("Location", PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
        .expect(302);
    });
  });

  async function createDefaultSmsBackupAppExpressApp(): Promise<express.Application> {
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
            DEFAULT_PHONE_NUMBER_ID
          ),
        },
      }
    );

    return await createApp();
  }
});
