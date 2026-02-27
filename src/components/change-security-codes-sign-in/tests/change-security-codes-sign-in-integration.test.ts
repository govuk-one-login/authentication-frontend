import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import request from "supertest";
import type { AxiosResponse } from "axios";
import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants.js";
import type {
  AccountRecoveryInterface,
  AccountRecoveryResponse,
} from "../../common/account-recovery/types.js";
import { createApiResponse } from "../../../utils/http.js";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";

describe("Integration:: change-security-codes-sign-in", () => {
  async function setupStubbedApp(isAccountRecoveryPermitted: boolean = true) {
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
            res.locals.sessionId = "test-session-id";
            res.locals.clientSessionId = "test-client-session-id";
            res.locals.persistentSessionId = "test-persistent-session-id";

            req.session.user = {
              email: "test@test.com",
              journey: getPermittedJourneyForPath(
                PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN
              ),
            };

            next();
          }),
        },
        "../../common/account-recovery/account-recovery-service.js": {
          accountRecoveryService: sinon.fake((): AccountRecoveryInterface => {
            async function accountRecovery() {
              const fakeAxiosResponse: AxiosResponse = {
                data: {
                  accountRecoveryPermitted: isAccountRecoveryPermitted,
                },
                status: HTTP_STATUS_CODES.OK,
              } as AxiosResponse;

              return createApiResponse<AccountRecoveryResponse>(
                fakeAxiosResponse
              );
            }

            return { accountRecovery };
          }),
        },
      }
    );

    return createApp();
  }

  describe("GET /change-security-codes-sign-in", () => {
    it("should return 200 and render the page", async () => {
      const app = await setupStubbedApp();

      await request(app)
        .get(PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN)
        .expect(200);
    });
  });

  describe("POST /change-security-codes-sign-in", () => {
    it("should redirect to GET_SECURITY_CODES when account recovery permitted", async () => {
      const app = await setupStubbedApp(true);

      const { token, cookies } = extractCsrfTokenAndCookies(
        await request(app).get(PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN)
      );

      await request(app)
        .post(PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
        })
        .expect(302)
        .expect("Location", PATH_NAMES.GET_SECURITY_CODES);
    });

    it("should render generic error when account recovery not permitted", async () => {
      const app = await setupStubbedApp(false);

      const { token, cookies } = extractCsrfTokenAndCookies(
        await request(app).get(PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN)
      );

      const response = await request(app)
        .post(PATH_NAMES.CHANGE_SECURITY_CODES_SIGN_IN)
        .type("form")
        .set("Cookie", cookies)
        .send({
          _csrf: token,
        });

      expect(response.status).to.equal(200);
      expect(response.text).to.include("Sorry, there is a problem");
    });
  });
});
