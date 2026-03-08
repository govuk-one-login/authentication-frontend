import type { ApiResponseResult, DefaultApiResponse } from "../../../types.js";
import type { Request, Response } from "express";

export interface UpdateProfileServiceInterface {
  updateProfile: (
    email: string,
    requestType: RequestType,
    req: Request,
    res: Response
  ) => Promise<ApiResponseResult<DefaultApiResponse>>;
}

export interface RequestType {
  profileInformation: string | boolean;
  updateProfileType: UpdateType;
}

export enum UpdateType {
  "ADD_PHONE_NUMBER" = "ADD_PHONE_NUMBER",
  "CAPTURE_CONSENT" = "CAPTURE_CONSENT",
  "REGISTER_AUTH_APP" = "REGISTER_AUTH_APP",
  "UPDATE_TERMS_CONDS" = "UPDATE_TERMS_CONDS",
}
