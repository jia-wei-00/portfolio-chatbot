import { ICreateAgent } from "@/types/utils/model";
import { Env } from "@/types/env";

export interface ICreateModelAgent extends Partial<ICreateAgent> {
  env: Env;
}
