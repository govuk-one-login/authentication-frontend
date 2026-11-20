import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import {
  AMC_JOURNEY_TYPES,
  API_ENDPOINTS,
  PATH_NAMES,
} from "../../../app.constants.js";
import nock from "nock";
import request from "supertest";
import type { NextFunction, Request, Response } from "express";
import esmock from "esmock";
import {
  noInterventions,
  setupAccountInterventionsResponse,
} from "../../../../test/helpers/account-interventions-helpers.js";

const SSAD_REDIRECT_URL = "https://test-amc-url.com/authorize?state=test-state";

describe("SSAD authorize", () => {
  const REQUEST_PATH = PATH_NAMES.SSAD_AUTHORIZE;
  const baseApi = process.env.FRONTEND_API_BASE_URL;

  describe("SSAD authorize get", () => {
    beforeEach(() => {
      nock.cleanAll();
    });

    after(() => {
      sinon.restore();
    });

    it("should redirect to the SSAD URL when request is successful", async () => {
      const app = await setupAppWithSessionMiddleware(REQUEST_PATH);
      setupAccountInterventionsResponse(baseApi, noInterventions);
      allowCallToSsadAuthorizeEndpointReturningRedirectUrl(SSAD_REDIRECT_URL);

      await request(app)
        .get(REQUEST_PATH)
        .expect(302)
        .expect("Location", SSAD_REDIRECT_URL);
    });

    it("should redirect to /cannot-change-security-codes-no-identity-delete when the user has a reset password intervention", async () => {
      const app = await setupAppWithSessionMiddleware(REQUEST_PATH);
      const resetPasswordInterventionResponse = {
        blocked: false,
        passwordResetRequired: true,
        temporarilySuspended: false,
        reproveIdentity: false,
      };
      setupAccountInterventionsResponse(
        baseApi,
        resetPasswordInterventionResponse
      );
      allowCallToSsadAuthorizeEndpointReturningRedirectUrl(SSAD_REDIRECT_URL);

      await request(app)
        .get(REQUEST_PATH)
        .expect(302)
        .expect("Location", PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY_DELETE);
    })

    function allowCallToSsadAuthorizeEndpointReturningRedirectUrl(url: string) {
      nock(baseApi)
        .post(API_ENDPOINTS.AMC_AUTHORIZE, {
          journeyType: AMC_JOURNEY_TYPES.SELF_SERVE_ACCOUNT_DELETION,
        })
        .once()
        .reply(200, {
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
            supportSelfServeAccountDeletion: () => true,
          },
        }
      );

      return await createApp();
    }
  });
});
