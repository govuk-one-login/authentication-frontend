import request from "supertest";
import { describe } from "mocha";
import { PATH_NAMES } from "../../../app.constants.js";
import esmock from "esmock";
import { sinon } from "../../../../test/utils/test-utils.js";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import type { NextFunction, Request, Response } from "express";

describe("Integration::SignInOrCreate", () => {
  let app: any;

  before(async () => {
    const { createApp } = await esmock(
      "../../../app.js",
      {},
      {
        "../../../middleware/session-middleware.js": {
          validateSessionMiddleware: sinon.fake(function (
            req: Request,
            _res: Response,
            next: NextFunction
          ): void {
            req.session.user = {
              journey: getPermittedJourneyForPath(PATH_NAMES.SIGN_IN_OR_CREATE),
            };

            next();
          }),
        },
      }
    );

    app = await createApp();
  });

  after(() => {
    app = undefined;
  });

  it("should redirect to /enter-email-create if 'create a GOV.UK One Login' is clicked", async () => {
    await request(app)
      .get("/journey/sign-in-or-create/CREATE_NEW_ACCOUNT")
      .expect("Location", PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT)
      .expect(302);
  });
});
