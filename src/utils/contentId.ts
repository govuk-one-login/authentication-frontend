import { Request } from "express";
import { supportReauthentication } from "../config";
import { ContentIdVariants } from "../types";

export function getContentId(
  req: Request,
  contentIds: {
    [path: string]: ContentIdVariants;
  }
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
