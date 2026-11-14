import { useEffect, useMemo, useState } from "react";
import { filterMedia, formatCount, starterMedia, type MediaItem, type MediaKind } from "./lib/media";
import { loadWorkspace, saveWorkspace } from "./lib/workspace";

type Section = "Overview" | "Library" | "Playlists" | "Presentations" | "Creators" | "Analytics";
const nav: { label: Section; icon: string }[] = [
  { label: "Overview", icon: "◫" }, { label: "Library", icon: "▤" },
  { label: "Playlists", icon: "☷" }, { label: "Presentations", icon: "▣" },
  { label: "Creators", icon: "♙" }, { label: "Analytics", icon: "⌁" }
];

function App() {
  const [section, setSection] = useState<Section>("Overview");
  const [media, setMedia] = useState<MediaItem[]>(() => loadWorkspace().media);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<MediaItem>(starterMedia[0]);
  const [showUpload, setShowUpload] = useState(false);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<MediaKind>("Video");
  const [notice, setNotice] = useState("Your creative workspace is ready.");
  const [playlistName, setPlaylistName] = useState("");
  const [playlists, setPlaylists] = useState<string[]>(() => loadWorkspace().playlists);

  const filtered = useMemo(() => filterMedia(media, query), [media, query]);
  const published = media.filter((item) => item.status === "Published").length;

  useEffect(() => {
    saveWorkspace({ media, playlists });
  }, [media, playlists]);

  function addMedia(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) return;
    const item: MediaItem = {
      id: `local-${Date.now()}`, title: title.trim(), kind, status: "Draft",
      updatedAt: "Just now", creator: "You", color: "red"
    };
    setMedia((current) => [item, ...current]);
    setSelected(item);
    setTitle("");
    setShowUpload(false);
    setSection("Library");
    setNotice("Draft saved on this device. Cloud storage is not connected.");
  }

  function createPlaylist(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!playlistName.trim()) return;
    setPlaylists((current) => [...current, playlistName.trim()]);
    setPlaylistName("");
    setNotice("Playlist saved on this device. Cloud sync is not connected.");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#overview" onClick={() => setSection("Overview")} aria-label="LINGOmedia home">
          <span className="brand-mark">L</span><span>LINGO<span className="brand-light">media</span><small>CREATOR STUDIO</small></span>
        </a>
        <div className="workspace-label">WORKSPACE</div>
        <nav aria-label="Main navigation">
          {nav.map((item) => <button key={item.label} className={section === item.label ? "nav-item active" : "nav-item"} onClick={() => setSection(item.label)}>
            <span className="nav-icon">{item.icon}</span>{item.label}
            {item.label === "Library" && <span className="nav-count">{media.length}</span>}
          </button>)}
        </nav>
        <div className="sidebar-bottom">
          <div className="storage-card"><span className="eyebrow">STORAGE</span><strong>Local preview</strong><div className="storage-track"><i /></div><small>Cloud storage not connected</small></div>
          <div className="profile"><div className="avatar">Z</div><div><strong>ZAVIONE</strong><small>Studio owner</small></div><span className="profile-more">•••</span></div>
        </div>
      </aside>

      <main className="main-panel">
        <header className="topbar">
          <div className="breadcrumb">LINGOmedia <span>/</span> <strong>{section}</strong></div>
          <div className="top-actions"><span className="status-dot">●</span><span className="workspace-status">Development workspace</span><button className="icon-button" aria-label="Notifications" onClick={() => setNotice("No new notifications.")}>♧</button><button className="avatar avatar-small" onClick={() => setNotice("Signed in to the local preview as ZAVIONE.")}>Z</button></div>
        </header>

        <div className="content">
          <div className="welcome-row">
            <div><div className="eyebrow crimson">THE CREATOR'S COMMAND CENTER</div><h1>{section === "Overview" ? "Make something legendary." : section}</h1><p>{section === "Overview" ? "Your stories, your sound, your world — all in one studio." : section === "Library" ? "Manage every piece of content in your creative universe." : `Organize and manage your ${section.toLowerCase()} workspace.`}</p></div>
            <button className="primary-button" onClick={() => setShowUpload(true)}><span>＋</span> Add media</button>
          </div>
          <div className="notice" role="status"><span>✦</span>{notice}<button onClick={() => setNotice("")} aria-label="Dismiss message">×</button></div>

          {section === "Overview" && <>
            <section className="stats-grid">
              <Stat label="TOTAL ASSETS" value={formatCount(media.length)} change="Across your library" icon="▤" />
              <Stat label="PUBLISHED" value={formatCount(published)} change="Ready to share" icon="↗" />
              <Stat label="PLAYLISTS" value={formatCount(playlists.length)} change="Curated collections" icon="☷" />
              <Stat label="PRESENTATIONS" value="02" change="Story decks in progress" icon="▣" />
            </section>
            <section className="feature-grid">
              <div className="panel featured-panel">
                <div className="panel-heading"><div><span className="eyebrow">CONTINUE CREATING</span><h2>Featured project</h2></div><span className="pill">IN PROGRESS</span></div>
                <button className="featured-art" onClick={() => { setSelected(media[0]); setSection("Library"); }} aria-label="Open Rise of Zavione project">
                  <div className="art-orbit" /><div className="art-copy"><span>LINGO ORIGINALS</span><strong>RISE OF<br/>ZAVIONE</strong><small>THE STORY CONTINUES</small></div><span className="play-button">▶</span>
                </button>
                <div className="featured-footer"><div><strong>Rise of Zavione — Chapter One</strong><small>Last edited today · Video</small></div><button className="text-button" onClick={() => { setSelected(media[0]); setSection("Library"); }}>Open project ↗</button></div>
              </div>
              <div className="panel activity-panel"><div className="panel-heading"><div><span className="eyebrow">YOUR STUDIO</span><h2>Quick actions</h2></div></div>
                <QuickAction icon="＋" title="Upload new media" desc="Add video, audio, images or docs" onClick={() => setShowUpload(true)} />
                <QuickAction icon="☷" title="Build a playlist" desc="Curate a collection of stories" onClick={() => setSection("Playlists")} />
                <QuickAction icon="▣" title="Create a presentation" desc="Bring your story to the screen" onClick={() => setSection("Presentations")} />
                <QuickAction icon="⌁" title="View analytics" desc="Understand your content activity" onClick={() => setSection("Analytics")} />
              </div>
            </section>
            <section className="panel recent-panel"><div className="panel-heading"><div><span className="eyebrow">FRESH FROM THE STUDIO</span><h2>Recently updated</h2></div><button className="text-button" onClick={() => setSection("Library")}>View library ↗</button></div><MediaTable items={media.slice(0, 4)} onSelect={(item) => { setSelected(item); setSection("Library"); }} /></section>
          </>}

          {section === "Library" && <section className="panel library-panel">
            <div className="library-toolbar"><div><span className="eyebrow">YOUR CONTENT</span><h2>Media library <span className="subtle-count">{media.length} assets</span></h2></div><label className="search-box"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your library..." aria-label="Search media library" /></label></div>
            <MediaTable items={filtered} onSelect={setSelected} />
            {filtered.length === 0 && <div className="empty-state">No assets match that search. Try another title or creator.</div>}
            <div className="player-preview"><div className={`player-art ${selected.color}`}><span>LINGOmedia</span><strong>{selected.title}</strong><small>{selected.kind} · {selected.duration ?? "—"}</small></div><div className="player-meta"><span className="eyebrow">NOW SELECTED</span><h3>{selected.title}</h3><p>{selected.creator} · {selected.kind} · {selected.status}</p><button className="secondary-button" onClick={() => setNotice("Playback preview is ready for media with a connected source URL.")}>▶ Preview media</button></div></div>
          </section>}

          {section === "Playlists" && <section className="panel library-panel"><div className="panel-heading"><div><span className="eyebrow">CURATED COLLECTIONS</span><h2>Your playlists</h2></div></div><form className="inline-form" onSubmit={createPlaylist}><input value={playlistName} onChange={(e) => setPlaylistName(e.target.value)} placeholder="Name a new playlist" aria-label="New playlist name" /><button className="primary-button" type="submit">＋ Create playlist</button></form><div className="collection-grid">{playlists.map((name, index) => <div className="collection-card" key={name}><div className={`collection-art art-${index % 4}`}>L<span>PLAYLIST {String(index + 1).padStart(2, "0")}</span></div><strong>{name}</strong><small>{index === 0 ? 4 : index === 1 ? 3 : 2} items · Private</small><button className="text-button" onClick={() => setNotice(`“${name}” is ready to be populated. Playlist persistence is not connected yet.`)}>Manage collection ↗</button></div>)}</div></section>}

          {section === "Presentations" && <section className="panel library-panel"><div className="panel-heading"><div><span className="eyebrow">STORYTELLING TOOLS</span><h2>Presentations</h2></div><button className="primary-button" onClick={() => setNotice("Presentation builder is scaffolded; slide editing is the next feature slice.")}>＋ New presentation</button></div><div className="presentation-list"><div className="presentation-thumb"><b>01</b><strong>THE LINGO<br/>LEGACY</strong></div><div><strong>The LINGO Legacy — Brand Story</strong><small>8 slides · Updated Nov 12 · Draft</small></div><span className="pill">DRAFT</span><button className="secondary-button" onClick={() => setNotice("Slide editor is queued for the next implementation slice.")}>Open deck</button></div><div className="presentation-list"><div className="presentation-thumb gold"><b>02</b><strong>RISE OF<br/>ZAVIONE</strong></div><div><strong>Rise of Zavione — Press Deck</strong><small>12 slides · Updated Nov 08 · Draft</small></div><span className="pill">DRAFT</span><button className="secondary-button" onClick={() => setNotice("Slide editor is queued for the next implementation slice.")}>Open deck</button></div></section>}

          {section === "Creators" && <section className="panel library-panel"><div className="panel-heading"><div><span className="eyebrow">PEOPLE & PERMISSIONS</span><h2>Creator management</h2></div><button className="primary-button" onClick={() => setNotice("Invite flow will be enabled after authentication is connected.")}>＋ Invite creator</button></div><div className="creator-row"><div className="avatar">Z</div><div><strong>ZAVIONE</strong><small>Owner · Full access</small></div><span className="role-tag">OWNER</span></div><div className="creator-row"><div className="avatar avatar-gold">L</div><div><strong>LINGOmedia</strong><small>Studio team · Admin</small></div><span className="role-tag">ADMIN</span></div><div className="creator-row"><div className="avatar avatar-purple">K</div><div><strong>Kotton's Code</strong><small>Creative brand · Contributor</small></div><span className="role-tag">CREATOR</span></div></section>}

          {section === "Analytics" && <section className="panel library-panel"><div className="panel-heading"><div><span className="eyebrow">PERFORMANCE SNAPSHOT</span><h2>Creator analytics</h2></div><span className="pill">SAMPLE DATA</span></div><div className="analytics-grid"><div><span className="eyebrow">CONTENT VIEWS</span><strong>12,480</strong><small>Illustrative preview metric</small></div><div><span className="eyebrow">WATCH TIME</span><strong>486h</strong><small>Illustrative preview metric</small></div><div><span className="eyebrow">ENGAGEMENT</span><strong>8.4%</strong><small>Illustrative preview metric</small></div></div><div className="chart-placeholder"><div className="chart-bars">{[34,52,43,69,48,78,59,92,64,75,56,86].map((height, i) => <i key={i} style={{height: `${height}%`}} />)}</div><div className="chart-labels"><span>WEEK 01</span><span>WEEK 02</span><span>WEEK 03</span><span>WEEK 04</span></div></div><p className="muted-note">Analytics are illustrative until real platform events and creator accounts are connected.</p></section>}
        </div>
      </main>

      {showUpload && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowUpload(false); }}><form className="modal" onSubmit={addMedia}><div className="modal-heading"><div><span className="eyebrow crimson">GROW YOUR LIBRARY</span><h2>Add a media asset</h2></div><button type="button" className="icon-button" onClick={() => setShowUpload(false)} aria-label="Close">×</button></div><label>Asset title<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Give your creation a name" required /></label><label>Media type<select value={kind} onChange={(event) => setKind(event.target.value as MediaKind)}><option>Video</option><option>Audio</option><option>Image</option><option>Document</option></select></label><div className="upload-note">This first slice creates a local draft record. File storage and transcoding are not connected yet.</div><button className="primary-button full-button" type="submit">Add to library</button></form></div>}
    </div>
  );
}

function Stat({ label, value, change, icon }: { label: string; value: string; change: string; icon: string }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><i>{icon}</i></div><strong>{value}</strong><small>{change}</small></div>;
}
function QuickAction({ icon, title, desc, onClick }: { icon: string; title: string; desc: string; onClick: () => void }) {
  return <button className="quick-action" onClick={onClick}><span className="quick-icon">{icon}</span><span><strong>{title}</strong><small>{desc}</small></span><b>↗</b></button>;
}
function MediaTable({ items, onSelect }: { items: MediaItem[]; onSelect: (item: MediaItem) => void }) {
  return <div className="table-wrap"><table><thead><tr><th>NAME</th><th>TYPE</th><th>CREATOR</th><th>UPDATED</th><th>STATUS</th></tr></thead><tbody>{items.map((item) => <tr key={item.id} onClick={() => onSelect(item)} tabIndex={0} onKeyDown={(e) => { if (e.key === "Enter") onSelect(item); }}><td><span className={`file-icon ${item.color}`}>{item.kind === "Video" ? "▶" : item.kind === "Audio" ? "♫" : item.kind === "Image" ? "▧" : "▤"}</span><strong>{item.title}</strong></td><td>{item.kind}</td><td>{item.creator}</td><td>{item.updatedAt}</td><td><span className={`status-pill ${item.status.toLowerCase()}`}>{item.status}</span></td></tr>)}</tbody></table></div>;
}
export default App;