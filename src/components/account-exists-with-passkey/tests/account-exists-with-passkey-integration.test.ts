import { describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import request from "supertest";
import { PATH_NAMES } from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import esmock from "esmock";

describe("Integration:: account exists with passkey", () => {
  async function setupApp(nextPath: string) {
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
              journey: {
                nextPath: nextPath,
                optionalPaths: [],
              },
            };

            next();
          }),
        },
      }
    );

    return await createApp();
  }

  beforeEach(async () => {
    process.env.SUPPORT_PASSKEY_USAGE = "1";
  });

  afterEach(() => {
    sinon.restore();
    delete process.env.SUPPORT_PASSKEY_USAGE;
  });

  it("should render the page when journey state permits access", async () => {
    const app = await setupApp(PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY);

    await request(app).get(PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY).expect(200);
  });

  it("should redirect to the correct path when journey state does not permit access", async () => {
    const app = await setupApp(PATH_NAMES.ENTER_PASSWORD);

    await request(app)
      .get(PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY)
      .expect(302)
      .expect("Location", PATH_NAMES.ENTER_PASSWORD);
  });

  it("should redirect to sign in with passkey on POST", async () => {
    const app = await setupApp(PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY);

    const { token, cookies } = extractCsrfTokenAndCookies(
      await request(app).get(PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY)
    );

    await request(app)
      .post(PATH_NAMES.ACCOUNT_EXISTS_WITH_PASSKEY)
      .type("form")
      .set("Cookie", cookies)
      .send({ _csrf: token })
      .expect(302)
      .expect("Location", PATH_NAMES.SIGN_IN_WITH_PASSKEY);
  });
});
