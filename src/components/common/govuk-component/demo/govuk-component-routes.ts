import express from "express";
import type { Request, Response } from "express";

const router = express.Router();

router.get("/govuk-component-demo", (req: Request, res: Response) => {
  res.render("common/govuk-component/demo/index.njk");
});

export { router as govukComponentRouter };
