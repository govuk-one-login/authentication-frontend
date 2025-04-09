import { expect } from "chai";
import { describe } from "mocha";
import { getRefererFrom } from "../../../src/utils/logger.js";
describe("logger", () => {
  describe("getRefererFrom", () => {
    it("should return path from a url", () => {
      expect(getRefererFrom("http://localhost:8080/hello")).to.equal("/hello");
    });

    it("should return path from a gov.uk url", () => {
      expect(getRefererFrom("http://gov.uk/hello")).to.equal("/hello");
    });

    it("should return path from an https gov.uk url", () => {
      expect(getRefererFrom("https://gov.uk/hello")).to.equal("/hello");
    });

    it("should return path from a url without port", () => {
      expect(getRefererFrom("http://localhost/hello")).to.equal("/hello");
    });

    it("should return a longer path from a url", () => {
      expect(
        getRefererFrom("http://localhost:8080/hello/good/morning")
      ).to.equal("/hello/good/morning");
    });

    it("should return path but not a query param from a url", () => {
      expect(getRefererFrom("http://localhost:8080/hello?world=true")).to.equal(
        "/hello"
      );
    });

    it("should not return query only from a url", () => {
      expect(getRefererFrom("http://localhost:8080?world=true")).to.equal("/");
    });

    it("should return a longer path but not a query param from a url", () => {
      expect(
        getRefererFrom("http://localhost:8080/hello/good/morning?world=true")
      ).to.equal("/hello/good/morning");
    });

    it("should return a longer path but not two query params from a url", () => {
      expect(
        getRefererFrom(
          "http://localhost:8080/hello/good/morning?world=true&morning=good"
        )
      ).to.equal("/hello/good/morning");
    });

    it("should return empty path from a url", () => {
      expect(getRefererFrom("http://localhost:8080")).to.equal("/");
    });

    it("should return empty path from a url ending with /", () => {
      expect(getRefererFrom("http://localhost:8080/")).to.equal("/");
    });

    it("should return undefined for null url", () => {
      expect(getRefererFrom(null)).to.equal(undefined);
    });

    it("should return undefined for undefined url", () => {
      expect(getRefererFrom(undefined)).to.equal(undefined);
    });

    it("should return undefined for invalid url", () => {
      expect(getRefererFrom("hello")).to.equal(undefined);
    });

    it("should return undefined for invalid protocol", () => {
      expect(getRefererFrom("https;//hello")).to.equal(undefined);
    });

    it("should return undefined for invalid port", () => {
      expect(getRefererFrom("https://localhost:hello")).to.equal(undefined);
    });
  });
});
