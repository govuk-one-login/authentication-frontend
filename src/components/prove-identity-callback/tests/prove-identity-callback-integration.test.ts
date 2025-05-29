import { PATH_NAMES } from "../../../app.constants.js";
import { describe } from "mocha";
import { request, sinon } from "../../../../test/utils/test-utils.js";
import type { NextFunction, Request, Response } from "express";
import type express from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { IdentityProcessingStatus } from "../types.js";
import esmock from "esmock";

describe("Integration: prove identity callback", () => {
  let app: express.Application;

  describe("permission to visit /ipv-callback", () => {
    it(`should allow visit to /ipv-callback when was on /auth-code`, async () => {
      // arrange
      const redirectPath = "https://test.example.com";
      app = await stubMiddlewareAndCreateApp(PATH_NAMES.AUTH_CODE, redirectPath);

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
        }),
      },
      ...(redirectPath
        ? {
            "../prove-identity-callback-service.js": {
              proveIdentityCallbackService: () => ({
                processIdentity: sinon.fake.resolves({
                  data: { status: IdentityProcessingStatus.COMPLETED },
                }),
                generateSuccessfulRpReturnUrl: sinon.fake.resolves(redirectPath),
              }),
            },
          }
        : {}),
    }
  );

  return await createApp();
};
