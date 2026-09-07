import { LIBRARY_PRICING_STATEMENT_ID } from "../schemas/approval";
import { validProposition, type Proposition } from "./propositions";
import { validState } from "./states";

type AnyRecord = Record<string, any>;

/**
 * An envelope that passes every check of §17A.13's order: the state parses, carries no draft
 * reference, and records every item supplied; the proposition carries a known language, a title
 * and one block, and no consequential leaf is `inferred`.
 *
 * `preparedProposition` and `currentProposition` are both present because a real approval always
 * follows a proposition turn, and the prepared side is what the diff is computed against.
 */
export function validEnvelope(overrides: Record<string, unknown> = {}): AnyRecord {
  const prepared = validProposition();
  return {
    state: validState({ preparedProposition: prepared, currentProposition: prepared }),
    proposition: prepared,
    pricingAcknowledgment: { acknowledged: true, statement: LIBRARY_PRICING_STATEMENT_ID },
    ...overrides,
  };
}

/**
 * An envelope whose approved proposition differs from the prepared one, as it does after a human
 * edit: the diff is non-empty and the approved side is the edited proposition.
 */
export function editedEnvelope(edit: (proposition: Proposition) => Proposition): AnyRecord {
  const prepared = validProposition();
  const current = edit(structuredClone(prepared));
  return {
    state: validState({ preparedProposition: prepared, currentProposition: current }),
    proposition: current,
    pricingAcknowledgment: { acknowledged: true, statement: LIBRARY_PRICING_STATEMENT_ID },
  };
}
