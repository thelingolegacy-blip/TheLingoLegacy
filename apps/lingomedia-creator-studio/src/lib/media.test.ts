import { describe, expect, it } from "vitest";
import { filterMedia, formatCount, starterMedia } from "./media";

describe("media utilities", () => {
  it("returns all assets for an empty query", () => {
    expect(filterMedia(starterMedia, " ")).toHaveLength(starterMedia.length);
  });

  it("matches title, creator, type and status without case sensitivity", () => {
    expect(filterMedia(starterMedia, "zavione").length).toBeGreaterThan(0);
    expect(filterMedia(starterMedia, "VIDEO").length).toBeGreaterThan(0);
    expect(filterMedia(starterMedia, "draft").length).toBeGreaterThan(0);
  });

  it("returns no assets for an unknown query", () => {
    expect(filterMedia(starterMedia, "not-a-real-asset")).toEqual([]);
  });

  it("formats counts using the US locale", () => {
    expect(formatCount(12480)).toBe("12,480");
  });
});