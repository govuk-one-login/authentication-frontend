import type { RequestHandler } from "express";
import querystring from "querystring";
import { pages } from "./pages.js";
import { HTTP_STATUS_CODES, PATH_NAMES } from "../../app.constants.js";

interface RadioOption {
  text: string;
  value: string;
}

interface PageListItem {
  path: string;
  variants: RadioOption[];
}

const pageListItems: PageListItem[] = Object.entries(pages)
  .map(([path, page]) => ({
    path,
    variants: Array.isArray(page)
      ? page.map(({ name }) => ({ text: name, value: name }))
      : [],
  }))
  .sort((a, b) => a.path.localeCompare(b.path));

export const allTemplatesGet: RequestHandler = (req, res) => {
  return res.render("templates/index.njk", { pageListItems });
};

export const allTemplatesPost: RequestHandler = (req, res) => {
  const templateId = req.body.template;

  if (!pages[templateId]) {
    return res.render("templates/index.njk", {
      pageListItems,
      errorState: true,
    });
  }

  const query = querystring.stringify({
    lng: req.body.language,
    pageVariant: req.body.pageVariant,
    pageErrorState: req.body.hasErrorState,
  });

  return res.redirect(`/templates${templateId}?${query}`);
};

export const templatesDisplayGet: RequestHandler = (req, res) => {
  const path = `/${req.params.templateId}`;
  const pageVariant = req.query.pageVariant;

  const page = Array.isArray(pages[path])
    ? pages[path].find(({ name }) => name === pageVariant)
    : pages[path];

  if (!page) {
    req.log.error(
      `Could not find template for ${path} (${pageVariant || "no variant"})`
    );
    res.status(HTTP_STATUS_CODES.NOT_FOUND);
    return res.render("common/errors/404.njk");
  }

  // Contact forms have a lot of logic and are public anyway
  // so better to simply use the real thing!
  if (path === PATH_NAMES.CONTACT_US && pageVariant === "public") {
    return res.redirect(PATH_NAMES.CONTACT_US);
  }

  const renderOptions = {
    ...page.options,
  };

  if (req.query.pageErrorState) {
    renderOptions.errors = {
      exampleError: { text: "An example error occurred" },
    };
    renderOptions.errorList = Object.values(renderOptions.errors);
  }

  return res.render(page.template, renderOptions);
};
