import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";
import supertest from "supertest";
import { expectTaxonomyMatchSnapshot } from "../helpers/expect-taxonomy-helpers";

chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(jestSnapshotPlugin());

const expect = chai.expect;

const request = (
  app: any,
  callback: (test: supertest.SuperTest<supertest.Test>) => supertest.Test,
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
