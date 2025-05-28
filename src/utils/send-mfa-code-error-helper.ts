import type { ApiResponseResult, DefaultApiResponse } from "../types.js";
import type { Response } from "express";
import {
  ERROR_CODES,
  getErrorPathByCode,
} from "../components/common/constants.js";
import { BadRequestError } from "./error.js";

export const handleSendMfaCodeError = (
  result: ApiResponseResult<DefaultApiResponse>,
  res: Response
): void => {
  if (result.data.code === ERROR_CODES.MFA_CODE_REQUESTS_BLOCKED) {
    return res.render("security-code-error/index-wait.njk");
  }

  if (result.data.code === ERROR_CODES.ENTERED_INVALID_MFA_MAX_TIMES) {
    return res.render(
      "security-code-error/index-security-code-entered-exceeded.njk",
      {
        show2HrScreen: true,
        contentId: "727a0395-cc00-48eb-a411-bfe9d8ac5fc8",
      }
    );
  }

  const path = getErrorPathByCode(result.data.code);

  if (path) {
    return res.redirect(path);
  }

  throw new BadRequestError(result.data.message, result.data.code);
};
