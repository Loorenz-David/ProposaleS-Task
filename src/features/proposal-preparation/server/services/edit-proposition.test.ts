import { describe, expect, it } from "vitest";

import { conversationWith } from "../../fixtures/conversations";
import { validProposition } from "../../fixtures/propositions";
import { validState } from "../../fixtures/states";
import { turnResultSchemaFor } from "../../schemas/turn-result";

type AnyRecord = Record<string, any>;

const EDITOR_ORIGIN = "https://proposales.test";
const NOW = Date.parse("2026-09-07T10:00:00.000Z");
const deps = { now: () => NOW, editorOrigin: EDITOR_ORIGIN };

async function modules() {
  return { service: await import("./edit-proposition") };
}

function stateWith(version = 3): AnyRecord {
  const prepared = validProposition({ version });
  return validState({ preparedProposition: prepared, currentProposition: validProposition({ version }) });
}

async function refusal(run: () => Promise<unknown>): Promise<AnyRecord> {
  try {
    await run();
  } catch (error) {
    return error as AnyRecord;
  }
  throw new Error("expected the edit turn to refuse");
}

describe("edit proposition", () => {
  it("E1(a) records the edit as the human's and increments the version", async () => {
    const { service } = await modules();
    const state = stateWith(3);

    const result = await service.editProposition({ state, edits: [{ op: "set_leaf", path: ["title"], value: "A human title" }] }, deps);

    expect(result.result.status).toBe("proposition");
    const proposition = (result.result as AnyRecord).proposition;
    expect(proposition.title).toEqual({ known: true, value: "A human title", source: "human", ref: { editTurn: 4 } });
    expect(proposition.version).toBe(4);
    expect(proposition.preparedAt).toBe("2026-09-07T10:00:00.000Z");
  });

  it("E1(b) leaves the prepared side untouched, so the approval diff still has both", async () => {
    const { service } = await modules();
    const state = stateWith(3);

    const result = await service.editProposition({ state, edits: [{ op: "set_leaf", path: ["title"], value: "Edited" }] }, deps);

    expect(result.state.preparedProposition).toEqual(state.preparedProposition);
    expect((result.state.currentProposition as AnyRecord).title.value).toBe("Edited");
  });

  it("E1(c) returns the conversation unchanged, because an edit is not something the human said", async () => {
    const { service } = await modules();
    const conversation = conversationWith(3);

    const result = await service.editProposition(
      { state: stateWith(), edits: [{ op: "unset_recipient" }], conversation },
      deps,
    );

    // The model sees the effect through `current_proposition` on the next run, not as a turn.
    expect(result.conversation).toEqual(conversation);
  });

  it("E1(d) treats an absent conversation as an empty one", async () => {
    const { service } = await modules();
    const result = await service.editProposition({ state: stateWith(), edits: [{ op: "unset_recipient" }] }, deps);
    expect(result.conversation).toEqual({ turns: [], omittedTurns: 0 });
  });

  it("E1(e) re-derives which information items the edited proposition supplies", async () => {
    const { service } = await modules();

    const result = await service.editProposition(
      { state: stateWith(), edits: [{ op: "unset_recipient" }] },
      deps,
    );

    // The inbound record said supplied; the edited proposition no longer carries a recipient, and
    // the derivation is what the next approval reads.
    expect(result.state.items.recipient_identity).toEqual({ resolution: "unresolved" });
    expect(result.state.items.title).toEqual({ resolution: "supplied" });
  });

  it("E5(a) refuses a caller-supplied version rather than ignoring it", async () => {
    const { service } = await modules();
    const error = await refusal(() => service.editProposition(
      { state: stateWith(), edits: [{ op: "unset_recipient" }], version: 9 },
      deps,
    ));

    expect(error.code).toBe("validation_error");
    expect(error.details.issues.map((issue: AnyRecord) => issue.path)).toContainEqual(["version"]);
  });

  it("E5(b) refuses a malformed conversation, naming which object was wrong", async () => {
    const { service } = await modules();
    const error = await refusal(() => service.editProposition(
      { state: stateWith(), edits: [{ op: "unset_recipient" }], conversation: { ...conversationWith(2), foo: 1 } },
      deps,
    ));

    expect(error.details.issues[0].path).toEqual(["conversation", "foo"]);
  });

  it("E5(c) refuses an empty edit list and an unknown operation", async () => {
    const { service } = await modules();
    expect((await refusal(() => service.editProposition({ state: stateWith(), edits: [] }, deps))).code).toBe("validation_error");
    expect((await refusal(() => service.editProposition({ state: stateWith(), edits: [{ op: "set_price", value: 1 }] }, deps))).code).toBe("validation_error");
  });

  it("E5(d) refuses an edit before there is a proposition to edit", async () => {
    const { service } = await modules();
    const error = await refusal(() => service.editProposition(
      { state: validState(), edits: [{ op: "unset_recipient" }] },
      deps,
    ));

    expect(error.details.reason).toBe("domain_rule");
    expect(error.details.issues[0].path).toEqual(["state", "currentProposition"]);
  });

  it("E5(e) needs no Proposales client and no model, and returns a parseable turn result", async () => {
    const { service } = await modules();
    // `deps` is exactly a clock and the configured origin: nothing else is reachable from here.
    expect(Object.keys(deps).sort()).toEqual(["editorOrigin", "now"]);

    const result = await service.editProposition({ state: stateWith(), edits: [{ op: "unset_recipient" }] }, deps);
    expect(turnResultSchemaFor(EDITOR_ORIGIN).parse(result)).toEqual(result);
    expect(result.run).toBeUndefined();
  });
});
