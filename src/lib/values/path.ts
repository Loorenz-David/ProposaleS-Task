import { z } from "zod";

export const pathSchema = z.array(z.string().min(1));
export type Path = z.infer<typeof pathSchema>;
