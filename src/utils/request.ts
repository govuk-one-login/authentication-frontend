import type { Request } from "express";
import { supportAccountRecovery, supportReauthentication } from "../config.js";
import {
  CONTACT_US_THEMES,
  SERVICE_TYPE,
  SUPPORT_TYPE,
} from "../app.constants.js";
export const isReauth = (req: Request): boolean =>
  supportReauthentication() && Boolean(req.session?.user?.reauthenticate);

export const isUpliftRequired = (req: Request): boolean =>
  Boolean(req.session?.user?.isUpliftRequired);

export const isAccountRecoveryJourney = (req: Request): boolean =>
  Boolean(req.session?.user?.isAccountRecoveryJourney);

export const isAccountRecoveryJourneyAndEnabled = (req: Request): boolean =>
  Boolean(
    supportAccountRecovery() &&
      req.session?.user?.isAccountRecoveryJourney &&
      req.session?.user?.isAccountRecoveryPermitted
  );

export const isContactUsSuggestionsFeedbackSubtheme = (req: Request): boolean =>
  req.query?.subtheme === CONTACT_US_THEMES.SUGGESTIONS_FEEDBACK;

export const clientIsOneLogin = (req: Request): boolean =>
  Boolean(req.session?.client?.isOneLoginService);

export const clientUsesOneLoginOptionally = (req: Request): boolean =>
  req.session?.client?.serviceType === SERVICE_TYPE.OPTIONAL;

export const supportTypeIsGovService = (req: Request): boolean =>
  Boolean(
    req.query?.supportType === SUPPORT_TYPE.GOV_SERVICE ||
      req.body?.supportType === SUPPORT_TYPE.GOV_SERVICE
  );

export const urlContains = (req: Request, str: string): boolean =>
  Boolean(req.originalUrl?.includes(str));
