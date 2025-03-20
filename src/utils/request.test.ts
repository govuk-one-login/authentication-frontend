import { Request } from "express";
import { expect } from "../../test/utils/test-utils";
import {
  isReauth,
  isUpliftRequired,
  isAccountRecoveryJourney,
  isAccountRecoveryJourneyAndEnabled,
  isContactUsSuggestionsFeedbackSubtheme,
  clientIsOneLogin,
  clientUsesOneLoginOptionally,
  supportTypeIsGovService,
  urlContains,
} from "./request";
import {
  CONTACT_US_THEMES,
  SERVICE_TYPE,
  SUPPORT_TYPE,
} from "../app.constants";

describe("request utilities", () => {
  const blankRequest = {} as Request;

  describe("isReauth", () => {
    const positiveRequest = {
      session: { user: { reauthenticate: "teststring" } },
    } as any as Request;

    beforeEach(() => {
      process.env.SUPPORT_REAUTHENTICATION = "1";
    });

    it(`returns false when required properties are not in the request`, async () => {
      expect(isReauth(blankRequest)).to.equal(false);
    });

    it(`returns false when the feature flag is disabled`, async () => {
      process.env.SUPPORT_REAUTHENTICATION = "0";
      expect(isReauth(positiveRequest)).to.equal(false);
    });

    it(`returns true when used property has a value`, async () => {
      expect(isReauth(positiveRequest)).to.equal(true);
    });
  });

  describe("isUpliftRequired", () => {
    it(`returns false when required properties are not in the request`, async () => {
      expect(isUpliftRequired(blankRequest)).to.equal(false);
    });

    it(`returns false when used property is false`, async () => {
      expect(
        isUpliftRequired({
          session: { user: { isUpliftRequired: false } },
        } as any as Request)
      ).to.equal(false);
    });

    it(`returns true when used property is true`, async () => {
      expect(
        isUpliftRequired({
          session: { user: { isUpliftRequired: true } },
        } as any as Request)
      ).to.equal(true);
    });
  });

  describe("isAccountRecoveryJourney", () => {
    it(`returns false when required properties are not in the request`, async () => {
      expect(isAccountRecoveryJourney(blankRequest)).to.equal(false);
    });

    it(`returns false when used property is false`, async () => {
      expect(
        isAccountRecoveryJourney({
          session: { user: { isAccountRecoveryJourney: false } },
        } as any as Request)
      ).to.equal(false);
    });

    it(`returns true when used property is true`, async () => {
      expect(
        isAccountRecoveryJourney({
          session: { user: { isAccountRecoveryJourney: true } },
        } as any as Request)
      ).to.equal(true);
    });
  });

  describe("isAccountRecoveryJourneyAndEnabled", () => {
    let positiveRequest: Request;

    beforeEach(() => {
      process.env.SUPPORT_ACCOUNT_RECOVERY = "1";
      positiveRequest = {
        session: {
          user: {
            isAccountRecoveryJourney: true,
            isAccountRecoveryPermitted: true,
          },
        },
      } as any as Request;
    });

    it(`returns false when required properties are not in the request`, async () => {
      expect(isAccountRecoveryJourneyAndEnabled(blankRequest)).to.equal(false);
    });

    it(`returns false when the feature flag is disabled`, async () => {
      process.env.SUPPORT_ACCOUNT_RECOVERY = "0";
      expect(isAccountRecoveryJourneyAndEnabled(positiveRequest)).to.equal(
        false
      );
    });

    it(`returns false when not all used property are true`, async () => {
      const request = positiveRequest;
      request.session.user.isAccountRecoveryJourney = false;
      expect(isAccountRecoveryJourneyAndEnabled(request)).to.equal(false);
      request.session.user.isAccountRecoveryJourney = true;
      request.session.user.isAccountRecoveryPermitted = false;
      expect(isAccountRecoveryJourneyAndEnabled(request)).to.equal(false);
    });

    it(`returns true when used properties are true`, async () => {
      expect(isAccountRecoveryJourneyAndEnabled(positiveRequest)).to.equal(
        true
      );
    });
  });

  describe("isContactUsSuggestionsFeedbackTheme", () => {
    it(`returns false when required properties are not in the request`, async () => {
      expect(isContactUsSuggestionsFeedbackSubtheme(blankRequest)).to.equal(
        false
      );
    });

    it(`returns true when used property is not as expected`, async () => {
      expect(
        isContactUsSuggestionsFeedbackSubtheme({
          query: { subtheme: CONTACT_US_THEMES.ACCOUNT_CREATION },
        } as any as Request)
      ).to.equal(false);
    });

    it(`returns true when used property is as expected`, async () => {
      expect(
        isContactUsSuggestionsFeedbackSubtheme({
          query: { subtheme: CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK },
        } as any as Request)
      ).to.equal(true);
    });
  });

  describe("clientIsOneLogin", () => {
    it(`returns false when required properties are not in the request`, async () => {
      expect(clientIsOneLogin(blankRequest)).to.equal(false);
    });

    it(`returns false when used property is false`, async () => {
      expect(
        clientIsOneLogin({
          session: { client: { isOneLoginService: false } },
        } as any as Request)
      ).to.equal(false);
    });

    it(`returns true when used property is true`, async () => {
      expect(
        clientIsOneLogin({
          session: { client: { isOneLoginService: true } },
        } as any as Request)
      ).to.equal(true);
    });
  });

  describe("clientUsesOneLoginOptionally", () => {
    it(`returns false when required properties are not in the request`, async () => {
      expect(clientUsesOneLoginOptionally(blankRequest)).to.equal(false);
    });

    it(`returns false when used property is not as expected`, async () => {
      expect(
        clientUsesOneLoginOptionally({
          session: { client: { serviceType: SERVICE_TYPE.MANDATORY } },
        } as any as Request)
      ).to.equal(false);
    });

    it(`returns true when used property is as expected`, async () => {
      expect(
        clientUsesOneLoginOptionally({
          session: { client: { serviceType: SERVICE_TYPE.OPTIONAL } },
        } as any as Request)
      ).to.equal(true);
    });
  });

  describe("supportTypeIsGovService", () => {
    it(`returns false when required properties are not in the request`, async () => {
      expect(supportTypeIsGovService(blankRequest)).to.equal(false);
    });

    it(`returns true when used property is not as expected`, async () => {
      expect(
        supportTypeIsGovService({
          query: { supportType: SUPPORT_TYPE.PUBLIC },
        } as any as Request)
      ).to.equal(false);
      expect(
        supportTypeIsGovService({
          body: { supportType: SUPPORT_TYPE.PUBLIC },
        } as any as Request)
      ).to.equal(false);
    });

    it(`returns true when used property is as expected`, async () => {
      expect(
        supportTypeIsGovService({
          query: { supportType: SUPPORT_TYPE.GOV_SERVICE },
        } as any as Request)
      ).to.equal(true);
      expect(
        supportTypeIsGovService({
          body: { supportType: SUPPORT_TYPE.GOV_SERVICE },
        } as any as Request)
      ).to.equal(true);
    });
  });

  describe("urlContains", () => {
    it(`returns false when required properties are not in the request`, async () => {
      expect(urlContains({} as Request, "")).to.equal(false);
    });

    it(`returns true when used property is not as expected`, async () => {
      expect(
        urlContains(
          {
            originalUrl: "/haystack",
          } as any as Request,
          "needle"
        )
      ).to.equal(false);
    });

    it(`returns true when used property is as expected`, async () => {
      expect(
        urlContains(
          {
            originalUrl: "/haysneedletack",
          } as any as Request,
          "needle"
        )
      ).to.equal(true);
    });
  });
});
