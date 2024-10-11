import chai from "chai";
import sinon from "sinon";
import sinonChai from "sinon-chai";
import chaiAsPromised from "chai-as-promised";
import { jestSnapshotPlugin } from "mocha-chai-jest-snapshot";
import supertest from "supertest";
import { expectAnalyticsPropertiesMatchSnapshot } from "../helpers/expect-response-helpers";

chai.should();
chai.use(sinonChai);
chai.use(chaiAsPromised);
chai.use(jestSnapshotPlugin());

const expect = chai.expect;

const request = (
  app: any,
  callback: (test: supertest.SuperTest<supertest.Test>) => supertest.Test,
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
