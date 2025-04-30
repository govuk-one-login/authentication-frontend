import { describe } from "mocha";
import { request, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import { PATH_NAMES } from "../../../app.constants.js";
import esmock from "esmock";
import type { NextFunction, Request, Response } from "express";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";

describe("Integration::how do you want security codes", () => {
  let app: any;
  const DEFAULT_PHONE_NUMBER = "7867";
  const BACKUP_PHONE_NUMBER = "1234";

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
                  redactedPhoneNumber: DEFAULT_PHONE_NUMBER,
                },
                {
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

  it("should return how do you want security codes page", (done) => {
    request(app, (test) =>
      test.get(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES).expect(200, done)
    );
  });
});
