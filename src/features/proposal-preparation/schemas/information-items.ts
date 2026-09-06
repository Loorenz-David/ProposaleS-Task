import { z } from "zod";

export const INFORMATION_ITEM_KEYS = [
  "language",
  "title",
  "block_selection",
  "sold_scope",
  "recipient_identity",
  "quantities",
  "recipient_contact_detail",
  "description_narrative",
  "block_comments",
  "deadline_and_terms_notes",
] as const;

export const informationItemKeySchema = z.enum(INFORMATION_ITEM_KEYS);
export type InformationItemKey = z.infer<typeof informationItemKeySchema>;

export const informationItemAskPolicySchema = z.enum(["ask_if_underivable", "do_not_ask"]);
export const informationItemCreatePolicySchema = z.enum(["required_to_create", "not_required"]);
export const informationItemResolutionSchema = z.enum(["supplied", "unresolved", "deferred_by_user"]);

export const informationItemStateSchema = z.strictObject({
  resolution: informationItemResolutionSchema,
});
export type InformationItemState = z.infer<typeof informationItemStateSchema>;

export const informationItemsRecordSchema = z.strictObject({
  language: informationItemStateSchema,
  title: informationItemStateSchema,
  block_selection: informationItemStateSchema,
  sold_scope: informationItemStateSchema,
  recipient_identity: informationItemStateSchema,
  quantities: informationItemStateSchema,
  recipient_contact_detail: informationItemStateSchema,
  description_narrative: informationItemStateSchema,
  block_comments: informationItemStateSchema,
  deadline_and_terms_notes: informationItemStateSchema,
});
export type InformationItems = z.infer<typeof informationItemsRecordSchema>;
