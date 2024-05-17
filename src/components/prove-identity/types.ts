import { ApiResponseResult, DefaultApiResponse } from "../../types";

export interface IPVAuthorisationResponse extends DefaultApiResponse {
  redirectUri?: string;
}
