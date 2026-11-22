import { starterMedia, type MediaItem } from "./media";

const STORAGE_KEY = "lingomedia.creator-studio.workspace.v1";
export interface WorkspaceState {
  media: MediaItem[];
  playlists: string[];
}

function isMediaItem(value: unknown): value is MediaItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return typeof item.id === "string" && typeof item.title === "string" &&
    ["Video", "Audio", "Image", "Document"].includes(String(item.kind)) &&
    ["Published", "Draft", "Processing"].includes(String(item.status)) &&
    typeof item.updatedAt === "string" && typeof item.creator === "string" &&
    typeof item.color === "string" &&
    (item.duration === undefined || typeof item.duration === "string");
}

export function parseWorkspace(raw: string | null): WorkspaceState {
  if (!raw) return { media: starterMedia, playlists: ["Legacy Stories", "Behind the Brand", "The Creator Cut"] };
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("Invalid workspace");
    const value = parsed as Record<string, unknown>;
    const media = Array.isArray(value.media) ? value.media.filter(isMediaItem) : [];
    const playlists = Array.isArray(value.playlists)
      ? value.playlists.filter((item): item is string => typeof item === "string" && item.trim().length > 0 && item.length <= 80).slice(0, 100)
      : [];
    return { media: media.length ? media : starterMedia, playlists };
  } catch {
    return { media: starterMedia, playlists: ["Legacy Stories", "Behind the Brand", "The Creator Cut"] };
  }
}

export function loadWorkspace(): WorkspaceState {
  try {
    return parseWorkspace(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return parseWorkspace(null);
  }
}

export function saveWorkspace(state: WorkspaceState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({
      media: state.media.slice(0, 500),
      playlists: state.playlists.slice(0, 100)
    }));
  } catch {
    // Private browsing, storage quotas, or browser policy can disable local persistence.
  }
}
