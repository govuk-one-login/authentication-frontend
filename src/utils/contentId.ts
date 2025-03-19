import { Request } from "express";
import { supportReauthentication } from "../config";
import { ContentId, isCustomContentIdFunction } from "../types";
import { PATH_NAMES } from "../app.constants";

const isReauth = (req: Request) =>
  supportReauthentication() && Boolean(req?.session?.user?.reauthenticate);
const isUpliftRequired = (req: Request) =>
  Boolean(req?.session?.user?.isUpliftRequired);

export const CONTENT_IDS: {
  [path: string]: ContentId;
} = {
  [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES]:
    "d9290539-0b0c-468f-8f87-22d0400b6431",
  [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL]:
    "d1b7cd24-f508-49ce-bf0d-ac1fe980c09c",
  [PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE]: (req: Request) => {
    if (isReauth(req)) {
      return "6e5cc49f-4770-4089-8547-06149e0f59b1";
    }
    if (isUpliftRequired(req)) {
      return "";
    }
    return "89461417-df3f-46a8-9c37-713b9dd78085";
  },
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
  [PATH_NAMES.RESEND_MFA_CODE]: (req: Request) =>
    isReauth(req)
      ? "a2776ef7-9ef3-4d8d-bdbc-3f798b15e5d4"
      : "f463a280-31f1-43c0-a2f5-6b46b1e2bb15",
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
