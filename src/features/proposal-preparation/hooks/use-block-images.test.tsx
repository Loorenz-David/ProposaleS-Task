import { render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { setBlockImagesTransportForTests } from "../client/block-images-transport";
import { useBlockImages } from "./use-block-images";

function Harness({ ids }: { ids: string[] }) {
  const images = useBlockImages(ids);
  return (
    <ul>
      {ids.map((id) => {
        const image = images[id] ?? { status: "pending" as const };
        return <li key={id}>{`${id}:${image.status === "ready" ? image.url : image.status}`}</li>;
      })}
    </ul>
  );
}

afterEach(() => setBlockImagesTransportForTests(null));

describe("useBlockImages", () => {
  it("resolves each requested id to an image or to none", async () => {
    setBlockImagesTransportForTests({
      load: async () => [{ variationId: "1", url: "https://cdn.proposales.test/one.png" }],
    });
    render(<Harness ids={["1", "2"]} />);

    expect(screen.getByText("1:pending")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText("1:https://cdn.proposales.test/one.png")).toBeInTheDocument());
    expect(screen.getByText("2:none")).toBeInTheDocument();
  });

  it("asks for an id once, and asks only for the ones it has not seen", async () => {
    const loadImages = vi.fn(async () => []);
    setBlockImagesTransportForTests({ load: loadImages });
    const { rerender } = render(<Harness ids={["1"]} />);
    await waitFor(() => expect(screen.getByText("1:none")).toBeInTheDocument());

    rerender(<Harness ids={["1", "2"]} />);
    await waitFor(() => expect(screen.getByText("2:none")).toBeInTheDocument());
    expect(loadImages.mock.calls).toEqual([[["1"]], [["2"]]]);
  });

  it("leaves the items without an image when the request fails", async () => {
    setBlockImagesTransportForTests({ load: async () => [] });
    render(<Harness ids={["1"]} />);
    await waitFor(() => expect(screen.getByText("1:none")).toBeInTheDocument());
  });

  it("resolves under StrictMode, whose double-invoked effect is what development runs", async () => {
    setBlockImagesTransportForTests({
      load: async () => [{ variationId: "1", url: "https://cdn.proposales.test/one.png" }],
    });
    render(
      <StrictMode>
        <Harness ids={["1"]} />
      </StrictMode>,
    );
    await waitFor(() => expect(screen.getByText("1:https://cdn.proposales.test/one.png")).toBeInTheDocument());
  });
});
