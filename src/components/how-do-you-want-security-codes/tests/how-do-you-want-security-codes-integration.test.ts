import { describe } from "mocha";
import { expect, request, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import { PATH_NAMES } from "../../../app.constants.js";
import esmock from "esmock";
import type { NextFunction, Request, Response } from "express";
import type { PartialMfaMethod } from "../../../../test/helpers/mfa-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import * as cheerio from "cheerio";

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

describe("Integration::how do you want security codes", () => {
  const DEFAULT_REDACTED_PHONE_NUMBER = "7867";
  const DEFAULT_PHONE_NUMBER_ID = "532b14c2-a11d-4882-a83b-e8d7184e0b70";
  const BACKUP_REDACTED_PHONE_NUMBER = "1234";
  const BACKUP_PHONE_NUMBER_ID = "6ae3be91-708f-45b2-9374-6a595eb76bce";

  const getMockedApp = async (
    mfaMethods: PartialMfaMethod[] = [
      {
        id: DEFAULT_PHONE_NUMBER_ID,
        redactedPhoneNumber: DEFAULT_REDACTED_PHONE_NUMBER,
      },
      {
        id: BACKUP_PHONE_NUMBER_ID,
        redactedPhoneNumber: BACKUP_REDACTED_PHONE_NUMBER,
      },
    ]
  ) => {
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
              mfaMethods: buildMfaMethods(mfaMethods),
              journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_MFA),
              isAccountRecoveryPermitted: true,
            };
            next();
          }),
        },
      }
    );

    return await createApp();
  };

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
  });

  it("should return how do you want security codes page as expected", async () => {
    const app = await getMockedApp();

    await request(app, (test) =>
      test
        .get(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES)
        .expect(200)
        .expect(function (res) {
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
          expect(form.toArray().some(Boolean)).to.be.eq(true, "form presence");
          expect(
            form
              .first()
              .find("button[type=Submit]")
              .toArray()
              .some((link) => $(link).text().trim() === "Continue")
          ).to.be.eq(true, "submit button presence");
        })
    );
  });

  describe("radio buttons", () => {
    [
      {
        mfaBackup: {
          id: "sms-backup",
          redactedPhoneNumber: BACKUP_REDACTED_PHONE_NUMBER,
        },
        mfaDefault: {
          id: "sms-default",
          redactedPhoneNumber: DEFAULT_REDACTED_PHONE_NUMBER,
        },
      },
      {
        mfaBackup: {
          id: "sms-backup",
          redactedPhoneNumber: BACKUP_REDACTED_PHONE_NUMBER,
        },
        mfaDefault: {
          id: "auth_app-default",
          authApp: true,
        },
      },
      {
        mfaBackup: {
          id: "auth_app-backup",
          authApp: true,
        },
        mfaDefault: {
          id: "sms-default",
          redactedPhoneNumber: DEFAULT_REDACTED_PHONE_NUMBER,
        },
      },
    ].forEach(({ mfaBackup, mfaDefault }) => {
      it(`should in order display BACKUP ${mfaBackup.id} and DEFAULT ${mfaDefault.id}`, async () => {
        const app = await getMockedApp([mfaDefault, mfaBackup]);

        await request(app, (test) =>
          test
            .get(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES)
            .expect(200)
            .expect(function (res) {
              const $ = cheerio.load(res.text);
              const form = $(`form[action="/how-do-you-want-security-codes"]`);

              const radioArray = form
                .first()
                .find("input[type=radio]")
                .toArray();
              expect(radioArray.length).to.be.eq(2);
              expect($(radioArray[0]).val() === mfaBackup.id).to.be.eq(
                true,
                `radio input presence for ${mfaBackup.id} in correct order`
              );
              expect($(radioArray[1]).val() === mfaDefault.id).to.be.eq(
                true,
                `radio input presence for ${mfaDefault.id} in correct order`
              );
            })
        );
      });
    });
  });

  it("returns a validation error when no option is selected", async () => {
    const app = await getMockedApp();
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
});
