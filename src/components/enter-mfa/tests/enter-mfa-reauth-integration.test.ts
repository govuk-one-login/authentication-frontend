import { describe } from "mocha";
import { request, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import * as cheerio from "cheerio";
import type { AxiosResponse } from "axios";
import { API_ENDPOINTS, HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants.js";
import { ERROR_CODES } from "../../common/constants.js";
import type {
  AccountRecoveryInterface,
  AccountRecoveryResponse,
} from "../../common/account-recovery/types.js";
import { createApiResponse } from "../../../utils/http.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { buildMfaMethods } from "../../../../test/helpers/mfa-helper.js";
import esmock from "esmock";

describe("Integration:: enter mfa", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let baseApi: string;
  const PHONE_NUMBER = "7867";
  const EXAMPLE_REDIRECT_URI = "https://rp.host/redirect";

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
            res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";
            req.session.user = {
              email: "test@test.com",
              mfaMethods: buildMfaMethods({
                phoneNumber: PHONE_NUMBER,
                redactedPhoneNumber: PHONE_NUMBER,
              }),
              reauthenticate: "12345",
              journey: getPermittedJourneyForPath(PATH_NAMES.ENTER_MFA),
            };
            req.session.client = { redirectUri: EXAMPLE_REDIRECT_URI };
            next();
          }),
        },
        "../../common/account-recovery/account-recovery-service.js": {
          accountRecoveryService: sinon.fake((): AccountRecoveryInterface => {
            async function accountRecovery() {
              const fakeAxiosResponse: AxiosResponse = {
                data: { accountRecoveryPermitted: true },
                status: HTTP_STATUS_CODES.OK,
              } as AxiosResponse;

              return createApiResponse<AccountRecoveryResponse>(fakeAxiosResponse);
            }

            return { accountRecovery };
          }),
        },
      }
    );

    app = await createApp();
    baseApi = process.env.FRONTEND_API_BASE_URL || "";
    process.env.SUPPORT_REAUTHENTICATION = "1";

    await request(app, (test) => test.get(PATH_NAMES.ENTER_MFA), {
      expectAnalyticsPropertiesMatchSnapshot: false,
    }).then((res) => {
      const $ = cheerio.load(res.text);
      token = $("[name=_csrf]").val();
      cookies = res.headers["set-cookie"];
    });
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    process.env.SUPPORT_REAUTHENTICATION = "0";
    sinon.restore();
    app = undefined;
  });

  it("should return check your phone page with reauth analytics properties", async () => {
    await request(app, (test) => test.get(PATH_NAMES.ENTER_MFA).expect(200));
  });

  it("should redirect to rp if user entered 6 incorrect codes in the reauth journey", async () => {
    nock(baseApi)
      .post(API_ENDPOINTS.VERIFY_CODE)
      .times(6)
      .reply(400, { code: ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES, success: false });

    await request(app, (test) =>
      test
        .post(PATH_NAMES.ENTER_MFA)
        .type("form")
        .set("Cookie", cookies)
        .send({ _csrf: token, code: "123455" })
        .expect("Location", EXAMPLE_REDIRECT_URI.concat("?error=login_required"))
        .expect(302)
    );
  });
});
