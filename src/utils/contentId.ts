import { Request } from "express";
import { supportReauthentication } from "../config";
import { ContentIdVariants } from "../types";

export function getContentId(
  req: Request,
  contentIds: {
    [path: string]: ContentIdVariants;
  }
): string {
  const isMobile = Boolean(res.locals.strategicAppChannel); // TODO check this is set in time
  const clientIsOneLogin = Boolean(req.session.client.isOneLoginService);
  const clientUsesOneLoginOptionally = Boolean(req.session.client.serviceType);
  const isReauth =
    supportReauthentication() && Boolean(req?.session?.user?.reauthenticate);
  const isUpliftRequired = Boolean(req?.session?.user?.isUpliftRequired);

  const supportedPaths = Object.keys(contentIds);
  const matchedSupportedPath = supportedPaths.find((path) => req.path === path);
  const contentId = matchedSupportedPath && contentIds[matchedSupportedPath];

  if (!contentId) {
    return "";
  }

  if (isMobile && contentId.mobile) {
    return contentId.mobile;
  } else if (clientIsOneLogin && contentId.clientIsOneLogin) {
    return contentId.clientIsOneLogin;
  } else if (
    clientUsesOneLoginOptionally &&
    contentId.clientUsesOneLoginOptionally
  ) {
    return contentId.clientUsesOneLoginOptionally;
  } else if (isReauth && contentId.reauth) {
    return contentId.reauth;
  } else if (isUpliftRequired && contentId.upliftRequired) {
    return contentId.upliftRequired;
  } else {
    return contentId.default;
  }
}
