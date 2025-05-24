import { z } from "zod/v4";

export const ArmourCategory = z.enum(["light", "medium", "heavy", "shield"]);
