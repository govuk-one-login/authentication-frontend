import type { PageComponent } from "./index.js";

export const demoTag = (): PageComponent => {
  return {
    type: "govukTag",
    args: {
      component: {
        text: "Default demo tag",
      },
    },
  };
};
