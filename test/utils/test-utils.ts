import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";
import type { Test } from "supertest";
import supertest from "supertest";
import { expectAnalyticsPropertiesMatchSnapshot } from "../helpers/expect-response-helpers.js";
import type TestAgent from "supertest/lib/agent";

chai.should();
chai.use(sinonChai);
chai.use(jestSnapshotPlugin());

const expect = chai.expect;

const request = (
  app: any,
  callback: (test: TestAgent) => Test,
  options: {
    expectAnalyticsPropertiesMatchSnapshot?: boolean;
  } = {}
): supertest.Test => {
  let test = callback(supertest(app));
  if (options.expectAnalyticsPropertiesMatchSnapshot !== false) {
    test = test.expect(expectAnalyticsPropertiesMatchSnapshot);
  }
  return test;
};

export { expect, sinon, request };
