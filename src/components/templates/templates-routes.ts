import * as express from "express";
import {
  allTemplatesPost,
  allTemplatesGet,
  templatesDisplayGet,
} from "./templates-controller.js";

const router = express.Router();

router.post("/templates", allTemplatesPost);
router.get("/templates", allTemplatesGet);
router.get("/templates/:templateId", templatesDisplayGet);

export { router as templatesRouter };
