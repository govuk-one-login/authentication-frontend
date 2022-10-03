import { expect } from "chai";
import { describe } from "mocha";

import { sinon } from "../../../../test/utils/test-utils";
import { Request, Response } from "express";
import {
  mockRequest,
  mockResponse,
  RequestOutput,
  ResponseOutput,
} from "mock-req-res";

import {
  IPV_ERROR_CODES,
  OIDC_ERRORS,
  PATH_NAMES,
} from "../../../app.constants";
import {
  noPhotoIdGet,
  noPhotoIdPost,
  photoIdGet,
  photoIdPost,
} from "../photo-id-controller";

describe("photo-id controller", () => {
  let req: RequestOutput;
  let res: ResponseOutput;

  const STATE = "ndhd7d7d";

  beforeEach(() => {
    req = mockRequest({
      path: PATH_NAMES.PROVE_IDENTITY_WELCOME,
      session: {
        client: {
          redirectUri: "http://someservice.com/auth",
          state: STATE,
        },
        user: {},
      },
      log: { info: sinon.fake() },
      t: sinon.fake(),
      i18n: { language: "en" },
    });
    res = mockResponse();
  });

  afterEach(() => {
    sinon.restore();
  });

  describe("photoIdGet", () => {
    it("Should render photo-id page for user to confirm they have a photo id", async () => {
      photoIdGet(req as Request, res as Response);
      expect(res.render).to.have.been.calledWith("photo-id/index.njk");
    });
  });

  describe("photoIdPost", () => {
    it("Should redirect to Create or sign in when use selects Yes", () => {
      req.body.havePhotoId = "true";
      photoIdPost(req as Request, res as Response);
      expect(res.redirect).to.have.been.calledWith(
        PATH_NAMES.SIGN_IN_OR_CREATE
      );
    });

    it("Should redirect to no photo id when use selects No", () => {
      req.body.havePhotoId = "false";
      photoIdPost(req as Request, res as Response);
      expect(res.redirect).to.have.been.calledWith(PATH_NAMES.NO_PHOTO_ID);
    });
  });

  describe("noPhotoIdGet", () => {
    it("Should render no-photo-id page", async () => {
      noPhotoIdGet(req as Request, res as Response);
      expect(res.render).to.have.been.calledWith(
        "photo-id/index-no-photo-id.njk"
      );
    });
  });

  describe("noPhotoIdPost", () => {
    it("Should red", async () => {
      noPhotoIdPost(req as Request, res as Response);

      expect(res.redirect).to.have.been.calledWith(
        `http://someservice.com/auth?error=${
          OIDC_ERRORS.ACCESS_DENIED
        }&error_description=${encodeURIComponent(
          IPV_ERROR_CODES.ACCOUNT_NOT_CREATED
        )}&state=${encodeURIComponent(STATE)}`
      );
    });
  });
});
