import { Router } from "express";
import { PATH_NAMES } from "../../app.constants.js";
import { appleAppSiteAssociationGet } from "./well-known-controller.js";

const router = Router();

router.get(PATH_NAMES.WELL_KNOWN_APPLE_ASSOCIATION, appleAppSiteAssociationGet);

export { router as wellKnownRouter };
