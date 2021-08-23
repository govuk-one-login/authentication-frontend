import {Request, Response} from "express";
import {PATH_NAMES} from "../../app.constants";
import {ExpressRouteFunc} from "../../types";
import {updateTermsAndCondsService} from "./updated-terms-conds-service";
import {ClientInfoResponse, UpdateTermsAndCondsServiceInterface,} from "./types";

export function updatedTermsCondsGet(
    service: UpdateTermsAndCondsServiceInterface = updateTermsAndCondsService()
): ExpressRouteFunc {
    return async function (req: Request, res: Response) {
        const clientInfo = await callClientInfo(req, res, service);
        req.session.redirectUri = clientInfo.redirectUri;
        req.session.state = clientInfo.state;

        res.render("updated-terms-conds/index.njk");
    };
}

export function updatedTermsCondsMandatoryGet(
    service: UpdateTermsAndCondsServiceInterface = updateTermsAndCondsService()
): ExpressRouteFunc {
    return async function (req: Request, res: Response) {
        const clientInfo = await callClientInfo(req, res, service);
        req.session.redirectUri = clientInfo.redirectUri;
        req.session.state = clientInfo.state;

        const view = clientInfo.serviceType === "mandatory" ? "index-mandatory.njk" : "index.njk";

        return res.render("updated-terms-conds/" + view);
    };
}

export function updatedTermsCondsOptionalGet(
    service: UpdateTermsAndCondsServiceInterface = updateTermsAndCondsService()
): ExpressRouteFunc {
    return async function (req: Request, res: Response) {
        const clientInfo = await callClientInfo(req, res, service);
        req.session.redirectUri = clientInfo.redirectUri;
        req.session.state = clientInfo.state;

        const view = clientInfo.serviceType === "optional" ? "index-optional.njk" : "index.njk";

        return res.render("updated-terms-conds/" + view);
    };
}

export function updatedTermsCondsPost(
    service: UpdateTermsAndCondsServiceInterface = updateTermsAndCondsService()
): ExpressRouteFunc {
    return async function (req: Request, res: Response) {
        const updatedTermsAndCondsValue = true;
        const {email} = req.session.user;
        const sessionId = res.locals.sessionId;
        const redirectUri = req.session.redirectUri;
        const state = req.session.state;
        const acceptOrReject = req.body.acceptOrReject;

        if (acceptOrReject === "reject") {
            return res.redirect(
                redirectUri + "?error_code=rejectedTermsAndConditions&state=" + state
            );
        }

        if (acceptOrReject === "accept") {
            if (
                await service.updateProfile(sessionId, email, updatedTermsAndCondsValue)
            ) {
                res.redirect(PATH_NAMES.AUTH_CODE);
            } else {
                throw new Error("Unable to update user profile");
            }
        }
    };
}

export async function callClientInfo(req: Request, res: Response, service: UpdateTermsAndCondsServiceInterface) : Promise<ClientInfoResponse> {
    return await service.clientInfo(
        res.locals.sessionId,
        res.locals.clientSessionId
    );
}