import { EMAIL } from "../support/constants";

export const successfulSignUpResponse = {
  status: 200,
  body: {
    email: EMAIL,
    consentRequired: false,
  },
};

export const commonPasswordSignUpResponse = {
  status: 400,
  body: {
    code: 1040,
    message: "Password is too common",
  },
};
