import { describe, expect, it } from "vitest";
import { starterMedia } from "./media";
import { parseWorkspace } from "./workspace";

describe("local workspace persistence", () => {
  it("starts with the sample library and starter playlists", () => {
    const state = parseWorkspace(null);
    expect(state.media).toEqual(starterMedia);
    expect(state.playlists).toHaveLength(3);
  });

  it("restores valid media and playlist data", () => {
    const input = JSON.stringify({
      media: [{ ...starterMedia[0], id: "saved-1", title: "Saved draft" }],
      playlists: ["My collection"]
    });
    const state = parseWorkspace(input);
    expect(state.media[0].title).toBe("Saved draft");
    expect(state.playlists).toEqual(["My collection"]);
  });

  it("ignores malformed records and bounds playlist data", () => {
    const state = parseWorkspace(JSON.stringify({
      media: [{ id: "bad", title: 5 }],
      playlists: ["Valid", "", 4, "x".repeat(81)]
    }));
    expect(state.media).toEqual(starterMedia);
    expect(state.playlists).toEqual(["Valid"]);
  });

  it("recovers from invalid JSON", () => {
    expect(parseWorkspace("{broken").media).toEqual(starterMedia);
  });
});
