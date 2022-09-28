import { Request, Response } from "express";
import { USER_JOURNEY_EVENTS } from "../common/state-machine/state-machine";
import { getNextPathAndUpdateJourney } from "../common/constants";
import { PATH_NAMES } from "../../app.constants";

export function photoIdGet(req: Request, res: Response) : void {
 res.render("photo-id/index.njk")
}

export function photoIdPost(req: Request, res: Response) : void {
 const hasPhotoId = req.body.havePhotoId?.toLowerCase() === 'true';

 let event = req.session.user.isAuthenticated
   ? USER_JOURNEY_EVENTS.EXISTING_SESSION
   : USER_JOURNEY_EVENTS.CREATE_OR_SIGN_IN;

 if (!hasPhotoId) {
  event = USER_JOURNEY_EVENTS.NO_PHOTO_ID
 }

 const nextPath = getNextPathAndUpdateJourney(
   req,
   PATH_NAMES.PHOTO_ID,
   event,
   {},
   res.locals.sessionId
 );

 res.redirect(nextPath);
}

export function noPhotoIdGet(req: Request, res: Response) : void {
 res.render("photo-id/index-no-photo-id.njk")
}