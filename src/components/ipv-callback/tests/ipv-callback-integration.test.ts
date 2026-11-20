import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import type {MFA_METHOD_TYPE} from "../../../app.constants.js";
import {
  API_ENDPOINTS,
  PATH_NAMES,
} from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import type express from "express";
import nock from "nock";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import esmock from "esmock";
import request from "supertest";

const TEST_CONTACT_US_LINK_URL = "https://example.com/contact-us";

describe("Integration:: ipv callback", () => {
  let app: express.Application;
  let baseApi: string;

  describe("ipv callback", () => {
    before(async () => {
      baseApi = process.env.FRONTEND_API_BASE_URL;
      app = await stubMiddlewareAndCreateApp(PATH_NAMES.IPV_CALLBACK);
    });

    after(() => {
      app = undefined;
      nock.cleanAll();
      sinon.restore();
      delete process.env.SUPPORT_SELF_SERVE_ACCOUNT_DELETION;
    });

    it("should redirect to GET_SECURITY_CODES when the reverification result is successful", async () => {
      nock(baseApi)
        .post(API_ENDPOINTS.REVERIFICATION_RESULT)
        .once()
        .reply(200, { success: true });

      const requestPath = PATH_NAMES.IPV_CALLBACK + "?code=12345&state=abcde";

      await request(app)
        .get(requestPath)
        .expect(302)
        .expect("Location", PATH_NAMES.GET_SECURITY_CODES);
    });

    it("should redirect to CANNOT_CHANGE_SECURITY_CODES when the reverification result is successful", async () => {
      nock(baseApi)
        .post(API_ENDPOINTS.REVERIFICATION_RESULT)
        .once()
        .reply(200, { success: false, failure_code: "no_identity_available" });

      const requestPath = PATH_NAMES.IPV_CALLBACK + "?code=12345&state=abcde";

      await request(app)
        .get(requestPath)
        .expect(302)
        .expect("Location", PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES);
    });

    it("should redirect to CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY when no identity is available and self-serve account deletion is supported", async () => {
      process.env.SUPPORT_SELF_SERVE_ACCOUNT_DELETION = "1";
      nock(baseApi)
        .post(API_ENDPOINTS.REVERIFICATION_RESULT)
        .once()
        .reply(200, { success: false, failure_code: "no_identity_available" });

      const requestPath = PATH_NAMES.IPV_CALLBACK + "?code=12345&state=abcde";

      await request(app)
        .get(requestPath)
        .expect(302)
        .expect(
          "Location",
          PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_NO_IDENTITY
        );
    });
  });
});

const stubMiddlewareAndCreateApp = async (
  nextPath: string,
  mfaMethodType?: MFA_METHOD_TYPE,
  needsForcedMFAReset?: boolean
): Promise<express.Application> => {
  const { createApp } = await esmock(
    "../../../app.js",
    {},
    {
      "../../../config.js": {
        getSessionSecret: () => "test-session-secret",
      },
      "../../../middleware/session-middleware.js": {
        validateSessionMiddleware: sinon.fake(function (
          req: Request,
          res: Response,
          next: NextFunction
        ): void {
          res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

          req.session.user = {
            email: "test@test.com",
            mfaMethods: buildMfaMethods({ phoneNumber: "7867" }),
            journey: getPermittedJourneyForPath(nextPath),
            mfaMethodType: mfaMethodType,
            needsForcedMFAReset: needsForcedMFAReset,
            isMfaRequired: true,
          };

          next();
        }),
      },
      "../../../middleware/outbound-contact-us-links-middleware.js": {
        outboundContactUsLinksMiddleware: sinon.fake(function (
          req: Request,
          res: Response,
          next: NextFunction
        ): void {
          res.locals.contactUsLinkUrl = TEST_CONTACT_US_LINK_URL;

          next();
        }),
      },
    }
  );

  return await createApp();
};
