import { EMAIL } from "../support/constants";

export const successfulSignUpResponse = {
  status: 200,
  body: {
    email: EMAIL,
    consentRequired: false,
  },
};
