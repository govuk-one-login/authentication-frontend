import { describe } from "mocha";
import { expect, sinon, request } from "../../../../test/utils/test-utils";
import nock = require("nock");
import * as cheerio from "cheerio";
import decache from "decache";
import { API_ENDPOINTS, PATH_NAMES } from "../../../app.constants";

const IPV_DUMMY_URL =
  "https://test-idp-url.com/callback?code=123-4ddkk0sdkkd-ad";

describe("Mfa reset with ipv", () => {
  async function setupAppWithSessionMiddleware(
    currentNextPath: string,
    isAccountRecoveryPermitted: boolean
  ) {
    decache("../../../app");
    decache("../../../middleware/session-middleware");
    const sessionMiddleware = require("../../../middleware/session-middleware");

    sinon
      .stub(sessionMiddleware, "validateSessionMiddleware")
      .callsFake(function (req: any, res: any, next: any): void {
        res.locals = {
          ...res.locals,
          sessionId: "tDy103saszhcxbQq0-mjdzU854",
        };

        req.session.user = {
          email: "test@test.com",
          journey: {
            nextPath: currentNextPath,
            optionalPaths: [],
          },
          mfaMethodType: "AUTH_APP",
          isAccountRecoveryPermitted: isAccountRecoveryPermitted,
        };

        req.session.client = {
          redirectUri: "http://test-redirect.gov.uk/callback",
        };

        next();
      });

    return await require("../../../app").createApp();
  }

  describe("Mfa reset with ipv get", () => {
    let app: any;
    let baseApi: string;

    before(async () => {
      app = await setupAppWithSessionMiddleware(PATH_NAMES.ENTER_MFA, true);
      baseApi = process.env.FRONTEND_API_BASE_URL;
    });

    beforeEach(() => {
      nock.cleanAll();
    });

    after(() => {
      sinon.restore();
      app = undefined;
      delete process.env.SUPPORT_MFA_RESET_WITH_IPV;
    });

    it("should redirect to the mfa reset ipv path", async () => {
      nock(baseApi).post(API_ENDPOINTS.MFA_RESET_AUTHORIZE).once().reply(200, {
        authorize_url: IPV_DUMMY_URL,
        code: 200,
        success: true,
      });
      await request(app, (test) =>
        test
          .get(PATH_NAMES.MFA_RESET_WITH_IPV)
          .expect(302)
          .expect("Location", IPV_DUMMY_URL)
      );
    });

    it("should return a 500 if account recovery is not permitted", async () => {
      app = await setupAppWithSessionMiddleware(PATH_NAMES.ENTER_MFA, false);

      await request(app, (test) =>
        test.get(PATH_NAMES.MFA_RESET_WITH_IPV).expect(500)
      );
    });
  });

  describe("open in web browser", () => {
    let app: any;

    before(async () => {
      process.env.SUPPORT_MFA_RESET_WITH_IPV = "1";

      app = await setupAppWithSessionMiddleware(
        PATH_NAMES.OPEN_IN_WEB_BROWSER,
        true
      );
    });

    beforeEach(() => {
      nock.cleanAll();
    });

    after(() => {
      sinon.restore();
      app = undefined;
      delete process.env.SUPPORT_MFA_RESET_WITH_IPV;
    });

    it("should render the guidance page for when someone is trying to access via an app journey", async () => {
      await request(app, (test) =>
        test
          .get(PATH_NAMES.OPEN_IN_WEB_BROWSER)
          .expect(200)
          .expect(function (res) {
            const page = cheerio.load(res.text);
            expect(page("h1").text()).to.contain(
              "Open GOV.UK One Login in a web browser to continue"
            );
            expect(page("a.govuk-back-link").attr("href")).to.eq(
              PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE
            );
          })
      );
    });
  });
});
