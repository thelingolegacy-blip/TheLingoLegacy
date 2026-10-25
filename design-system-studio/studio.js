(() => {
  "use strict";

  const TOKEN_URL = "/config/design/design-tokens.json";
  const ICON_URL = "/config/icons/icon-registry.json";
  const ASSET_URL = "/config/assets/asset-registry.json";
  const DRAFT_KEY = "lingovox-next-design-foundry-draft-v1";
  const fallbackTheme = {
    name: "LINGOvox-next Industrial Noir",
    status: "proposed",
    description: "Scoped LINGOvox-next theme.",
    colors: {
      obsidian: "#09090C", graphite: "#17171D", gold: "#C7A45A",
      royalPurple: "#7040B8", platinum: "#F0EFF4", mutedText: "#B5B3BE",
      border: "#34343D", success: "#4E8B78", warning: "#D69E36",
      danger: "#C94B58", focus: "#E4C77E"
    },
    semantic: {
      "surface.primary": "#09090C", "surface.secondary": "#17171D",
      "text.primary": "#F0EFF4", "text.secondary": "#B5B3BE",
      "accent.gold": "#C7A45A", "action.creative": "#7040B8",
      "status.success": "#4E8B78", "status.warning": "#D69E36",
      "status.danger": "#C94B58", "focus.visible": "#E4C77E"
    },
    typography: { headline: "Inter, ui-sans-serif, system-ui, sans-serif", body: "Inter, ui-sans-serif, system-ui, sans-serif", minimumBodySizePx: 16 },
    spacing: { basePx: 4, stepsPx: [4,8,12,16,20,24,32,40,48,64], minimumTouchTargetPx: 44 },
    motion: { fastMs: 120, standardMs: 200, slowMs: 320, reducedMotion: "honor-prefers-reduced-motion" },
    governance: { sourceOfTruth: TOKEN_URL, changePolicy: "Changes require a reviewed repository update.", releaseStatus: "not-certified" }
  };
  const colorFields = [
    ["obsidian", "Obsidian canvas"],
    ["graphite", "Forged graphite"],
    ["gold", "Metallic gold"],
    ["royalPurple", "Royal purple"],
    ["platinum", "Platinum text"],
    ["mutedText", "Secondary text"],
    ["border", "Panel border"],
    ["success", "Success state"],
    ["warning", "Warning state"],
    ["danger", "Danger state"],
    ["focus", "Keyboard focus"]
  ];
  const state = {
    tokens: null,
    icons: null,
    assets: null,
    canonicalTheme: structuredCloneSafe(fallbackTheme),
    draft: structuredCloneSafe(fallbackTheme),
    sources: { tokens: false, icons: false, assets: false },
    localDraft: false,
    audioContext: null,
    oscillator: null,
    gain: null
  };

  function structuredCloneSafe(value) {
    return JSON.parse(JSON.stringify(value));
  }
  function byId(id) { return document.getElementById(id); }
  function announce(message) {
    const status = byId("live-status");
    if (status) status.textContent = message;
  }
  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store", credentials: "same-origin" });
    if (!response.ok) throw new Error("HTTP " + response.status + " for " + url);
    return response.json();
  }
  function kebab(value) {
    return String(value).replace(/[A-Z]/g, (letter) => "-" + letter.toLowerCase());
  }
  function safeHex(value) {
    return /^#[0-9a-fA-F]{6}$/.test(String(value)) ? String(value).toUpperCase() : null;
  }
  function mergeDraft(source) {
    const merged = structuredCloneSafe(state.canonicalTheme);
    if (!source || typeof source !== "object") return merged;
    if (source.colors && typeof source.colors === "object") {
      Object.keys(merged.colors).forEach((key) => {
        const candidate = safeHex(source.colors[key]);
        if (candidate) merged.colors[key] = candidate;
      });
    }
    merged.semantic = merged.semantic || {};
    merged.semantic["surface.primary"] = merged.colors.obsidian;
    merged.semantic["surface.secondary"] = merged.colors.graphite;
    merged.semantic["text.primary"] = merged.colors.platinum;
    merged.semantic["text.secondary"] = merged.colors.mutedText;
    merged.semantic["accent.gold"] = merged.colors.gold;
    merged.semantic["action.creative"] = merged.colors.royalPurple;
    merged.semantic["status.success"] = merged.colors.success;
    merged.semantic["status.warning"] = merged.colors.warning;
    merged.semantic["status.danger"] = merged.colors.danger;
    merged.semantic["focus.visible"] = merged.colors.focus;
    return merged;
  }
  function applyTheme() {
    const root = document.documentElement;
    Object.keys(state.draft.colors || {}).forEach((key) => {
      root.style.setProperty("--lingovox-next-color-" + kebab(key), state.draft.colors[key]);
    });
    root.style.setProperty("--df-bg", state.draft.colors.obsidian);
    root.style.setProperty("--df-panel", state.draft.colors.graphite);
    root.style.setProperty("--df-gold", state.draft.colors.gold);
    root.style.setProperty("--df-purple", state.draft.colors.royalPurple);
    root.style.setProperty("--df-text", state.draft.colors.platinum);
    root.style.setProperty("--df-muted", state.draft.colors.mutedText);
    root.style.setProperty("--df-line", state.draft.colors.border);
    root.style.setProperty("--df-success", state.draft.colors.success);
    root.style.setProperty("--df-warning", state.draft.colors.warning);
    root.style.setProperty("--df-danger", state.draft.colors.danger);
    root.style.setProperty("--df-focus", state.draft.colors.focus);
    renderOverviewSwatches();
    renderHandoff();
    updateDraftStatus();
    updateContrast();
  }
  function renderTokenControls() {
    const container = byId("token-controls");
    container.replaceChildren();
    colorFields.forEach(([key, label]) => {
      const field = document.createElement("div");
      field.className = "token-field";
      const color = document.createElement("input");
      color.type = "color";
      color.id = "color-" + key;
      color.value = state.draft.colors[key];
      color.setAttribute("aria-label", label + " color");
      const right = document.createElement("div");
      const title = document.createElement("label");
      title.htmlFor = "hex-" + key;
      title.textContent = label;
      const hex = document.createElement("input");
      hex.type = "text";
      hex.id = "hex-" + key;
      hex.value = state.draft.colors[key];
      hex.autocomplete = "off";
      hex.spellcheck = false;
      hex.setAttribute("aria-label", label + " hexadecimal value");
      color.addEventListener("input", () => setColor(key, color.value, hex));
      hex.addEventListener("change", () => {
        const value = safeHex(hex.value);
        if (!value) {
          hex.setAttribute("aria-invalid", "true");
          announce("Enter a six-digit hexadecimal color such as #C7A45A.");
          hex.value = state.draft.colors[key];
          return;
        }
        hex.removeAttribute("aria-invalid");
        setColor(key, value, color);
      });
      right.append(title, hex);
      field.append(color, right);
      container.append(field);
    });
  }
  function setColor(key, value, peer) {
    const normalized = safeHex(value);
    if (!normalized) return;
    state.draft.colors[key] = normalized;
    peer.value = normalized;
    state.localDraft = true;
    state.draft = mergeDraft(state.draft);
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(state.draft)); } catch (_) {}
    applyTheme();
    announce(labelFor(key) + " updated in this browser's local draft. Export and review before changing canonical source.");
  }
  function labelFor(key) {
    const match = colorFields.find((item) => item[0] === key);
    return match ? match[1] : key;
  }
  function renderOverviewSwatches() {
    const container = byId("overview-swatches");
    if (!container) return;
    container.replaceChildren();
    colorFields.slice(0, 6).forEach(([key, label]) => {
      const item = document.createElement("div");
      item.className = "swatch";
      const chip = document.createElement("div");
      chip.className = "swatch-chip";
      chip.style.background = state.draft.colors[key];
      const name = document.createElement("span");
      name.textContent = label;
      const value = document.createElement("code");
      value.textContent = state.draft.colors[key];
      item.append(chip, name, value);
      container.append(item);
    });
  }
  function proposedTokens() {
    const output = state.tokens ? structuredCloneSafe(state.tokens) : { schemaVersion: "proposal", colors: {} };
    output.themes = output.themes || {};
    output.themes.lingovoxNext = structuredCloneSafe(state.draft);
    return output;
  }
  function renderHandoff() {
    const preview = byId("handoff-preview");
    if (preview) preview.textContent = JSON.stringify(proposedTokens(), null, 2);
  }
  function updateDraftStatus() {
    const indicator = byId("draft-indicator");
    const governance = byId("governance-draft-state");
    if (indicator) {
      indicator.textContent = state.localDraft ? "LOCAL DRAFT CHANGED" : "CANONICAL THEME LOADED";
      indicator.className = state.localDraft ? "pill pill-warning" : "pill pill-neutral";
    }
    if (governance) governance.textContent = state.localDraft ? "Unpublished local edits" : "No local edits";
  }
  function downloadFile(name, content, type) {
    const blob = new Blob([content], { type: type || "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }
  async function copyText(value) {
    try {
      await navigator.clipboard.writeText(value);
      announce("Copied to clipboard.");
    } catch (_) {
      announce("Clipboard access is unavailable here. Use the download option instead.");
    }
  }
  function exportProposal() {
    const payload = {
      proposalType: "lingovox-next-design-theme",
      generatedAt: new Date().toISOString(),
      sourceOfTruth: TOKEN_URL,
      sourceMode: "read-only",
      proposalStatus: "requires-repository-review",
      note: "This export is a proposal. It is not a Git commit, pull request, approval, or production release.",
      proposedDesignTokens: proposedTokens()
    };
    downloadFile("LINGOVOX_DESIGN_THEME_PROPOSAL.json", JSON.stringify(payload, null, 2));
    announce("Review proposal exported. Canonical repository files were not changed by this browser action.");
  }
  function updateSourceStatus() {
    const all = state.sources.tokens && state.sources.icons && state.sources.assets;
    byId("source-state").textContent = all ? "Canonical sources loaded" : "Source incomplete";
    byId("connection-pill").textContent = all ? "3 SOURCES CONNECTED" : "SOURCE PARTIAL";
    byId("connection-pill").className = all ? "pill pill-success" : "pill pill-warning";
    byId("metric-version").textContent = state.tokens && state.tokens.schemaVersion ? state.tokens.schemaVersion : "Unknown";
    byId("metric-icons").textContent = state.icons && Array.isArray(state.icons.icons) ? state.icons.icons.length : "—";
    byId("metric-assets").textContent = state.assets && Array.isArray(state.assets.assets) ? state.assets.assets.length : "—";
    byId("gov-token-state").textContent = state.sources.tokens ? "LOADED · READ ONLY" : "UNAVAILABLE";
    byId("gov-icon-state").textContent = state.sources.icons ? "LOADED · READ ONLY" : "UNAVAILABLE";
    byId("gov-asset-state").textContent = state.sources.assets ? "LOADED · READ ONLY" : "UNAVAILABLE";
    byId("icon-status").textContent = state.sources.icons ? "REGISTRY LOADED" : "REGISTRY UNAVAILABLE";
    byId("asset-status").textContent = state.sources.assets ? "REGISTRY LOADED" : "REGISTRY UNAVAILABLE";
    if (all) announce("Canonical token, icon, and asset registries loaded in read-only mode.");
    else announce("One or more canonical registries could not be loaded. Preview remains available; do not treat missing data as an empty registry.");
  }
  function renderIcons() {
    const container = byId("icon-grid");
    const query = (byId("icon-filter").value || "").trim().toLowerCase();
    container.replaceChildren();
    const icons = state.icons && Array.isArray(state.icons.icons) ? state.icons.icons : [];
    const filtered = icons.filter((item) => [item.id, item.path, item.status].join(" ").toLowerCase().includes(query));
    if (!filtered.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state";
      empty.textContent = icons.length ? "No icon records match this filter." : "Icon registry unavailable. This is not proof that the repository contains no icons.";
      container.append(empty);
      return;
    }
    filtered.forEach((item) => {
      const card = document.createElement("article");
      card.className = "registry-card";
      const preview = document.createElement("div");
      preview.className = "registry-icon";
      const image = document.createElement("img");
      image.alt = "";
      image.loading = "lazy";
      image.src = String(item.path || "");
      image.addEventListener("error", () => {
        image.remove();
        preview.textContent = "◇";
        preview.setAttribute("aria-label", "Icon file could not be loaded");
      });
      preview.append(image);
      const name = document.createElement("strong");
      name.textContent = String(item.id || "Unnamed icon");
      const path = document.createElement("code");
      path.textContent = String(item.path || "No path recorded");
      const status = document.createElement("span");
      status.className = "pill " + (String(item.status || "").includes("verified") ? "pill-success" : "pill-warning");
      status.textContent = String(item.status || "status unknown");
      card.append(preview, name, path, status);
      container.append(card);
    });
  }
  function renderAssets() {
    const body = byId("asset-table");
    const query = (byId("asset-filter").value || "").trim().toLowerCase();
    body.replaceChildren();
    const assets = state.assets && Array.isArray(state.assets.assets) ? state.assets.assets : [];
    const filtered = assets.filter((item) => [
      item.assetId, item.name, item.category, item.owner, item.licenseStatus, item.productionStatus,
      Array.isArray(item.usedBy) ? item.usedBy.join(" ") : ""
    ].join(" ").toLowerCase().includes(query));
    if (!filtered.length) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 5;
      cell.textContent = assets.length ? "No asset records match this filter." : "Asset registry unavailable. Missing registry data is not an empty registry.";
      row.append(cell);
      body.append(row);
      return;
    }
    filtered.forEach((item) => {
      const row = document.createElement("tr");
      const values = [
        { title: item.name || item.assetId || "Unnamed asset", detail: item.assetId || "" },
        { title: item.category || "Unclassified" },
        { title: item.owner || "Owner not recorded" },
        { title: item.licenseStatus || "Not recorded" },
        { title: item.productionStatus || "Not recorded" }
      ];
      values.forEach((value, index) => {
        const cell = document.createElement("td");
        if (index === 0) {
          const strong = document.createElement("strong");
          strong.textContent = String(value.title);
          const code = document.createElement("code");
          code.textContent = String(value.detail);
          cell.append(strong, code);
        } else {
          cell.textContent = String(value.title);
        }
        row.append(cell);
      });
      body.append(row);
    });
  }
  function contrastRatio(hexA, hexB) {
    function luminance(hex) {
      const raw = hex.replace("#", "");
      const values = [0, 2, 4].map((index) => parseInt(raw.slice(index, index + 2), 16) / 255).map((value) => value <= 0.04045 ? value / 12.92 : Math.pow((value + 0.055) / 1.055, 2.4));
      return 0.2126 * values[0] + 0.7152 * values[1] + 0.0722 * values[2];
    }
    const a = luminance(hexA);
    const b = luminance(hexB);
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }
  function updateContrast() {
    const fg = byId("contrast-fg").value;
    const bg = byId("contrast-bg").value;
    const ratio = contrastRatio(fg, bg);
    byId("contrast-preview").style.color = fg;
    byId("contrast-preview").style.background = bg;
    byId("contrast-ratio").textContent = ratio.toFixed(2) + ":1";
    const rating = byId("contrast-rating");
    if (ratio >= 7) {
      rating.textContent = "AAA · normal text";
      rating.style.color = "#a2d3c1";
    } else if (ratio >= 4.5) {
      rating.textContent = "AA · normal text";
      rating.style.color = "#a2d3c1";
    } else if (ratio >= 3) {
      rating.textContent = "Large text only · not AA for normal text";
      rating.style.color = "#e6c47d";
    } else {
      rating.textContent = "FAIL · adjust foreground or background";
      rating.style.color = "#ed9aa2";
    }
  }
  function stopTone() {
    try {
      if (state.oscillator) state.oscillator.stop();
    } catch (_) {}
    state.oscillator = null;
    state.gain = null;
    byId("audio-feedback").textContent = "Preview stopped. No sound file was created or played.";
  }
  async function playTone() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) {
      byId("audio-feedback").textContent = "Web Audio is not supported in this browser.";
      return;
    }
    stopTone();
    try {
      state.audioContext = state.audioContext || new AudioContextClass();
      await state.audioContext.resume();
      const oscillator = state.audioContext.createOscillator();
      const gain = state.audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(660, state.audioContext.currentTime);
      oscillator.frequency.setValueAtTime(880, state.audioContext.currentTime + 0.12);
      const volume = Number(byId("tone-volume").value) / 100 * 0.12;
      gain.gain.setValueAtTime(0.0001, state.audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(volume, 0.0002), state.audioContext.currentTime + 0.025);
      gain.gain.exponentialRampToValueAtTime(0.0001, state.audioContext.currentTime + 0.32);
      oscillator.connect(gain);
      gain.connect(state.audioContext.destination);
      state.oscillator = oscillator;
      state.gain = gain;
      oscillator.start();
      oscillator.stop(state.audioContext.currentTime + 0.34);
      oscillator.addEventListener("ended", () => {
        if (state.oscillator === oscillator) state.oscillator = null;
        byId("audio-feedback").textContent = "Synthesized demo tone played. This is not a production sound asset.";
      }, { once: true });
      byId("audio-feedback").textContent = "Playing synthesized preview tone…";
    } catch (_) {
      byId("audio-feedback").textContent = "Audio preview could not start. Check browser audio permission.";
    }
  }
  function showView(name) {
    document.querySelectorAll(".nav-item").forEach((button) => {
      const active = button.dataset.view === name;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-selected", active ? "true" : "false");
      button.tabIndex = active ? 0 : -1;
    });
    document.querySelectorAll(".view-panel").forEach((panel) => {
      const active = panel.dataset.panel === name;
      panel.classList.toggle("is-visible", active);
      panel.hidden = !active;
    });
    if (name === "icons") renderIcons();
    if (name === "assets") renderAssets();
    if (name === "handoff") renderHandoff();
    if (name === "accessibility") updateContrast();
  }
  function bindEvents() {
    document.querySelectorAll(".nav-item").forEach((button) => {
      button.addEventListener("click", () => showView(button.dataset.view));
      button.addEventListener("keydown", (event) => {
        const tabs = Array.from(document.querySelectorAll(".nav-item"));
        const current = tabs.indexOf(button);
        let next = current;
        if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (current + 1) % tabs.length;
        else if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        tabs[next].focus();
        showView(tabs[next].dataset.view);
      });
    });
    document.querySelectorAll("[data-go]").forEach((button) => button.addEventListener("click", () => showView(button.dataset.go)));
    byId("export-top").addEventListener("click", exportProposal);
    byId("export-theme").addEventListener("click", exportProposal);
    byId("export-proposal").addEventListener("click", exportProposal);
    byId("copy-theme").addEventListener("click", () => copyText(JSON.stringify(proposedTokens(), null, 2)));
    byId("copy-handoff").addEventListener("click", () => copyText(JSON.stringify(proposedTokens(), null, 2)));
    byId("download-handoff").addEventListener("click", () => downloadFile("LINGOVOX_DESIGN_TOKENS_PROPOSAL.json", JSON.stringify(proposedTokens(), null, 2)));
    byId("download-css").addEventListener("click", () => {
      const css = ":root {\n" + Object.keys(state.draft.colors).map((key) => "  --lingovox-next-color-" + kebab(key) + ": " + state.draft.colors[key] + ";").join("\n") + "\n}\n";
      downloadFile("lingovox-next-proposed-tokens.css", css, "text/css;charset=utf-8");
    });
    byId("reset-tokens").addEventListener("click", () => {
      state.draft = structuredCloneSafe(state.canonicalTheme);
      state.localDraft = false;
      try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
      renderTokenControls();
      applyTheme();
      announce("Draft reset to the canonical theme loaded by this page.");
    });
    byId("clear-local-draft").addEventListener("click", () => {
      try { localStorage.removeItem(DRAFT_KEY); } catch (_) {}
      state.draft = structuredCloneSafe(state.canonicalTheme);
      state.localDraft = false;
      renderTokenControls();
      applyTheme();
      announce("Local browser draft cleared. Repository files were not changed.");
    });
    byId("icon-filter").addEventListener("input", renderIcons);
    byId("asset-filter").addEventListener("input", renderAssets);
    byId("contrast-fg").addEventListener("input", updateContrast);
    byId("contrast-bg").addEventListener("input", updateContrast);
    byId("play-tone").addEventListener("click", playTone);
    byId("stop-tone").addEventListener("click", stopTone);
    byId("run-motion").addEventListener("click", () => {
      const stage = byId("motion-stage");
      stage.classList.remove("motion-play");
      void stage.offsetWidth;
      stage.classList.add("motion-play");
      byId("motion-feedback").textContent = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "Reduced motion is enabled; animation is intentionally minimized." : "Motion preview triggered. This is a local visual demo.";
    });
    byId("clear-motion").addEventListener("click", () => {
      byId("motion-stage").classList.remove("motion-play");
      byId("motion-feedback").textContent = "Preview reset.";
    });
    document.querySelectorAll("[data-viewport]").forEach((button) => {
      if (button.tagName !== "BUTTON") return;
      button.addEventListener("click", () => {
        byId("viewport-frame").dataset.viewport = button.dataset.viewport;
        document.querySelectorAll(".viewport-controls button").forEach((item) => item.classList.toggle("is-selected", item === button));
      });
    });
    ["sample-primary", "sample-secondary", "sample-danger"].forEach((id) => {
      byId(id).addEventListener("click", () => {
        byId("component-feedback").textContent = byId(id).textContent + " triggered a sample interaction. No backend action was performed.";
      });
    });
  }
  async function loadSources() {
    const results = await Promise.allSettled([fetchJson(TOKEN_URL), fetchJson(ICON_URL), fetchJson(ASSET_URL)]);
    if (results[0].status === "fulfilled") {
      state.tokens = results[0].value;
      state.sources.tokens = true;
      if (state.tokens.themes && state.tokens.themes.lingovoxNext) {
        state.canonicalTheme = structuredCloneSafe(state.tokens.themes.lingovoxNext);
      }
    }
    if (results[1].status === "fulfilled") {
      state.icons = results[1].value;
      state.sources.icons = true;
    }
    if (results[2].status === "fulfilled") {
      state.assets = results[2].value;
      state.sources.assets = true;
    }
    state.draft = structuredCloneSafe(state.canonicalTheme);
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        state.draft = mergeDraft(JSON.parse(saved));
        state.localDraft = true;
      }
    } catch (_) {}
    renderTokenControls();
    updateSourceStatus();
    applyTheme();
    renderIcons();
    renderAssets();
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "REDUCED MOTION ACTIVE" : "STANDARD MOTION";
    byId("motion-preference").textContent = preference;
  }
  bindEvents();
  loadSources().catch(() => {
    renderTokenControls();
    applyTheme();
    updateSourceStatus();
    announce("Source loading failed unexpectedly. The fallback preview is available; no source state has been changed.");
  });
})();