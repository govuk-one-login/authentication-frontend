import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import request from "supertest";
import { PATH_NAMES } from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";

describe("Integration:: passkey created", () => {
  let app: any;

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
              journey: getPermittedJourneyForPath(PATH_NAMES.PASSKEY_CREATED),
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
  });

  it("should return passkey created page", async () => {
    await request(app).get(PATH_NAMES.PASSKEY_CREATED).expect(200);
  });
});
