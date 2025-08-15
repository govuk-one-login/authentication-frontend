import type { RequestHandler } from "express";
import querystring from "querystring";
import { pages } from "./pages.js";
import { logger } from "../../utils/logger.js";

interface RadioOption {
  text: string;
  value: string;
}

interface PageListItem {
  path: string;
  variants: RadioOption[];
}

const getPageListItems = (): PageListItem[] => {
  return Object.entries(pages).map(([path, page]) => ({
    path,
    variants: Array.isArray(page)
      ? page.map(({ name }) => ({ text: name, value: name }))
      : [],
  })).sort((a, b) => a.path.localeCompare(b.path));
};

export const allTemplatesGet: RequestHandler = async (req, res) => {
  res.render("templates/index.njk", { pageListItems: getPageListItems() });
};

export const allTemplatesPost: RequestHandler = async (req, res) => {
  const templateId = req.body.template;

  if (!pages[templateId]) {
    return res.render("templates/index.njk", {
      pageListItems: getPageListItems(),
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

export const templatesDisplayGet: RequestHandler = async (req, res) => {
  const path = `/${req.params.templateId}`;
  const pageVariant = req.query.pageVariant;

  const page = Array.isArray(pages[path])
    ? pages[path].find(({ name }) => name === pageVariant)
    : pages[path];

  if (!page) {
    logger.error(`Could not find template for ${path} (${pageVariant || "no variant"})`);
    res.status(404);
    return res.render("common/errors/404.njk");
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
