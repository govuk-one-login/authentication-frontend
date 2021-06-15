import { expect } from "chai";
import { describe } from "mocha";
import { enterEmailGet } from "../../../src/controllers/enter-email-controller";
import { sinon } from "../../utils/testUtils";
import Logger from "../../../src/utils/logger";

describe("Error Handlers", () => {
  let sandbox: sinon.SinonSandbox;
  let req: any;
  let res: any;

  const logger: Logger = new Logger();
  beforeEach(() => {
    sandbox = sinon.createSandbox();

    req = {};
    res = {};

    res.type = sandbox.stub() as (type: string) => Response;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("enter-email get", () => {
    it("should render enter email view", () => {
      const req: any = {};
      const res: any = { render: sandbox.fake() };

      enterEmailGet(req, res);

      expect(res.render).to.have.calledWith("enter-email.html");
    });
  });
});
