import { describe } from "mocha";
import { expect, request, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import { PATH_NAMES } from "../../../app.constants.js";
import esmock from "esmock";
import type { NextFunction, Request, Response } from "express";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import * as cheerio from "cheerio";

describe("Integration::how do you want security codes", () => {
  let app: any;
  const DEFAULT_PHONE_NUMBER = "7867";
  const DEFAULT_PHONE_NUMBER_ID = "532b14c2-a11d-4882-a83b-e8d7184e0b70";
  const BACKUP_PHONE_NUMBER = "1234";
  const BACKUP_PHONE_NUMBER_ID = "6ae3be91-708f-45b2-9374-6a595eb76bce";

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
              email: "test@test.com",
              mfaMethods: buildMfaMethods([
                {
                  id: DEFAULT_PHONE_NUMBER_ID,
                  redactedPhoneNumber: DEFAULT_PHONE_NUMBER,
                },
                {
                  id: BACKUP_PHONE_NUMBER_ID,
                  redactedPhoneNumber: BACKUP_PHONE_NUMBER,
                },
              ]),
              journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_MFA),
              isAccountRecoveryPermitted: true,
            };
            next();
          }),
        },
      }
    );

    app = await createApp();
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return how do you want security codes page as expected", async () => {
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

          const radioArray = form.first().find("input[type=radio]").toArray();
          expect(radioArray.length).to.be.eq(2);
          expect($(radioArray[0]).val() === DEFAULT_PHONE_NUMBER_ID).to.be.eq(
            true,
            `radio input presence for ${DEFAULT_PHONE_NUMBER}`
          );
          expect($(radioArray[1]).val() === BACKUP_PHONE_NUMBER_ID).to.be.eq(
            true,
            `radio input presence for ${BACKUP_PHONE_NUMBER}`
          );
        })
    );
  });
});
