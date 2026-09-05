import { z } from "zod";

export const currencyCodeSchema = z.string().regex(/^[A-Z]{3}$/);
export const moneySchema = z.strictObject({ amountMinor: z.number().int(), currency: currencyCodeSchema });
export type Money = z.infer<typeof moneySchema>;
