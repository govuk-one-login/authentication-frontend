import { describe } from "mocha";
import { expect, sinon } from "../../../../test/utils/test-utils.js";
import * as cheerio from "cheerio";
import request from "supertest";
import {
  AMC_JOURNEY_TYPES,
  API_ENDPOINTS,
  PATH_NAMES,
} from "../../../app.constants.js";
import type { NextFunction, Request, Response } from "express";
import { getPermittedJourneyForPath } from "../../../../test/helpers/session-helper.js";
import { extractCsrfTokenAndCookies } from "../../../../test/helpers/csrf-helper.js";
import esmock from "esmock";
import type { UserSession } from "../../../types.js";
import nock from "nock";

describe("Integration:: create passkey", () => {
  let token: string | string[];
  let cookies: string;
  let app: any;
  let sessionUserOverrides: Partial<UserSession> = {};
  let capturedUserSession: UserSession;

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
              journey: getPermittedJourneyForPath(PATH_NAMES.CREATE_PASSKEY),
              ...sessionUserOverrides,
            };

            capturedUserSession = req.session.user;

            next();
          }),
        },
      }
    );

    app = await createApp();

    ({ token, cookies } = extractCsrfTokenAndCookies(
      await request(app).get(PATH_NAMES.CREATE_PASSKEY)
    ));
  });

  after(() => {
    sinon.restore();
    app = undefined;
    delete process.env.SUPPORT_PASSKEY_REGISTRATION;
  });

  it("should return create passkey page", async () => {
    await request(app).get(PATH_NAMES.CREATE_PASSKEY).expect(200);
  });

  it("should return error when csrf not present", async () => {
    await request(app)
      .post(PATH_NAMES.CREATE_PASSKEY)
      .type("form")
      .send({
        action: "continue",
      })
      .expect(403);
  });

  it("should redirect to amc authorize uri on continue button submission", async () => {
    const getResponse = await request(app).get(PATH_NAMES.CREATE_PASSKEY);
    const $ = cheerio.load(getResponse.text);

    const continueButton = $(
      'button[name="createPasskeyOption"][value="submit"]'
    );
    expect(continueButton.length).to.equal(1);

    const buttonName = continueButton.attr("name");
    const buttonValue = continueButton.attr("value");

    const baseApi = process.env.FRONTEND_API_BASE_URL;
    const redirectUrl = "https://example.com";
    const amcCookie = "some-cookie-value";

    nock(baseApi)
      .post(API_ENDPOINTS.AMC_AUTHORIZE, {
        journeyType: AMC_JOURNEY_TYPES.PASSKEY_CREATE,
      })
      .once()
      .reply(200, {
        redirectUrl: redirectUrl,
        amcCookie: amcCookie,
        code: 200,
        success: true,
      });

    await request(app)
      .post(PATH_NAMES.CREATE_PASSKEY)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        [buttonName]: buttonValue,
      })
      .expect(302)
      .expect("Location", redirectUrl);

    expect(capturedUserSession.journey.nextPath).to.equal(
      PATH_NAMES.CREATE_PASSKEY_CALLBACK
    );
  });

  const testValues = [
    {
      isLatestTermsAndConditionsAccepted: true,
      expectedRedirect: PATH_NAMES.AUTH_CODE,
    },
    {
      isLatestTermsAndConditionsAccepted: false,
      expectedRedirect: PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS,
    },
  ];

  testValues.forEach(
    ({ isLatestTermsAndConditionsAccepted, expectedRedirect }) => {
      it(`should handle skip button submission when isLatestTermsAndConditionsAccepted is ${isLatestTermsAndConditionsAccepted}`, async () => {
        sessionUserOverrides = { isLatestTermsAndConditionsAccepted };

        const getResponse = await request(app).get(PATH_NAMES.CREATE_PASSKEY);

        const { token: testToken, cookies: testCookies } =
          extractCsrfTokenAndCookies(getResponse);

        const $ = cheerio.load(getResponse.text);

        const skipButton = $(
          'button[name="createPasskeyOption"][value="skip"]'
        );
        expect(skipButton.length).to.equal(1);

        const buttonName = skipButton.attr("name");
        const buttonValue = skipButton.attr("value");

        await request(app)
          .post(PATH_NAMES.CREATE_PASSKEY)
          .type("form")
          .set("Cookie", testCookies)
          .send({
            _csrf: testToken,
            [buttonName]: buttonValue,
          })
          .expect(302)
          .expect("Location", expectedRedirect);
      });
    }
  );

  it("should return an error when the createPasskeyOption not one of skip or submit", async () => {
    await request(app)
      .post(PATH_NAMES.CREATE_PASSKEY)
      .type("form")
      .set("Cookie", cookies)
      .send({
        _csrf: token,
        ["createPasskeyOption"]: "someOtherOption",
      })
      .expect(500);
  });
});
