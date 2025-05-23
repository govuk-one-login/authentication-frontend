import { describe } from "mocha";
import { request, sinon } from "../../../../test/utils/test-utils.js";
import { API_ENDPOINTS, CHANNEL, PATH_NAMES } from "../../../app.constants.js";
import nock from "nock";
import type { NextFunction, Request, Response } from "express";
import supertest from "supertest";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";

const IPV_DUMMY_URL =
  "https://test-idp-url.com/callback?code=123-4ddkk0sdkkd-ad";

describe("Mfa reset with ipv", () => {
  const REQUEST_PATH = PATH_NAMES.MFA_RESET_WITH_IPV;

  describe("Mfa reset with ipv get", () => {
    beforeEach(() => {
      nock.cleanAll();
    });

    after(() => {
      sinon.restore();
    });

    it("should redirect to the mfa reset ipv path when coming from sms entry", async () => {
      const previousPath = PATH_NAMES.ENTER_MFA;
      const app = await setupAppWithSessionMiddleware(
        previousPath,
        REQUEST_PATH,
        true,
        CHANNEL.WEB
      );
      allowCallToMfaResetAuthorizeEndpointReturningAuthorizeUrl(IPV_DUMMY_URL);

      await request(
        app,
        (test) =>
          test.get(REQUEST_PATH).expect(302).expect("Location", IPV_DUMMY_URL),
        { expectAnalyticsPropertiesMatchSnapshot: false }
      );
    });

    it("should redirect to the mfa reset ipv path when coming from auth app entry", async () => {
      const previousPath = PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE;
      const app = await setupAppWithSessionMiddleware(
        previousPath,
        REQUEST_PATH,
        true,
        CHANNEL.WEB
      );
      allowCallToMfaResetAuthorizeEndpointReturningAuthorizeUrl(IPV_DUMMY_URL);

      await request(
        app,
        (test) =>
          test.get(REQUEST_PATH).expect(302).expect("Location", IPV_DUMMY_URL),
        { expectAnalyticsPropertiesMatchSnapshot: false }
      );
    });

    it("should redirect to the new guidance page when using the strategic app", async () => {
      for (const channel of [CHANNEL.STRATEGIC_APP, CHANNEL.MOBILE]) {
        const previousPath = PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE;
        const app = await setupAppWithSessionMiddleware(
          previousPath,
          REQUEST_PATH,
          true,
          channel
        );

        const expectedGuidancePage = PATH_NAMES.OPEN_IN_WEB_BROWSER;

        const agent = supertest.agent(app);

        await agent
          .get(REQUEST_PATH)
          .set("Cookie", `channel=${channel}`)
          .expect(302)
          .expect("Location", expectedGuidancePage);

        await agent.get(expectedGuidancePage).expect(200);
      }
    });

    it("should return a 500 if account recovery is not permitted", async () => {
      const previousPath = PATH_NAMES.ENTER_MFA;
      const app = await setupAppWithSessionMiddleware(
        previousPath,
        REQUEST_PATH,
        false,
        CHANNEL.WEB
      );

      await request(app, (test) => test.get(REQUEST_PATH).expect(500), {
        expectAnalyticsPropertiesMatchSnapshot: false,
      });
    });
  });

  describe("Open One login in browser get", () => {
    const REQUEST_PATH = PATH_NAMES.OPEN_IN_WEB_BROWSER;

    after(() => {
      sinon.restore();
    });

    it("should not render the page when coming from an arbitrary page", async () => {
      const previousPath = PATH_NAMES.AUTHORIZE;

      for (const channel of [CHANNEL.STRATEGIC_APP, CHANNEL.MOBILE]) {
        const app = await setupAppWithSessionMiddleware(
          previousPath,
          REQUEST_PATH,
          true,
          channel
        );

        await request(
          app,
          (test) =>
            test
              .get(PATH_NAMES.OPEN_IN_WEB_BROWSER)
              .expect(302)
              .expect("Location", previousPath),
          { expectAnalyticsPropertiesMatchSnapshot: false }
        );
      }
    });
  });

  function allowCallToMfaResetAuthorizeEndpointReturningAuthorizeUrl(
    url: string
  ) {
    const baseApi = process.env.FRONTEND_API_BASE_URL;

    nock(baseApi).post(API_ENDPOINTS.MFA_RESET_AUTHORIZE).once().reply(200, {
      authorize_url: url,
      code: 200,
      success: true,
    });
  }

  async function setupAppWithSessionMiddleware(
    currentNextPath: string,
    firstRequestPath: string,
    isAccountRecoveryPermitted: boolean,
    channel: string
  ) {
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
            //Because we're using supertest to update the state after a first request, we only specifically
            //set this up for the first request
            if (req.path === firstRequestPath) {
              res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
              res.locals.strategicAppChannel =
                channel === CHANNEL.STRATEGIC_APP;
              res.locals.mobileChannel = channel === CHANNEL.MOBILE;
              res.locals.webChannel = channel == CHANNEL.WEB;
              res.locals.isApp =
                channel === CHANNEL.STRATEGIC_APP || channel === CHANNEL.MOBILE;

              req.session.user = {
                email: "test@test.com",
                journey: getPermittedJourneyForPath(currentNextPath),
                mfaMethodType: "AUTH_APP",
                isAccountRecoveryPermitted: isAccountRecoveryPermitted,
              };

              req.session.client = {
                redirectUri: "http://test-redirect.gov.uk/callback",
              };
            }
            next();
          }),
        },
      }
    );

    return await createApp();
  }
});
