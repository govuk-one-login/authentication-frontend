import { describe } from "mocha";
import { CONTACT_FORM_STRUCTURE, PATH_NAMES } from "../../../app.constants.js";
import type { Theme } from "src/app.constants.js";
import { request, sinon } from "../../../../test/utils/test-utils.js";
import { expect } from "chai";
import type { NextFunction, Request, Response } from "express";
import esmock from "esmock";

describe("Snapshot:: contact us - public user", () => {
  let app: Express.Application;

  before(async () => {
    const { createApp } = await esmock(
      "../../../app.js",
      {},
      {
        "../../../middleware/csrf-middleware.js": {
          csrfMiddleware: sinon.fake(function (
            _req: Request,
            res: Response,
            next: NextFunction
          ) {
            res.locals.csrfToken = "TEST_CSRF_TOKEN";
            next();
          }),
        },
        "../../../middleware/set-local-vars-middleware.js": {
          setLocalVarsMiddleware: sinon.fake(function (
            _req: Request,
            res: Response,
            next: NextFunction
          ) {
            res.locals.scriptNonce = "TEST_NONCE";
            next();
          }),
        },
        "../../../middleware/outbound-contact-us-links-middleware.js": {
          outboundContactUsLinksMiddleware: sinon.fake(function (
            _req: Request,
            res: Response,
            next: NextFunction
          ) {
            res.locals.contactUsLinkUrl = "https://example.com";
            next();
          }),
        },
      }
    );
    app = await createApp();
  });

  it("should render /contact-us", async () => {
    const res = await request(app, (test) => test.get(PATH_NAMES.CONTACT_US), {
      expectAnalyticsPropertiesMatchSnapshot: false,
    });
    expect(res.text).toMatchSnapshot();
  });

  CONTACT_FORM_STRUCTURE.forEach((theme: Theme, themeKey: string) => {
    describe(themeKey, () => {
      if (theme.subThemes) {
        it(`should render /contact-us-further-information?theme=${themeKey}`, async () => {
          const res = await request(
            app,
            (test) =>
              test
                .get(PATH_NAMES.CONTACT_US_FURTHER_INFORMATION)
                .query({ theme: themeKey }),
            { expectAnalyticsPropertiesMatchSnapshot: false }
          );
          expect(res.text).toMatchSnapshot();
        });

        theme.subThemes.forEach((_subTheme: Theme, subThemeKey) => {
          it(`should render /contact-us-questions?theme=${themeKey}&subtheme=${subThemeKey}`, async () => {
            const res = await request(
              app,
              (test) =>
                test
                  .get(PATH_NAMES.CONTACT_US_QUESTIONS)
                  .query({ theme: themeKey, subtheme: subThemeKey }),
              { expectAnalyticsPropertiesMatchSnapshot: false }
            );
            expect(res.text).toMatchSnapshot();
          });
        });
      } else {
        it(`should render /contact-us-questions?theme=${themeKey}`, async () => {
          const res = await request(
            app,
            (test) =>
              test
                .get(PATH_NAMES.CONTACT_US_FURTHER_INFORMATION)
                .query({ theme: themeKey }),
            { expectAnalyticsPropertiesMatchSnapshot: false }
          );
          expect(res.text).toMatchSnapshot();
        });
      }
    });
  });
});
