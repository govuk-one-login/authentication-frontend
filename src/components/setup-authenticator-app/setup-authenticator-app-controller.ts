import { Request, Response } from "express";
import QRCode from "qrcode";
import {
  UpdateProfileServiceInterface,
  UpdateType,
} from "../common/update-profile/types";
import { updateProfileService } from "../common/update-profile/update-profile-service";
import { ExpressRouteFunc } from "../../types";
import { ERROR_CODES, getNextPathAndUpdateJourney } from "../common/constants";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { setupAuthAppService } from "./setup-authenticator-app-service";
import { generateQRCodeValue } from "../../utils/mfa";
import { BadRequestError } from "../../utils/error";
import {
  formatValidationError,
  renderBadRequest,
} from "../../utils/validation";
import { AuthAppServiceInterface } from "./types";

const TEMPLATE = "setup-authenticator-app/index.njk";

export async function setupAuthenticatorAppGet(
  req: Request,
  res: Response
): Promise<void> {
  const qrCodeText = generateQRCodeValue(
    req.session.user.authAppSecret,
    req.session.user.email
  );

  const qrCodeUrl = await QRCode.toDataURL(qrCodeText);

  res.render(TEMPLATE, {
    qrCode: qrCodeUrl,
    secretKey: req.session.user.authAppSecret,
  });
}

export function setupAuthenticatorAppPost(
  service: AuthAppServiceInterface = setupAuthAppService(),
  profileService: UpdateProfileServiceInterface = updateProfileService()
): ExpressRouteFunc {
  return async function (req: Request, res: Response) {
    const { email, authAppSecret } = req.session.user;
    const { sessionId, clientSessionId, persistentSessionId } = res.locals;
    const code = req.body.code;

    const updateProfileResponse = await profileService.updateProfile(
      sessionId,
      clientSessionId,
      email,
      {
        profileInformation: authAppSecret,
        updateProfileType: UpdateType.REGISTER_AUTH_APP,
      },
      req.ip,
      persistentSessionId
    );

    if (!updateProfileResponse.success) {
      throw new BadRequestError(
        updateProfileResponse.data.message,
        updateProfileResponse.data.code
      );
    }

    const verifyAccessCodeRes = await service.verifyAccessCode(
      code,
      req.ip,
      sessionId,
      persistentSessionId
    );

    if (!verifyAccessCodeRes.success) {
      if (verifyAccessCodeRes.data.code === ERROR_CODES.AUTH_APP_INVALID_CODE) {
        const error = formatValidationError(
          "code",
          req.t("pages.setupAuthenticatorApp.code.validationError.invalidCode")
        );
        return renderBadRequest(res, req, TEMPLATE, error);
      }

      throw new BadRequestError(
        verifyAccessCodeRes.data.message,
        verifyAccessCodeRes.data.code
      );
    }

    req.session.user.authAppSecret = null;

    return res.redirect(
      getNextPathAndUpdateJourney(
        req,
        req.path,
        USER_JOURNEY_EVENTS.MFA_CODE_VERIFIED,
        {
          isIdentityRequired: req.session.user.isIdentityRequired,
        },
        sessionId
      )
    );
  };
}
