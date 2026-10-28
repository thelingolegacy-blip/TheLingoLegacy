import type { ButtonHTMLAttributes } from "react";
import { HomiesIcon, type HomiesIconName } from "./icons";

export type HomiesButtonVariant = "primary" | "secondary" | "ghost" | "destructive" | "premium";
export type HomiesButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: HomiesButtonVariant;
  icon?: HomiesIconName;
};

export function HomiesButton({ variant = "primary", icon, className = "", children, ...props }: HomiesButtonProps) {
  return (
    <button className={`homies-button homies-button--${variant} ${className}`.trim()} {...props}>
      {icon ? <HomiesIcon name={icon} size={20} /> : null}
      {children}
    </button>
  );
}

export type HomiesTab = "Explore" | "Map" | "Chat" | "Circles" | "Profile";
const tabIcons: Record<HomiesTab, HomiesIconName> = {
  Explore: "explore", Map: "map", Chat: "chat", Circles: "circles", Profile: "profile",
};

export function HomiesTabBar({
  activeTab,
  onSelect,
  unreadChatCount = 0,
}: {
  activeTab: HomiesTab;
  onSelect: (tab: HomiesTab) => void;
  unreadChatCount?: number;
}) {
  const tabs = Object.keys(tabIcons) as HomiesTab[];
  return (
    <nav className="homies-tabbar" aria-label="Main navigation">
      {tabs.map((tab) => (
        <button key={tab} type="button" className="homies-tab"
          aria-current={activeTab === tab ? "page" : undefined}
          aria-label={tab === "Chat" && unreadChatCount > 0 ? `Chat, ${unreadChatCount} unread` : tab}
          onClick={() => onSelect(tab)}>
          <span style={{ position: "relative", display: "inline-flex" }}>
            <HomiesIcon name={tabIcons[tab]} size={24} filled={activeTab === tab} />
            {tab === "Chat" && unreadChatCount > 0 ? (
              <span className="homies-unread-badge" aria-hidden="true">{unreadChatCount > 99 ? "99+" : unreadChatCount}</span>
            ) : null}
          </span>
          <span>{tab}</span>
        </button>
      ))}
    </nav>
  );
}
