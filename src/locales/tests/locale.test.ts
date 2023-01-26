import { expect } from "chai";
import { describe } from "mocha";
import englishTranslations from "../en/translation.json";
import welshTranslations from "../cy/translation.json";

export function traverseObjectProperties(
  obj: any,
  func: (key: string, value: string) => void
): any {
  const properties = Object.keys(obj);
  properties.forEach((i) => {
    if (obj[i] === Object(obj[i])) {
      return traverseObjectProperties(obj[i], func);
    }
    func(i, obj[i]);
  });
}

export function testExpectation(key: string, value: string): void {
  expect(value).to.not.contain(
    "'",
    "translated values should not contain typographically incorrect quotes (aka 'straight quotes')"
  );
}

describe("locale files", () => {
  it("should not contain any typographically incorrect quotes (aka 'straight quotes') in Welsh translations", () => {
    traverseObjectProperties(welshTranslations, testExpectation);
  });
  it("should not contain any typographically incorrect quotes (aka 'straight quotes') in English translations", () => {
    traverseObjectProperties(englishTranslations, testExpectation);
  });
});
