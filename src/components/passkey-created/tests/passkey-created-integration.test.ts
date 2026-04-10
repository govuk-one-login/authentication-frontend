import { afterEach, describe } from "mocha";
import { sinon } from "../../../../test/utils/test-utils.js";
import request from "supertest";
import { PATH_NAMES } from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import esmock from "esmock";
import type { UserSession } from "../../../types.js";

describe("Integration:: passkey created", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let sessionUserOverrides: Partial<UserSession> = {};

  before(async () => {
    process.env.SUPPORT_PASSKEY_REGISTRATION = "1";
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
              journey: getPermittedJourneyForPath(PATH_NAMES.PASSKEY_CREATED),
              ...sessionUserOverrides,
            };

            next();
          }),
        },
      }
    );

    app = await createApp();

    ({ token, cookies } = extractCsrfTokenAndCookies(
      await request(app).get(PATH_NAMES.PASSKEY_CREATED)
    ));
  });

  after(() => {
    sinon.restore();
    app = undefined;
    delete process.env.SUPPORT_PASSKEY_REGISTRATION;
  });

  afterEach(() => {
    sessionUserOverrides = {};
  });

  it("should return passkey created page", async () => {
    await request(app).get(PATH_NAMES.PASSKEY_CREATED).expect(200);
  });

  it("should return error when csrf not present", async () => {
    await request(app)
      .post(PATH_NAMES.PASSKEY_CREATED)
      .type("form")
      .send({})
      .expect(403);
  });

  it("should redirect to auth code on post", async () => {
    await request(app)
      .post(PATH_NAMES.PASSKEY_CREATED)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
      })
      .expect(302)
      .expect("Location", PATH_NAMES.AUTH_CODE);
  });

  it("should redirect to updated terms and conditions on post when terms not accepted", async () => {
    sessionUserOverrides = { isLatestTermsAndConditionsAccepted: false };

    const getResponse = await request(app).get(PATH_NAMES.PASSKEY_CREATED);
    const { token: testToken, cookies: testCookies } =
      extractCsrfTokenAndCookies(getResponse);

    await request(app)
      .post(PATH_NAMES.PASSKEY_CREATED)
      .type("form")
      .set("Cookie", testCookies)
      .send({
        _csrf: testToken,
      })
      .expect(302)
      .expect("Location", PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS);
  });
});
