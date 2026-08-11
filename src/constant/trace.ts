import { AppBindings } from "@/types/common";
import { initLogger } from "braintrust";

export const braintrustLogger = (env: AppBindings) => {
  return initLogger({
    projectName: "portfolio-agent",
    apiKey: env.BRAINTRUST_API_KEY,
  });
};
