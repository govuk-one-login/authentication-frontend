import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import * as cheerio from "cheerio";
import type { AxiosResponse } from "axios";
import type { NextFunction, Request, Response } from "express";
import { HTTP_STATUS_CODES, PATH_NAMES } from "../../../app.constants.js";
import type {
  AccountRecoveryInterface,
  AccountRecoveryResponse,
} from "../../common/account-recovery/types.js";
import { createApiResponse } from "../../../utils/http.js";
import esmock from "esmock";
import request from "supertest";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";

describe("Integration:: cannot-use-security-code", () => {
  let app: any;

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
            res.locals.sessionId = "tDy103saszhcxbQq0-mjdzU854";

            req.session.user = {
              email: "test@test.com",
              journey: getPermittedJourneyForPath(
                PATH_NAMES.CANNOT_USE_SECURITY_CODE
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

  after(() => {
    app = undefined;
  });

  it("should return cannot use security code page when account recovery is permitted", async () => {
    app = await setupStubbedApp(true);

    await request(app)
      .get(PATH_NAMES.CANNOT_USE_SECURITY_CODE)
      .expect(200)
      .then((res) => {
        const $ = cheerio.load(res.text);
        expect($(".govuk-heading-l").text()).to.contain(
          "Sorry, there’s a problem"
        );
        expect(
          $("a")
            .toArray()
            .some(
              (link) => $(link).attr("href") === PATH_NAMES.MFA_RESET_WITH_IPV
            )
        ).to.be.true;
      });
  });

  it("should return generic error page when account recovery is not permitted", async () => {
    app = await setupStubbedApp(false);

    await request(app)
      .get(PATH_NAMES.CANNOT_USE_SECURITY_CODE)
      .expect(200)
      .then((res) => {
        const $ = cheerio.load(res.text);
        expect($("h1").text()).to.contain("Sorry, there is a problem");
      });
  });
});
