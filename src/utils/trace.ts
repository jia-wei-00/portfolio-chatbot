import { TContext } from "@/types/common";
import { braintrustLogger } from "@/constant/trace";

export const traceFlush = (c: TContext) => {
  const logger = braintrustLogger(c.env);
  return c.executionCtx.waitUntil(logger.flush());
};
