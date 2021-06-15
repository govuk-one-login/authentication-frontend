import { expect } from "chai";
import { describe } from "mocha";
import { sinon } from "../utils/testUtils";
import { pageNotFoundHandler } from "../../src/error-handler";
import { NextFunction } from "express";

describe("Error handlers", () => {
  describe("pageNotFoundHandler", () => {
    it("should render 404 view", () => {
      const status = sinon.fake();
      const req: any = {};
      const res: any = { render: sinon.fake(), status };
      const nextFunction: NextFunction = sinon.fake();

      pageNotFoundHandler(req, res, nextFunction);

      expect(status).to.be.calledOnceWith(404);
      expect(res.render).to.have.calledOnceWith("errors/404.html");
    });
  });
});
