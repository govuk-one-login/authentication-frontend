import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";
import supertest, { Test } from "supertest";
import { expectTaxonomyMatchSnapshot } from "../helpers/expect-taxonomy-helpers";
import TestAgent = require("supertest/lib/agent");

chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(jestSnapshotPlugin());

const expect = chai.expect;

const request = (
  app: any,
  callback: (test: TestAgent) => Test,
  options: {
    expectTaxonomyMatchSnapshot?: boolean;
  } = {}
): supertest.Test => {
  let test = callback(supertest(app));
  if (options.expectTaxonomyMatchSnapshot !== false) {
    test = test.expect(expectTaxonomyMatchSnapshot);
  }
  return test;
};

export { expect, sinon, request };
