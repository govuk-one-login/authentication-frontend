import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import request from "supertest";
import { PATH_NAMES } from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";

describe("Integration:: account deleted", () => {
  let app: any;

  before(async () => {
    process.env.SUPPORT_SELF_SERVE_ACCOUNT_DELETION = "1";
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
              journey: getPermittedJourneyForPath(PATH_NAMES.ACCOUNT_DELETED),
            };

            next();
          }),
        },
      }
    );

    app = await createApp();
  });

  after(() => {
    sinon.restore();
    app = undefined;
    delete process.env.SUPPORT_SELF_SERVE_ACCOUNT_DELETION;
  });

  it("should return the account deleted page", async () => {
    await request(app)
      .get(PATH_NAMES.ACCOUNT_DELETED)
      .expect(200)
      .expect((res) => {
        expect(res.text).to.contain("You’ve deleted your GOV.UK One Login");
      });
  });
});
