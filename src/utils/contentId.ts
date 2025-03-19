import { Request } from "express";
import { supportReauthentication } from "../config";
import { ContentIdVariants } from "../types";
import { PATH_NAMES } from "../app.constants";

export const CONTENT_IDS: {
  [path: string]: ContentIdVariants;
} = {
  [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES]: {
    default: "d9290539-0b0c-468f-8f87-22d0400b6431",
  },
  [PATH_NAMES.CANNOT_CHANGE_SECURITY_CODES_IDENTITY_FAIL]: {
    default: "d1b7cd24-f508-49ce-bf0d-ac1fe980c09c",
  },
  [PATH_NAMES.ENTER_AUTHENTICATOR_APP_CODE]: {
    default: "89461417-df3f-46a8-9c37-713b9dd78085",
    reauth: "6e5cc49f-4770-4089-8547-06149e0f59b1",
    upliftRequired: "",
  },
  [PATH_NAMES.ENTER_EMAIL_SIGN_IN]: {
    default: "d8767bcf-ffb8-4b43-8bda-24c6291590bb",
    reauth: "aff1628e-177d-4afc-825b-56e926b2fc1f",
  },
  [PATH_NAMES.ENTER_MFA]: {
    default: "19601dd7-be55-4ab6-aa44-a6358c4239dc",
    reauth: "c9f09429-b29d-421e-a33a-41149489a0a2",
    upliftRequired: "",
  },
  [PATH_NAMES.ENTER_PASSWORD]: {
    default: "6b9f2243-d217-4c55-8ef3-7ac24b1f77e2",
    reauth: "c6f4fed1-ee6d-4d23-a14f-4466e9c1349c",
  },
  [PATH_NAMES.RESEND_MFA_CODE]: {
    default: "f463a280-31f1-43c0-a2f5-6b46b1e2bb15",
    reauth: "a2776ef7-9ef3-4d8d-bdbc-3f798b15e5d4",
  },
};

export function getContentId(
  req: Request,
  contentIds: {
    [path: string]: ContentIdVariants;
  } = CONTENT_IDS
): string {
  const isReauth =
    supportReauthentication() && Boolean(req?.session?.user?.reauthenticate);
  const isUpliftRequired = Boolean(req?.session?.user?.isUpliftRequired);

  const supportedPaths = Object.keys(contentIds);
  const matchedSupportedPath = supportedPaths.find((path) => req.path === path);
  const contentId = matchedSupportedPath && contentIds[matchedSupportedPath];

  if (contentId) {
    if (isReauth && contentId.reauth) {
      return contentId.reauth;
    } else if (isUpliftRequired && contentId.upliftRequired) {
      return contentId.upliftRequired;
    } else {
      return contentId.default;
    }
  }

  return "";
}
