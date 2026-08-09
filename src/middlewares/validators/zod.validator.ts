import type { ValidationTargets } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

export default <T extends z.ZodType, Target extends keyof ValidationTargets>(
  target: Target,
  schema: T,
) => {
  return zValidator(target, schema, (result, c) => {
    if (!result.success) {
      return c.json(
        {
          message: `Invalid ${target} from request`,
          errors: JSON.parse(result.error.message),
        },
        422,
      );
    }
  });
};
