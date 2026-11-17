import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import request from "supertest";
import esmock from "esmock";
import type { AxiosResponse } from "axios";
import type { NextFunction, Request, Response } from "express";
import type express from "express";
import {
  API_ENDPOINTS,
  HTTP_STATUS_CODES,
  JOURNEY_TYPE,
  MFA_METHOD_TYPE,
  PATH_NAMES,
} from "../../../app.constants.js";
import { createApiResponse } from "../../../utils/http.js";
import type {
  AccountRecoveryInterface,
  AccountRecoveryResponse,
} from "../../common/account-recovery/types.js";
import type { UserSession } from "../../../types.js";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import type { PartialMfaMethod } from "../../../../test/helpers/mfa-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";

const IPV_DUMMY_URL =
  "https://test-idp-url.com/callback?code=123-4ddkk0sdkkd-ad";
const MFA_METHOD_ID = "test-mfa-method-id";

/**
 * A user starts signing in, clicks "check if you can change how you get
 * security codes", is redirected to IPV, and then uses the browser's back
 * button to return to the enter code page without completing IPV.
 *
 * Because the user never completed IPV they are still on a sign in journey, so
 * the code they enter must be verified with a journeyType of SIGN_IN rather
 * than ACCOUNT_RECOVERY.
 */
describe("Integration:: going back from IPV to the enter code page", () => {
  let baseApi: string;

  beforeEach(() => {
    nock.cleanAll();
    baseApi = process.env.FRONTEND_API_BASE_URL as string;
  });

  afterEach(() => {
    nock.cleanAll();
    sinon.restore();
  });

  async function setupApp(
    enterCodePath: string,
    mfaMethod: PartialMfaMethod,
    mfaMethodType: MFA_METHOD_TYPE
  ): Promise<{ app: express.Application; user: UserSession }> {
    /**
     * Re-use the same user object for every request so that changes made by
     * the controllers persist between requests in the same way they would
     * with a real session.
     */
    const user = {
      email: "test@test.com",
      mfaMethods: buildMfaMethods({ ...mfaMethod, id: MFA_METHOD_ID }),
      activeMfaMethodId: MFA_METHOD_ID,
      mfaMethodType,
      journey: getPermittedJourneyForPath(enterCodePath),
    } as UserSession;

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
            res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
            res.locals.clientSessionId = "test-client-session-id";
            res.locals.persistentSessionId = "test-persistent-session-id";

            req.session.user = user;
            req.session.client = {
              redirectUri: "http://test-redirect.gov.uk/callback",
              state: "test-state",
            };
            next();
          }),
        },
        "../../common/account-recovery/account-recovery-service.js": {
          accountRecoveryService: sinon.fake((): AccountRecoveryInterface => {
            async function accountRecovery() {
              return createApiResponse<AccountRecoveryResponse>({
                data: { accountRecoveryPermitted: true },
                status: HTTP_STATUS_CODES.OK,
              } as AxiosResponse);
            }
            return { accountRecovery };
          }),
        },
      }
    );

    return { app: await createApp(), user };
  }

  async function clickCheckIfYouCanChangeHowYouGetSecurityCodes(
    app: express.Application
  ) {
    nock(baseApi).post(API_ENDPOINTS.MFA_RESET_AUTHORIZE).once().reply(200, {
      authorize_url: IPV_DUMMY_URL,
      code: 200,
      success: true,
    });

    await request(app)
      .get(PATH_NAMES.MFA_RESET_WITH_IPV)
      .expect(302)
      .expect("Location", IPV_DUMMY_URL);
  }

  it("verifies an SMS code with a journeyType of SIGN_IN", async () => {
    const { app, user } = await setupApp(
      PATH_NAMES.ENTER_MFA,
      { redactedPhoneNumber: "7867" },
      MFA_METHOD_TYPE.SMS
    );

    await request(app).get(PATH_NAMES.ENTER_MFA).expect(200);
    await clickCheckIfYouCanChangeHowYouGetSecurityCodes(app);

    const { token, cookies } = extractCsrfTokenAndCookies(
      await request(app).get(PATH_NAMES.ENTER_MFA).expect(200)
    );

    expect(user.isAccountRecoveryJourney).to.not.equal(true);

    let requestBody: { journeyType?: string } | undefined;
    const verifyCodeRequest = nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_CODE, (body) => {
        requestBody = body;
        return true;
      })
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    await request(app)
      .post(PATH_NAMES.ENTER_MFA)
      .type("form")
      .set("Cookie", cookies)
      .send({ _csrf: token, code: "123456" })
      .expect("Location", PATH_NAMES.AUTH_CODE)
      .expect(302);

    expect(verifyCodeRequest.isDone()).to.equal(true);
    expect(requestBody?.journeyType).to.equal(JOURNEY_TYPE.SIGN_IN);
  });

  it("verifies an authenticator app code with a journeyType of SIGN_IN", async () => {
    const { app, user } = await setupApp(
      PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE,
      { authApp: true },
      MFA_METHOD_TYPE.AUTH_APP
    );

    await request(app).get(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE).expect(200);
    await clickCheckIfYouCanChangeHowYouGetSecurityCodes(app);

    const { token, cookies } = extractCsrfTokenAndCookies(
      await request(app)
        .get(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
        .expect(200)
    );

    expect(user.isAccountRecoveryJourney).to.not.equal(true);

    let requestBody: { journeyType?: string } | undefined;
    const verifyMfaCodeRequest = nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_MFA_CODE, (body) => {
        requestBody = body;
        return true;
      })
      .once()
      .reply(HTTP_STATUS_CODES.NO_CONTENT, {});

    await request(app)
      .post(PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE)
      .type("form")
      .set("Cookie", cookies)
      .send({ _csrf: token, code: "123456" })
      .expect("Location", PATH_NAMES.AUTH_CODE)
      .expect(302);

    expect(verifyMfaCodeRequest.isDone()).to.equal(true);
    expect(requestBody?.journeyType).to.equal(JOURNEY_TYPE.SIGN_IN);
  });
});
