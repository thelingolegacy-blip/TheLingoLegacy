import type { SVGProps } from "react";

export type HomiesIconName =
  | "explore" | "map" | "chat" | "circles" | "profile" | "like"
  | "super-like" | "boost" | "filter" | "more" | "send" | "voice"
  | "camera" | "disappearing" | "verified" | "private" | "ghost"
  | "block" | "report" | "events" | "stories" | "live" | "premium" | "grok";

type IconProps = SVGProps<SVGSVGElement> & {
  name: HomiesIconName;
  filled?: boolean;
  size?: number;
};

const paths: Record<HomiesIconName, { outline: string[]; filled?: string[] }> = {
  explore: { outline: ["M4 4h6v6H4z", "M14 4h6v6h-6z", "M4 14h6v6H4z", "M14 14h6v6h-6z"] },
  map: { outline: ["M12 21s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12Z", "M12 9a2 2 0 1 0 0 .01Z"] },
  chat: { outline: ["M4 5.5A3.5 3.5 0 0 1 7.5 2h7A3.5 3.5 0 0 1 18 5.5v4a3.5 3.5 0 0 1-3.5 3.5H10l-4 3v-3.5A3.5 3.5 0 0 1 4 9Z", "M9 17h5l4 3v-3.5a3.5 3.5 0 0 0 2-3.2"] },
  circles: { outline: ["M9 8a4 4 0 1 0 0 .01Z", "M16 8a4 4 0 1 0 0 .01Z", "M5 20c0-3 2-5 4-5", "M19 20c0-3-2-5-4-5"] },
  profile: { outline: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4 21c.5-4.5 3-7 8-7s7.5 2.5 8 7Z"] },
  like: { outline: ["M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"], filled: ["M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8l1.1 1.1L12 21l7.8-7.5 1.1-1.1a5.5 5.5 0 0 0-.1-7.8Z"] },
  "super-like": { outline: ["M12 2l2.2 6.5L21 9l-5 4.2 1.6 6.8-5.6-3.7-5.6 3.7L8 13.2 3 9l6.8-.5Z", "M18 3l.5 1.5L20 5l-1.5.5L18 7l-.5-1.5L16 5l1.5-.5Z"] },
  boost: { outline: ["M12 22c-4 0-7-2.5-7-6 0-2 1.5-4 3-5.5 0 2 1 3 2 3.5C9 8 14 4 16 2c0 5 3 7 3 12 0 5-3 8-7 8Z"] },
  filter: { outline: ["M4 6h16", "M4 12h16", "M4 18h16", "M8 4v4", "M15 10v4", "M10 16v4"] },
  more: { outline: ["M12 5h.01", "M12 12h.01", "M12 19h.01"] },
  send: { outline: ["M22 2 11 13", "M22 2l-7 20-4-9-9-4Z"] },
  voice: { outline: ["M12 3v18", "M8 7v10", "M4 10v4", "M16 7v10", "M20 10v4"] },
  camera: { outline: ["M3 8h4l2-3h6l2 3h4v12H3Z", "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"] },
  disappearing: { outline: ["M12 8v4l3 2", "M21 12a9 9 0 1 1-2.6-6.4", "M16 3h5v5"] },
  verified: { outline: ["M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z", "m8 12 2.5 2.5L16 9"] },
  private: { outline: ["M5 10h14v11H5Z", "M8 10V7a4 4 0 1 1 8 0v3", "M12 14v3"] },
  ghost: { outline: ["M5 20V10a7 7 0 0 1 14 0v10l-3-2-4 2-4-2Z", "M9 10h.01", "M15 10h.01"] },
  block: { outline: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z", "m5 5 14 14"] },
  report: { outline: ["M5 21V4", "M5 4h13l-2 4 2 4H5"] },
  events: { outline: ["M4 6h16v15H4Z", "M8 3v6", "M16 3v6", "M4 10h16"] },
  stories: { outline: ["M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z", "M12 5a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z"] },
  live: { outline: ["M12 12h.01"], filled: ["M12 12a4 4 0 1 0 0 .01Z"] },
  premium: { outline: ["m2 8 5 5 5-9 5 9 5-5-2 12H4Z"] },
  grok: { outline: ["M5 5h14v14H5Z", "M8 8h5a4 4 0 1 1-4 4", "M12 12l4 4"] },
};

export function HomiesIcon({ name, filled = false, size = 24, ...props }: IconProps) {
  const data = paths[name];
  const commands = filled && data.filled ? data.filled : data.outline;
  return (
    <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.25"
      strokeLinecap="round" strokeLinejoin="round" {...props}>
      {commands.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}
