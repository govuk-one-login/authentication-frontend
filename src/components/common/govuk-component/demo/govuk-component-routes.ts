import express from "express";
import type { Request, Response } from "express";
import type { GovukComponent } from "../components/index.js";

const router = express.Router();

const demoComponents: GovukComponent[] = [
  {
    type: "govukTag",
    args: {
      component: {
        text: "Test tag",
      },
    },
  },
];

router.get("/govuk-component-demo", (req: Request, res: Response) => {
  res.render("common/govuk-component/demo/index.njk", {
    demoComponents: demoComponents,
  });
});

export { router as govukComponentRouter };
