import { PATH_NAMES } from "../../../app.constants";
import { describe } from "mocha";
import { request, sinon } from "../../../../test/utils/test-utils";
import express, { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper";
import decache from "decache";
import { IdentityProcessingStatus } from "../types";

describe("Integration: prove identity callback", () => {
  let app: express.Application;

  describe("permission to visit /ipv-callback", () => {
    it(`should allow visit to /ipv-callback when was on /auth-code`, async () => {
      // arrange
      const redirectPath = "https://test.example.com";
      app = await stubMiddlewareAndCreateApp(
        PATH_NAMES.AUTH_CODE,
        redirectPath
      );

      // act
      await request(app, (test) =>
        test
          .get(PATH_NAMES.PROVE_IDENTITY_CALLBACK)
          // assert
          .expect(302)
          .expect("Location", redirectPath)
      );
    });

    it("should redirect when not on permitted journey to /ipv-callback", async () => {
      // arrange
      const startingPage = PATH_NAMES.ROOT;
      app = await stubMiddlewareAndCreateApp(startingPage);

      // act
      await request(app, (test) =>
        test
          .get(PATH_NAMES.PROVE_IDENTITY_CALLBACK)
          // assert
          .expect(302)
          .expect("Location", startingPage)
      );
    });
  });
});

const stubMiddlewareAndCreateApp = async (
  previousPath: string,
  redirectPath?: string
) => {
  decache("../../../app");

  decache("../../../middleware/session-middleware");
  const sessionMiddleware = require("../../../middleware/session-middleware");
  sinon
    .stub(sessionMiddleware, "validateSessionMiddleware")
    .callsFake(function (
      req: Request,
      res: Response,
      next: NextFunction
    ): void {
      res.locals.sessionId = "testSessionId";
      res.locals.clientSessionId = "testClientSessionId";
      res.locals.persistentSessionId = "testPersistentSessionId";

      req.session.client = {
        name: "testClientName",
      };
      req.session.user = {
        email: "test@test.com",
        journey: getPermittedJourneyForPath(previousPath),
      };

      next();
    });

  if (redirectPath) {
    decache("../prove-identity-callback-service");
    const proveIdentityCallbackServiceFile = require("../prove-identity-callback-service");
    sinon
      .stub(proveIdentityCallbackServiceFile, "proveIdentityCallbackService")
      .returns({
        processIdentity: sinon.fake.resolves({
          data: { status: IdentityProcessingStatus.COMPLETED },
        }),
        generateSuccessfulRpReturnUrl: sinon.fake.resolves(redirectPath),
      });
  }

  return await require("../../../app").createApp();
};
