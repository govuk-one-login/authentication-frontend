import { describe } from "mocha";
import { request, sinon } from "../../../../test/utils/test-utils.js";
import decache from "decache";
import { API_ENDPOINTS, CHANNEL, PATH_NAMES } from "../../../app.constants.js";
import nock from "nock";
import { NextFunction, Request, Response } from "express";
import supertest from "supertest";

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
      delete process.env.SUPPORT_MFA_RESET_WITH_IPV;
      delete process.env.ROUTE_USERS_TO_NEW_IPV_JOURNEY;
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
      const previousPath = PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE;
      const app = await setupAppWithSessionMiddleware(
        previousPath,
        REQUEST_PATH,
        true,
        CHANNEL.STRATEGIC_APP
      );

      const expectedGuidancePage = PATH_NAMES.OPEN_IN_WEB_BROWSER;

      const agent = supertest.agent(app);

      await agent
        .get(REQUEST_PATH)
        .set("Cookie", "channel=strategic_app")
        .expect(302)
        .expect("Location", expectedGuidancePage);

      await agent.get(expectedGuidancePage).expect(200);
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
    before(() => (process.env.SUPPORT_MFA_RESET_WITH_IPV = "1"));

    after(() => {
      sinon.restore();
      delete process.env.SUPPORT_MFA_RESET_WITH_IPV;
    });

    it("should not render the page when coming from an arbitrary page", async () => {
      const previousPath = PATH_NAMES.AUTHORIZE;

      const app = await setupAppWithSessionMiddleware(
        previousPath,
        REQUEST_PATH,
        true,
        CHANNEL.STRATEGIC_APP
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
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    decache("../../../../test/helpers/session-helper");
    process.env.SUPPORT_MFA_RESET_WITH_IPV = "1";
    process.env.ROUTE_USERS_TO_NEW_IPV_JOURNEY = "1";
    const sessionMiddleware = await import(
      "../../../middleware/session-middleware"
    );
    const { getPermittedJourneyForPath } = await import(
      "../../../../test/helpers/session-helper"
    );

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (
        req: Request,
        res: Response,
        next: NextFunction
      ): void {
        //Because we're using supertest to update the state after a first request, we only specifically
        //set this up for the first request
        if (req.path === firstRequestPath) {
          res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
          res.locals.strategicAppChannel = channel === CHANNEL.STRATEGIC_APP;
          res.locals.webChannel = channel == CHANNEL.WEB;

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
      });

    return (await import("../../../app")).createApp();
  }
});
