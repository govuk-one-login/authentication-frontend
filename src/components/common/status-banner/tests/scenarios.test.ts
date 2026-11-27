import { expect } from "chai";
import { describe, it } from "mocha";
import englishTranslations from "../../../../locales/en/translation.json";
import welshTranslations from "../../../../locales/cy/translation.json";
import { PATH_NAMES } from "../../../../app.constants.js";
import {
  ALL_PAGES,
  STATUS_BANNER_SCENARIOS,
  getStatusBannerScenario,
  paragraphsTranslationKey,
  singleLineTranslationKeys,
} from "../scenarios.js";

function lookup(translations: unknown, key: string): unknown {
  return key
    .split(".")
    .reduce<unknown>(
      (node, part) =>
        node && typeof node === "object"
          ? (node as Record<string, unknown>)[part]
          : undefined,
      translations
    );
}

describe("status banner scenarios", () => {
  const knownPaths = Object.values(PATH_NAMES) as string[];

  Object.entries(STATUS_BANNER_SCENARIOS).forEach(([id, scenario]) => {
    describe(id, () => {
      const languages = [
        { name: "English", translations: englishTranslations },
        { name: "Welsh", translations: welshTranslations },
      ];

      languages.forEach(({ name, translations }) => {
        singleLineTranslationKeys(scenario).forEach((key) => {
          it(`should have ${name} copy for ${key}`, () => {
            expect(lookup(translations, key)).to.be.a("string").and.not.empty;
          });
        });

        it(`should have ${name} paragraphs for ${paragraphsTranslationKey(scenario)}`, () => {
          const paragraphs = lookup(
            translations,
            paragraphsTranslationKey(scenario)
          );
          expect(paragraphs).to.be.an("array").and.not.empty;
          (paragraphs as unknown[]).forEach((paragraph) => {
            expect(paragraph).to.be.a("string").and.not.empty;
          });
        });
      });

      it("should only target known pages", () => {
        if (scenario.shownOnPaths === ALL_PAGES) {
          return;
        }
        expect(scenario.shownOnPaths).to.not.be.empty;
        scenario.shownOnPaths.forEach((path) => {
          expect(knownPaths, `unknown path ${path}`).to.include(path);
        });
      });
    });
  });

  describe("getStatusBannerScenario", () => {
    it("should return the scenario for a known id", () => {
      expect(getStatusBannerScenario("sms-delays")).to.equal(
        STATUS_BANNER_SCENARIOS["sms-delays"]
      );
    });

    ["not-a-scenario", "toString", "__proto__"].forEach((id) => {
      it(`should return undefined for '${id}'`, () => {
        expect(getStatusBannerScenario(id)).to.be.undefined;
      });
    });
  });
});
