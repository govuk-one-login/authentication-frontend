import * as express from "express";
import {
  allTemplatesPost,
  allTemplatesGet,
  templatesDisplayGet,
} from "./templates-controller.js";
import { IdentityProcessingStatus } from "../prove-identity-callback/types.js";
import { HTTP_STATUS_CODES } from "../../app.constants.js";

const router = express.Router();

router.get("/templates/prove-identity-status", (req, res) => {
  res.status(HTTP_STATUS_CODES.OK).json({
    status: IdentityProcessingStatus.PROCESSING,
  });
});

router.post("/templates", allTemplatesPost);
router.get("/templates", allTemplatesGet);
router.get("/templates/:templateId", templatesDisplayGet);

export { router as templatesRouter };
