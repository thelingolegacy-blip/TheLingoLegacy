export type MediaKind = "Video" | "Audio" | "Image" | "Document";
export type MediaStatus = "Published" | "Draft" | "Processing";

export interface MediaItem {
  id: string;
  title: string;
  kind: MediaKind;
  duration?: string;
  status: MediaStatus;
  updatedAt: string;
  creator: string;
  color: string;
}

export const starterMedia: MediaItem[] = [
  { id: "m-01", title: "Rise of Zavione — Chapter One", kind: "Video", duration: "08:42", status: "Published", updatedAt: "Today", creator: "ZAVIONE", color: "plum" },
  { id: "m-02", title: "The Legacy Sessions", kind: "Video", duration: "14:08", status: "Draft", updatedAt: "Yesterday", creator: "LINGOmedia", color: "red" },
  { id: "m-03", title: "Kotton's Code — The First Clue", kind: "Video", duration: "06:31", status: "Processing", updatedAt: "Nov 11", creator: "Kotton's Code", color: "gold" },
  { id: "m-04", title: "Stay Loyal (Studio Mix)", kind: "Audio", duration: "03:56", status: "Published", updatedAt: "Nov 10", creator: "ZAVIONE", color: "blue" },
  { id: "m-05", title: "Creator Brand Kit", kind: "Document", status: "Draft", updatedAt: "Nov 09", creator: "LINGOmedia", color: "slate" },
  { id: "m-06", title: "Loyalty Lane Campaign", kind: "Image", status: "Published", updatedAt: "Nov 08", creator: "Loyalty Lane", color: "green" }
];

export function filterMedia(items: MediaItem[], query: string): MediaItem[] {
  const normalized = query.trim().toLocaleLowerCase();
  if (!normalized) return items;
  return items.filter((item) =>
    [item.title, item.kind, item.status, item.creator].some((value) =>
      value.toLocaleLowerCase().includes(normalized)
    )
  );
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}