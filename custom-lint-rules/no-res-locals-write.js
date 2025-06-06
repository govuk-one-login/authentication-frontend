export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Disallow writes to res.locals outside of middleware.ts or test.ts files.",
    },
  },
  create: function (context) {
    /**
     * Recurses through `res.locals` outside `*middleware.ts` or `*test.ts` files and reports any cases where we write to it.
     *
     * Handles cases like:
     * - res.locals = {}
     * - res.locals.foo = ""
     * - res.locals.foo.bar = ""
     */

    const filename = context.getFilename();
    if (filename.endsWith("middleware.ts") || filename.endsWith("test.ts")) {
      return {};
    }

    function isResLocalsOrChild(node) {
      if (node.type === "MemberExpression") {
        const object = node.object;
        const property = node.property;

        if (
          object.type === "Identifier" &&
          object.name === "res" &&
          property.type === "Identifier" &&
          property.name === "locals"
        ) {
          return true;
        }

        return isResLocalsOrChild(object);
      } else if (node.type === "Identifier") {
      }
      return false;
    }

    return {
      AssignmentExpression(node) {
        if (node.left.type === "MemberExpression") {
          if (isResLocalsOrChild(node.left)) {
            context.report({
              node: node,
              message:
                "Direct writes to `res.locals` or any of its properties are not allowed outside of `middleware.ts` or `test.ts` files.",
            });
          }
        }
      },
    };
  },
};
