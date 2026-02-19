import type { Http } from "../../utils/http.js";
import {
  createApiResponse,
  getInternalRequestConfigWithSecurityHeaders,
  http,
} from "../../utils/http.js";
import { API_ENDPOINTS } from "../../app.constants.js";
import type { CreatePasswordServiceInterface } from "./types.js";
import type { ApiResponseResult, DefaultApiResponse } from "../../types.js";
import type { Request, Response } from "express";

export function createPasswordService(
  axios: Http = http
): CreatePasswordServiceInterface {
  const signUpUser = async function (
    emailAddress: string,
    password: string,
    req: Request,
    res: Response
  ): Promise<ApiResponseResult<DefaultApiResponse>> {
    const response = await axios.client.post<DefaultApiResponse>(
      API_ENDPOINTS.SIGNUP_USER,
      {
        email: emailAddress,
        password: password,
      },
      getInternalRequestConfigWithSecurityHeaders(
        req,
        res,
        API_ENDPOINTS.SIGNUP_USER
      )
    );

    return createApiResponse<DefaultApiResponse>(response);
  };

  return {
    signUpUser,
  };
}
