import { z } from "zod/v4";
import { ClassTransformer } from "./class";

const CharacterSchema = z.object({
  id: z.string(),
  name: z.string(),

  level: z.int().min(1).max(20),
  experiences: z.int().min(1),

  class: ClassTransformer,
})
