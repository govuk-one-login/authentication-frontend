import { afterEach, describe, it } from "mocha";
import { expect, sinon } from "../utils/test-utils.js";
import {
  supportAuthorizeController,
  supportNoPhotoIdContactForms,
  supportAccountInterventions,
  supportReauthentication,
  getLanguageToggleEnabled,
  supportNewIpvSpinner,
  supportHttpKeepAlive,
  getPrivacyNoticeRedirectEnabled,
  useRebrand,
  supportPasskeyUsage,
  supportPasskeyRegistration,
  supportNewInternationalSms,
  supportSingleFactorAccountDeletion,
  getDefaultChannel,
  showTestBanner,
  getAccountDomain,
  getPasskeyPromptClientAllowList,
  getPasskeyPromptClientDenyList,
  getPasskeyRolloutPercentage,
} from "../../src/config.js";
import { CHANNEL } from "../../src/app.constants.js";

describe("config", () => {
  afterEach(() => {
    sinon.restore();
    delete process.env.SUPPORT_AUTHORIZE_CONTROLLER;
    delete process.env.NO_PHOTO_ID_CONTACT_FORMS;
    delete process.env.SUPPORT_ACCOUNT_INTERVENTIONS;
    delete process.env.SUPPORT_REAUTHENTICATION;
    delete process.env.LANGUAGE_TOGGLE_ENABLED;
    delete process.env.SUPPORT_NEW_IPV_SPINNER;
    delete process.env.SUPPORT_HTTP_KEEP_ALIVE;
    delete process.env.PRIVACY_NOTICE_REDIRECT_ENABLED;
    delete process.env.USE_REBRAND;
    delete process.env.SUPPORT_PASSKEY_USAGE;
    delete process.env.SUPPORT_PASSKEY_REGISTRATION;
    delete process.env.SUPPORT_NEW_INTERNATIONAL_SMS;
    delete process.env.SUPPORT_SINGLE_FACTOR_ACCOUNT_DELETION;
    delete process.env.DEFAULT_CHANNEL;
    delete process.env.APP_ENV;
    delete process.env.SERVICE_DOMAIN;
    delete process.env.PASSKEY_PROMPT_CLIENT_ALLOW_LIST;
    delete process.env.PASSKEY_PROMPT_CLIENT_DENY_LIST;
  });

  describe("boolean flag methods", () => {
    const booleanFlags: {
      name: string;
      envVar: string;
      fn: () => boolean;
    }[] = [
      {
        name: "supportAuthorizeController",
        envVar: "SUPPORT_AUTHORIZE_CONTROLLER",
        fn: supportAuthorizeController,
      },
      {
        name: "supportNoPhotoIdContactForms",
        envVar: "NO_PHOTO_ID_CONTACT_FORMS",
        fn: supportNoPhotoIdContactForms,
      },
      {
        name: "supportAccountInterventions",
        envVar: "SUPPORT_ACCOUNT_INTERVENTIONS",
        fn: supportAccountInterventions,
      },
      {
        name: "supportReauthentication",
        envVar: "SUPPORT_REAUTHENTICATION",
        fn: supportReauthentication,
      },
      {
        name: "getLanguageToggleEnabled",
        envVar: "LANGUAGE_TOGGLE_ENABLED",
        fn: getLanguageToggleEnabled,
      },
      {
        name: "supportNewIpvSpinner",
        envVar: "SUPPORT_NEW_IPV_SPINNER",
        fn: supportNewIpvSpinner,
      },
      {
        name: "supportHttpKeepAlive",
        envVar: "SUPPORT_HTTP_KEEP_ALIVE",
        fn: supportHttpKeepAlive,
      },
      {
        name: "getPrivacyNoticeRedirectEnabled",
        envVar: "PRIVACY_NOTICE_REDIRECT_ENABLED",
        fn: getPrivacyNoticeRedirectEnabled,
      },
      {
        name: "useRebrand",
        envVar: "USE_REBRAND",
        fn: useRebrand,
      },
      {
        name: "supportPasskeyUsage",
        envVar: "SUPPORT_PASSKEY_USAGE",
        fn: supportPasskeyUsage,
      },
      {
        name: "supportPasskeyRegistration",
        envVar: "SUPPORT_PASSKEY_REGISTRATION",
        fn: supportPasskeyRegistration,
      },
      {
        name: "supportNewInternationalSms",
        envVar: "SUPPORT_NEW_INTERNATIONAL_SMS",
        fn: supportNewInternationalSms,
      },
      {
        name: "supportSingleFactorAccountDeletion",
        envVar: "SUPPORT_SINGLE_FACTOR_ACCOUNT_DELETION",
        fn: supportSingleFactorAccountDeletion,
      },
    ];

    booleanFlags.forEach(({ name, envVar, fn }) => {
      describe(name, () => {
        it("should return true when env var is '1'", () => {
          process.env[envVar] = "1";
          expect(fn()).to.be.true;
        });

        it("should return false when env var is not set", () => {
          delete process.env[envVar];
          expect(fn()).to.be.false;
        });

        it("should return false when env var is '0'", () => {
          process.env[envVar] = "0";
          expect(fn()).to.be.false;
        });
      });
    });
  });

  describe("getDefaultChannel", () => {
    [CHANNEL.WEB, CHANNEL.STRATEGIC_APP, CHANNEL.GENERIC_APP].forEach(
      (channel) => {
        it(`should return '${channel}' when DEFAULT_CHANNEL is '${channel}'`, () => {
          process.env.DEFAULT_CHANNEL = channel;
          expect(getDefaultChannel()).to.equal(channel);
        });
      }
    );

    it("should return 'web' when DEFAULT_CHANNEL is invalid", () => {
      process.env.DEFAULT_CHANNEL = "invalid";
      expect(getDefaultChannel()).to.equal(CHANNEL.WEB);
    });

    it("should return 'web' when DEFAULT_CHANNEL is not set", () => {
      delete process.env.DEFAULT_CHANNEL;
      expect(getDefaultChannel()).to.equal(CHANNEL.WEB);
    });
  });

  describe("showTestBanner", () => {
    [
      { appEnv: "local", expected: true },
      { appEnv: "development", expected: true },
      { appEnv: "production", expected: false },
    ].forEach(({ appEnv, expected }) => {
      it(`should return ${expected} when APP_ENV='${appEnv}'`, () => {
        process.env.APP_ENV = appEnv;
        expect(showTestBanner()).to.equal(expected);
      });
    });
  });

  describe("getGoogleAnalyticsAndDynatraceCookieDomain", () => {
    it("should return 'localhost' when SERVICE_DOMAIN is 'localhost'", () => {
      process.env.SERVICE_DOMAIN = "localhost";
      expect(getAccountDomain()).to.equal("localhost");
    });

    it("should return 'localhost' when SERVICE_DOMAIN is not set", () => {
      delete process.env.SERVICE_DOMAIN;
      expect(getAccountDomain()).to.equal("localhost");
    });

    ["signin.account.gov.uk", "auth.account.gov.uk"].forEach(
      (serviceDomain) => {
        it(`should return '.account.gov.uk' when SERVICE_DOMAIN is not localhost ('${serviceDomain}')`, () => {
          process.env.SERVICE_DOMAIN = serviceDomain;
          expect(getAccountDomain()).to.equal(".account.gov.uk");
        });
      }
    );
  });

  describe("getPasskeyPromptClientAllowList", () => {
    [
      {
        input: "client1,client2,client3",
        expected: ["client1", "client2", "client3"],
      },
      {
        input: "client1 , client2 , client3",
        expected: ["client1", "client2", "client3"],
      },
      { input: "single-client", expected: ["single-client"] },
    ].forEach(({ input, expected }) => {
      it(`should return ${JSON.stringify(expected)} when set to '${input}'`, () => {
        process.env.PASSKEY_PROMPT_CLIENT_ALLOW_LIST = input;
        expect(getPasskeyPromptClientAllowList()).to.deep.equal(expected);
      });
    });

    it("should return empty array when not set", () => {
      delete process.env.PASSKEY_PROMPT_CLIENT_ALLOW_LIST;
      expect(getPasskeyPromptClientAllowList()).to.deep.equal([]);
    });
  });

  describe("getPasskeyRolloutPercentage", () => {
    [
      {
        passkeyRolloutPercentage: "50",
        expected: 50,
      },
      {
        passkeyRolloutPercentage: null,
        expected: 0,
      },
      {
        passkeyRolloutPercentage: undefined,
        expected: 0,
      },
      {
        passkeyRolloutPercentage: "100",
        expected: 100,
      },
    ].forEach(({ passkeyRolloutPercentage, expected }) => {
      it(`should return ${expected} when PASSKEY_ROLLOUT_PERCENTAGE is ${passkeyRolloutPercentage}`, () => {
        process.env.PASSKEY_ROLLOUT_PERCENTAGE = passkeyRolloutPercentage;
        expect(getPasskeyRolloutPercentage()).to.equal(expected);
      });
    });
  });

  describe("getPasskeyPromptClientDenyList", () => {
    [
      {
        input: "client1,client2,client3",
        expected: ["client1", "client2", "client3"],
      },
      {
        input: "client1 , client2 , client3",
        expected: ["client1", "client2", "client3"],
      },
      { input: "single-client", expected: ["single-client"] },
    ].forEach(({ input, expected }) => {
      it(`should return ${JSON.stringify(expected)} when set to '${input}'`, () => {
        process.env.PASSKEY_PROMPT_CLIENT_DENY_LIST = input;
        expect(getPasskeyPromptClientDenyList()).to.deep.equal(expected);
      });
    });

    it("should return empty array when not set", () => {
      delete process.env.PASSKEY_PROMPT_CLIENT_DENY_LIST;
      expect(getPasskeyPromptClientDenyList()).to.deep.equal([]);
    });
  });
});
