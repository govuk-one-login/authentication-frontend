import { describe } from "mocha";
import { request, sinon } from "../../../../test/utils/test-utils.js";
import nock from "nock";
import { PATH_NAMES } from "../../../app.constants.js";

describe("Integration::how do you want security codes", () => {
  let app: any;

  before(async () => {
    app = await (await import("../../../app.js")).createApp();
  });

  beforeEach(() => {
    nock.cleanAll();
  });

  after(() => {
    sinon.restore();
    app = undefined;
  });

  it("should return how do you want security codes page", (done) => {
    request(app, (test) =>
      test.get(PATH_NAMES.HOW_DO_YOU_WANT_SECURITY_CODES).expect(200, done)
    );
  });
});
