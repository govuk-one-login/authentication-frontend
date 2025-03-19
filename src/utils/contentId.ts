import { Request } from "express";
import { supportAccountRecovery, supportReauthentication } from "../config";
import { ContentId, isCustomContentIdFunction } from "../types";
import { CONTACT_US_THEMES, PATH_NAMES, SUPPORT_TYPE } from "../app.constants";

const isReauth = (req: Request) =>
  supportReauthentication() && Boolean(req?.session?.user?.reauthenticate);
const isUpliftRequired = (req: Request) =>
  Boolean(req?.session?.user?.isUpliftRequired);
const isAccountRecoveryJourney = (req: Request) =>
  req.session.user.isAccountRecoveryJourney;
const isAccountRecoveryJourneyAndEnabled = (req: Request) =>
  req.session.user.isAccountRecoveryJourney &&
  req.session.user.isAccountRecoveryPermitted &&
  supportAccountRecovery();
const isContactUsSuggestionsFeedbackTheme = (req: Request) =>
  req.query.subtheme === CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK;
const clientIsOneLogin = (req: Request) =>
  Boolean(req.session?.client?.isOneLoginService);
const clientUsesOneLoginOptionally = (req: Request) =>
  Boolean(req.session?.client?.serviceType);
const supportTypeIsGovService = (req: Request) =>
  req.query.supportType === SUPPORT_TYPE.GOV_SERVICE;
const urlContains = (req: Request, str: string) =>
  req.originalUrl.includes(str);

export const CONTENT_IDS: {
  [path: string]: ContentId;
} = {
  [PATH_NAMES.ACCESSIBILITY_STATEMENT]: "",
  [PATH_NAMES.ACCOUNT_NOT_FOUND]: (req: Request) =>
    clientIsOneLogin(req) || clientUsesOneLoginOptionally(req)
      ? "a70b71e7-b444-46e5-895c-cd2e27bbe6ba"
      : "10e1b70b-e208-4db8-8863-3679a675b51d",
  [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES]:
    "d9290539-0b0c-468f-8f87-22d0400b6431",
  [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL]:
    "d1b7cd24-f508-49ce-bf0d-ac1fe980c09c",
  [PATH_NAMES.CHANGE_SECURITY_CODES_CONFIRMATION]:
    "1abedb1b-7d09-4e81-9f88-a8b4297635b3",
  [PATH_NAMES.CHECK_YOUR_EMAIL]: "054e1ea8-97a8-461a-a964-07345c80098e",
  [PATH_NAMES.CHECK_YOUR_EMAIL_CHANGE_SECURITY_CODES]: (req: Request) =>
    isAccountRecoveryJourney(req)
      ? "e768e27b-1c4d-48ba-8bcf-4c40274a6441"
      : "95e26313-bc2f-49bc-bc62-fd715476c1d9",
  [PATH_NAMES.CHECK_YOUR_PHONE]: "1fef9388-34cd-4ea2-b899-a66b7327d2f7",
  [PATH_NAMES.CREATE_ACCOUNT_ENTER_PHONE_NUMBER]: (req: Request) =>
    isAccountRecoveryJourneyAndEnabled(req)
      ? "cbca1676-f632-4937-984e-1ae5934d13e2"
      : "0f519eb6-5cd4-476f-968f-d847b3c4c034",
  [PATH_NAMES.CREATE_ACCOUNT_SETUP_AUTHENTICATOR_APP]: (req: Request) =>
    isAccountRecoveryJourney(req)
      ? "124051ef-673a-4eda-b585-96d9d711f545"
      : "5bc82db9-2012-44bf-9a7d-34d1d22fb035",
  [PATH_NAMES.CONTACT_US]: (req: Request) =>
    supportTypeIsGovService(req) ? "" : "e08d04e6-b24f-4bad-9955-1eb860771747",
  [PATH_NAMES.CONTACT_US_FURTHER_INFORMATION]:
    "a06d6387-d411-47db-8f7d-88871286330b",
  [PATH_NAMES.CONTACT_US_QUESTIONS]: (req: Request) =>
    isContactUsSuggestionsFeedbackTheme(req)
      ? "94ff0276-9791-4a74-95c4-8210ec4028f7"
      : "",
  [PATH_NAMES.CONTACT_US_SUBMIT_SUCCESS]:
    "0e020971-d828-4679-97fe-23af6e96ab14",
  [PATH_NAMES.COOKIES_POLICY]: "",
  [PATH_NAMES.CREATE_ACCOUNT_SET_PASSWORD]:
    "8c0cc624-2e97-471d-ad36-6b695f9a038d",
  [PATH_NAMES.CREATE_ACCOUNT_SUCCESSFUL]:
    "6857e410-75b8-4807-b475-3f24fc96c9de",
  [PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE]: (req: Request) => {
    if (isReauth(req)) {
      return "6e5cc49f-4770-4089-8547-06149e0f59b1";
    }
    if (isUpliftRequired(req)) {
      return "";
    }
    return "89461417-df3f-46a8-9c37-713b9dd78085";
  },
  [PATH_NAMES.ENTER_EMAIL_CREATE_ACCOUNT]:
    "390f46f9-1f6b-44f2-8fd7-21a5385a7d3a",
  [PATH_NAMES.ENTER_EMAIL_SIGN_IN]: (req: Request) =>
    isReauth(req)
      ? "aff1628e-177d-4afc-825b-56e926b2fc1f"
      : "d8767bcf-ffb8-4b43-8bda-24c6291590bb",
  [PATH_NAMES.ENTER_MFA]: (req: Request) => {
    if (isReauth(req)) {
      return "c9f09429-b29d-421e-a33a-41149489a0a2";
    }
    if (isUpliftRequired(req)) {
      return "";
    }
    return "19601dd7-be55-4ab6-aa44-a6358c4239dc";
  },
  [PATH_NAMES.ENTER_PASSWORD]: (req: Request) =>
    isReauth(req)
      ? "c6f4fed1-ee6d-4d23-a14f-4466e9c1349c"
      : "6b9f2243-d217-4c55-8ef3-7ac24b1f77e2",
  [PATH_NAMES.GET_SECURITY_CODES]: (req: Request) =>
    isAccountRecoveryJourney(req)
      ? "e768e27b-1c4d-48ba-8bcf-4c40274a6441"
      : "95e26313-bc2f-49bc-bc62-fd715476c1d9",
  [PATH_NAMES.PASSWORD_RESET_REQUIRED]: "",
  [PATH_NAMES.PRIVACY_POLICY]: "",
  [PATH_NAMES.PRIVACY_STATEMENT]: "",
  [PATH_NAMES.PROVE_IDENTITY_CALLBACK]: "",
  [PATH_NAMES.PROVE_IDENTITY_CALLBACK_SESSION_EXPIRY_ERROR]: "",
  [PATH_NAMES.RESEND_EMAIL_CODE]: "3104ec55-1a4e-4811-b927-0531fb315480",
  [PATH_NAMES.RESEND_MFA_CODE]: (req: Request) =>
    isReauth(req)
      ? "a2776ef7-9ef3-4d8d-bdbc-3f798b15e5d4"
      : "f463a280-31f1-43c0-a2f5-6b46b1e2bb15",
  [PATH_NAMES.RESET_PASSWORD]: "c8520c6c-9f09-4edf-8c99-7123a3991cfc",
  [PATH_NAMES.RESET_PASSWORD_2FA_AUTH_APP]:
    "943b41f4-8262-417f-8866-c0639319ccf0",
  [PATH_NAMES.RESET_PASSWORD_2FA_SMS]: "",
  [PATH_NAMES.RESET_PASSWORD_CHECK_EMAIL]: (req: Request) => {
    if (urlContains(req, "csrf")) {
      return "e48886d5-7be8-424d-8471-d9a9bf49d1b7";
    }
    if (urlContains(req, "requestcode")) {
      return "8cbc57f9-28df-4279-a001-cc62a9dd3415";
    }
    return "b78d016b-0f2c-4599-9c2f-76b3a6397997";
  },
  [PATH_NAMES.RESET_PASSWORD_REQUIRED]: "c8520c6c-9f09-4edf-8c99-7123a3991cfc",
  [PATH_NAMES.RESET_PASSWORD_RESEND_CODE]:
    "7b663466-8001-436f-b10b-e6ac581d39aa",
  [PATH_NAMES.SECURITY_CODE_INVALID]: "fdbcdd69-a2d5-4aee-97f2-d65d8f307dc5",
  [PATH_NAMES.SECURITY_CODE_REQUEST_EXCEEDED]:
    "445409a8-2aaf-47fc-82a9-b277eca4601d",
  [PATH_NAMES.SECURITY_CODE_WAIT]: "1277915f-ce6e-4a06-89a0-e3458f95631a",
  [PATH_NAMES.SIGNED_OUT]: "83a49745-773f-49f6-aa15-58399e9a856c",
  [PATH_NAMES.SIGN_IN_OR_CREATE]: "9cd55996-3f12-4e79-adf3-0ec3c4faf7ce",
  [PATH_NAMES.SUPPORT]: "",
  [PATH_NAMES.TERMS_AND_CONDITIONS]: "",
  [PATH_NAMES.UNAVAILABLE_PERMANENT]: "",
  [PATH_NAMES.UNAVAILABLE_TEMPORARY]: "895deac9-e21d-4991-b1f7-9509c2d8c10e",
  [PATH_NAMES.UPDATED_TERMS_AND_CONDITIONS]: "",
};

export function getContentId(
  req: Request,
  contentIds: {
    [path: string]: ContentId;
  } = CONTENT_IDS
): string {
  const supportedPaths = Object.keys(contentIds);
  const matchedSupportedPath = supportedPaths.find((path) => req.path === path);
  const contentId = matchedSupportedPath && contentIds[matchedSupportedPath];

  if (!contentId) {
    return "";
  }

  if (isCustomContentIdFunction(contentId)) {
    return contentId(req);
  }

  return contentId;
}
