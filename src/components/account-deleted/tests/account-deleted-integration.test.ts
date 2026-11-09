import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import request from "supertest";
import { PATH_NAMES } from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import esmock from "esmock";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";

const REDIRECT_URI = "https://orchestration.test/callback";

describe("Integration:: account deleted", () => {
  let app: any;
  let token: string | string[];
  let cookies: string;

  before(async () => {
    process.env.SUPPORT_SELF_SERVE_ACCOUNT_DELETION = "1";
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
              journey: getPermittedJourneyForPath(PATH_NAMES.ACCOUNT_DELETED),
            };

            req.session.client = {
              redirectUri: REDIRECT_URI,
            };

            next();
          }),
        },
      }
    );

    app = await createApp();

    ({ token, cookies } = extractCsrfTokenAndCookies(
      await request(app).get(PATH_NAMES.ACCOUNT_DELETED)
    ));
  });

  after(() => {
    sinon.restore();
    app = undefined;
    delete process.env.SUPPORT_SELF_SERVE_ACCOUNT_DELETION;
  });

  it("should return the account deleted page", async () => {
    await request(app)
      .get(PATH_NAMES.ACCOUNT_DELETED)
      .expect(200)
      .expect((res) => {
        expect(res.text).to.contain("You’ve deleted your GOV.UK One Login");
      });
  });

  it("should return error when csrf not present", async () => {
    await request(app)
      .post(PATH_NAMES.ACCOUNT_DELETED)
      .type("form")
      .send({})
      .expect(403);
  });

  it("should redirect to orchestration with the SFAD error on post", async () => {
    await request(app)
      .post(PATH_NAMES.ACCOUNT_DELETED)
      .type("form")
      .set("Cookie", cookies)
      .send({ _csrf: token })
      .expect(302)
      .expect("Location", `${REDIRECT_URI}?error=SFAD_ERROR`);
  });
});
