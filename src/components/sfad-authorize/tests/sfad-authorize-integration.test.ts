import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants.js";
import nock from "nock";
import request from "supertest";
import type { NextFunction, Request, Response } from "express";
import esmock from "esmock";

const SFAD_REDIRECT_URL = "https://test-amc-url.com/authorize?state=test-state";

describe("SFAD authorize", () => {
  const REQUEST_PATH = PATH_NAMES.SFAD_AUTHORIZE;

  describe("SFAD authorize get", () => {
    beforeEach(() => {
      nock.cleanAll();
    });

    after(() => {
      sinon.restore();
    });

    it("should redirect to the SFAD URL when request is successful", async () => {
      const app = await setupAppWithSessionMiddleware(REQUEST_PATH);
      allowCallToSfadAuthorizeEndpointReturningRedirectUrl(SFAD_REDIRECT_URL);

      await request(app)
        .get(REQUEST_PATH)
        .expect(302)
        .expect("Location", SFAD_REDIRECT_URL);
    });

    function allowCallToSfadAuthorizeEndpointReturningRedirectUrl(url: string) {
      const baseApi = process.env.FRONTEND_API_BASE_URL;

      nock(baseApi).post(API_ENDPOINTS.AMC_AUTHORIZE).once().reply(200, {
        redirectUrl: url,
        code: 200,
        success: true,
      });
    }

    async function setupAppWithSessionMiddleware(nextPath: string) {
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
              if (req.path === REQUEST_PATH) {
                res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
                res.locals.clientSessionId = "client-session-id";
                res.locals.persistentSessionId = "persistent-session-id";

                req.session.user = {
                  email: "test@test.com",
                  journey: {
                    nextPath: nextPath,
                    optionalPaths: [],
                  },
                };
              }
              next();
            }),
          },
          "../../../config.js": {
            supportSFAD: () => true,
          },
        }
      );

      return await createApp();
    }
  });
});
