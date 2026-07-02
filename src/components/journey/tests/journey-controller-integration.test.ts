import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import request from "supertest";
import { PATH_NAMES } from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";
import type { UserSession } from "../../../types.js";

describe("Integration::journey controller", () => {
  let app: any;
  let capturedSession: UserSession;

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
            res.locals.sessionId = "test-session-id";
            res.locals.clientSessionId = "test-client-session-id";
            res.locals.persistentSessionId = "test-persistent-session-id";
            res.locals.supportPasskeyUsage = true;

            req.session.user = {
              email: "test@test.com",
              journey: getPermittedJourneyForPath(
                PATH_NAMES.SIGN_IN_WITH_PASSKEY
              ),
            };

            capturedSession = req.session.user;

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

  describe("success", () => {
    it("should redirect to /enter-password and update session when transitioning from /sign-in-passkey with SIGN_IN_WITHOUT_PASSKEY event", async () => {
      await request(app)
        .get("/journey/sign-in-passkey/SIGN_IN_WITHOUT_PASSKEY")
        .expect("Location", PATH_NAMES.ENTER_PASSWORD)
        .expect(302);

      expect(capturedSession.journey.nextPath).to.equal(
        PATH_NAMES.ENTER_PASSWORD
      );
      expect(capturedSession.journey.goBackHistory).to.deep.equal([
        PATH_NAMES.SIGN_IN_WITH_PASSKEY,
      ]);
    });
  });
});
