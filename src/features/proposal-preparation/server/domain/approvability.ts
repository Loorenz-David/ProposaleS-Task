import "server-only";

import type { InformationItems } from "../../schemas/information-items";
import { INFORMATION_ITEM_KEYS } from "../../schemas/information-items";
import { INFORMATION_REGISTRY } from "./information-registry";

export function evaluateApprovability(items: InformationItems):
  | { approvable: true }
  | { approvable: false; itemKeys: string[] } {
  const itemKeys = INFORMATION_ITEM_KEYS
    .filter((key) => INFORMATION_REGISTRY[key].createPolicy === "required_to_create" && items[key].resolution !== "supplied")
    .sort();
  return itemKeys.length === 0 ? { approvable: true } : { approvable: false, itemKeys };
}
