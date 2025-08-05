import type { Request, Response } from "express";
import express from "express";
import { demoTag } from "../page-components/demo-tag.js";
import type { PageComponent } from "../page-components/index.js";

const router = express.Router();

router.get("/govuk-component-demo", (req: Request, res: Response) => {
  const demoComponents: PageComponent[] = [demoTag()];

  res.render("common/govuk-component/demo/index.njk", {
    demoComponents: demoComponents,
  });
});

export { router as govukComponentRouter };
