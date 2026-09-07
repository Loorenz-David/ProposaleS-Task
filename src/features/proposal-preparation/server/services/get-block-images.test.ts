import { describe, expect, it } from "vitest";

import { ValidationError } from "@/lib/errors/app-error";
import { createFakeProposalesClient } from "@/lib/proposales";
import type { ContentItem } from "@/lib/proposales";

import { getBlockImages } from "./get-block-images";

const CATALOG: ContentItem[] = [
  {
    variationId: "1",
    productId: "500101",
    createdAt: "2026-01-01T00:00:00.000Z",
    title: { en: "Classic King Room" },
    description: { en: "A room." },
    images: ["https://cdn.proposales.test/king-1.png", "https://cdn.proposales.test/king-2.png"],
  },
  {
    variationId: "2",
    productId: "500102",
    createdAt: "2026-01-01T00:00:00.000Z",
    title: { en: "Conference Room" },
    description: { en: "A room with a projector." },
  },
];

function deps() {
  return { proposales: createFakeProposalesClient({ catalog: CATALOG }) };
}

describe("getBlockImages", () => {
  it("returns the first image of each variation that has one", async () => {
    const { images } = await getBlockImages({ variationIds: ["1", "2"] }, deps());
    expect(images).toEqual([{ variationId: "1", url: "https://cdn.proposales.test/king-1.png" }]);
  });

  it("asks the vendor once per distinct variation", async () => {
    const fake = deps();
    await getBlockImages({ variationIds: ["1", "2", "1"] }, fake);
    expect(fake.proposales.calls).toEqual([
      { op: "getContent", input: "1" },
      { op: "getContent", input: "2" },
    ]);
  });

  it("omits a variation the catalog no longer holds", async () => {
    const { images } = await getBlockImages({ variationIds: ["404"] }, deps());
    expect(images).toEqual([]);
  });

  it("refuses input that is not a bounded list of variation ids", async () => {
    await expect(getBlockImages({ variationIds: [] }, deps())).rejects.toBeInstanceOf(ValidationError);
    await expect(getBlockImages({ variationIds: ["not-an-id"] }, deps())).rejects.toBeInstanceOf(ValidationError);
    await expect(getBlockImages({ variationIds: ["1"], extra: true }, deps())).rejects.toBeInstanceOf(ValidationError);
  });

  it("never writes", async () => {
    const fake = deps();
    await getBlockImages({ variationIds: ["1"] }, fake);
    fake.proposales.assertNoWrites();
  });
});
