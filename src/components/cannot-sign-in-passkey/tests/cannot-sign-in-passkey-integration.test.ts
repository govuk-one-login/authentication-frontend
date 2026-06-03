import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import request from "supertest";
import { PATH_NAMES } from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";

describe("Integration:: cannot sign in passkey", () => {
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
            req.session.user = {
              journey: getPermittedJourneyForPath(
                PATH_NAMES.CANNOT_SIGN_IN_PASSKEY
              ),
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

  it("should return the cannot sign in passkey page", async () => {
    await request(app).get(PATH_NAMES.CANNOT_SIGN_IN_PASSKEY).expect(200);
  });
});
