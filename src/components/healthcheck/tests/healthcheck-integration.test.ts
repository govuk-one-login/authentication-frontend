import { describe } from "mocha";
import { request, sinon } from "../../../../test/utils/test-utils.js";
import { PATH_NAMES } from "../../../app.constants.js";

describe("Integration::healthcheck", () => {
  let sandbox: sinon.SinonSandbox;
  let app: any;

  before(async () => {
    sandbox = sinon.createSandbox();
    app = await (await import("../../../app.js")).createApp();
  });

  after(() => {
    sandbox.restore();
    sinon.restore();
    app = undefined;
  });

  it("healthcheck should return 200 OK", async () => {
    await request(app, (test) => test.get(PATH_NAMES.HEALTHCHECK).expect(200));
  });
});
