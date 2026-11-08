const $ = (selector) => document.querySelector(selector);
const state = { user: null, assets: [], selectedId: null, selected: null, busy: false };
const roleLabel = { admin: "Registry administrator", reviewer: "Independent reviewer", creator: "Asset creator", viewer: "Read-only access" };
function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined && text !== null) element.textContent = String(text);
  return element;
}
function button(label, action, primary = false) {
  const el = node("button", "button " + (primary ? "primary" : "secondary"), label);
  el.type = "button"; el.dataset.action = action; return el;
}
async function api(path, options = {}) {
  const response = await fetch("/api" + path, {
    method: options.method || "GET",
    headers: { "accept": "application/json", ...(options.body ? { "content-type": "application/json" } : {}) },
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "same-origin",
    cache: "no-store"
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Registry request failed (" + response.status + ").");
  return data;
}
let toastTimer;
function toast(message) {
  const target = $("#toast"); target.textContent = message; target.classList.add("show");
  clearTimeout(toastTimer); toastTimer = setTimeout(() => target.classList.remove("show"), 4200);
}
function canCreate() { return ["admin", "creator"].includes(state.user?.role); }
function canReview() { return ["admin", "reviewer"].includes(state.user?.role); }
function isAdmin() { return state.user?.role === "admin"; }
function statusLabel(status) { return String(status || "DRAFT").replaceAll("_", " "); }
function updateMetrics() {
  $("#metricAssets").textContent = state.assets.length;
  $("#metricReview").textContent = state.assets.filter(a => a.status === "IN_REVIEW").length;
  $("#metricPublished").textContent = state.assets.filter(a => a.status === "PUBLISHED").length;
  $("#metricDrafts").textContent = state.assets.filter(a => a.status === "DRAFT").length;
}
function renderAssets() {
  const query = $("#search").value.trim().toLowerCase();
  const status = $("#statusFilter").value;
  const rows = state.assets.filter(a => (!status || a.status === status) &&
    [a.asset_id, a.name, a.category].some(v => String(v || "").toLowerCase().includes(query)));
  const list = $("#assetList"); list.replaceChildren();
  $("#resultCount").textContent = rows.length + " of " + state.assets.length + " records";
  if (!rows.length) {
    list.append(node("div", "empty-state", state.assets.length ? "No assets match those filters." : "No assets are registered yet. Create the first governed record."));
    return;
  }
  for (const asset of rows) {
    const card = node("button", "asset-card" + (asset.asset_id === state.selectedId ? " selected" : ""));
    card.type = "button"; card.dataset.assetId = asset.asset_id;
    card.append(node("div", "asset-title", asset.name), node("div", "asset-meta", asset.asset_id + " · " + asset.category));
    const foot = node("div", "asset-card-foot");
    foot.append(node("span", "status " + asset.status.toLowerCase(), statusLabel(asset.status)), node("span", "version-count", Number(asset.version_count || 0) + " version(s)"));
    card.append(foot); list.append(card);
  }
}
function appendRecords(container, records, mapper, emptyText) {
  if (!records?.length) { container.append(node("p", "muted-cell", emptyText)); return; }
  for (const record of records) container.append(mapper(record));
}
function record(title, detail, extra) {
  const el = node("div", "record"); el.append(node("strong", "", title), node("small", "", detail));
  if (extra) el.append(node("small", "hash", extra));
  return el;
}
function block(title, records, mapper, emptyText) {
  const section = node("section", "detail-block"); section.append(node("h4", "", title));
  appendRecords(section, records, mapper, emptyText); return section;
}
function renderDetail(data) {
  state.selected = data;
  const panel = $("#detailPanel"); panel.replaceChildren();
  const a = data.asset;
  const head = node("div", "detail-header");
  const left = node("div"); left.append(node("div", "eyebrow", "ASSET RECORD"), node("h3", "", a.name), node("div", "detail-id", a.asset_id + " · OWNER " + a.owner_email));
  head.append(left, node("span", "status " + a.status.toLowerCase(), statusLabel(a.status))); panel.append(head);
  panel.append(node("p", "detail-description", a.description || "No description supplied."));
  const actions = node("div", "action-row");
  const own = state.user?.email === a.owner_email;
  if (canCreate() && (own || isAdmin())) {
    actions.append(button("＋ New version", "version"), button("＋ Rights evidence", "rights"));
  }
  if (canReview() && !own) actions.append(button("Review current version", "review"));
  if (isAdmin()) {
    actions.append(button("Publish version", "publish", true));
    if ((data.publications || []).some(p => p.action === "PUBLISH" && p.version_id !== a.current_version_id)) actions.append(button("Rollback", "rollback"));
  }
  if (actions.childElementCount) panel.append(actions);
  panel.append(block("VERSION HISTORY", data.versions, v => record("Version " + v.version_number + " · " + v.media_type, new Date(v.created_at).toLocaleString() + " · " + v.byte_size + " bytes · " + v.created_by, "SHA-256 " + v.sha256), "No source versions recorded."));
  panel.append(block("RIGHTS EVIDENCE", data.rightsEvidence, e => {
    const item = record(e.rights_type + (e.license_name ? " · " + e.license_name : ""), new Date(e.created_at).toLocaleString() + " · submitted by " + e.submitted_by);
    const link = node("a", "", "Open evidence"); link.href = e.evidence_uri; link.target = "_blank"; link.rel = "noopener noreferrer"; item.append(link); return item;
  }, "No rights evidence attached to this asset."));
  panel.append(block("INDEPENDENT DECISIONS", data.decisions, d => record(d.review_type + " · " + d.decision, d.reviewer_email + " · " + new Date(d.created_at).toLocaleString(), d.notes), "No review decisions recorded."));
  panel.append(block("PUBLICATION & ROLLBACK HISTORY", data.publications, p => record(p.action + " · " + p.version_id, p.actor_email + " · " + new Date(p.created_at).toLocaleString()), "No publication history. This asset is not approved for runtime use."));
  panel.append(block("AUDIT HISTORY", data.auditEvents, e => record(e.action, e.actor_email + " · " + new Date(e.occurred_at).toLocaleString(), "Request " + e.request_id), "No audit events."));
}
async function refreshAssets() {
  const data = await api("/assets");
  state.assets = data.assets || []; updateMetrics(); renderAssets();
  if (state.selectedId && state.assets.some(a => a.asset_id === state.selectedId)) await selectAsset(state.selectedId);
  else { state.selectedId = null; state.selected = null; }
}
async function selectAsset(id) {
  state.selectedId = id; renderAssets();
  const data = await api("/assets/" + encodeURIComponent(id));
  renderDetail(data);
}
async function refreshAudit() {
  const body = $("#auditRows"); body.replaceChildren();
  try {
    const data = await api("/audit");
    if (!data.events.length) { body.append(node("tr", "", "")); body.firstChild.append(node("td", "muted-cell", "No audit events yet.")); return; }
    for (const event of data.events) {
      const tr = node("tr");
      [new Date(event.occurred_at).toLocaleString(), event.actor_email, event.action, event.asset_id || "—", event.request_id].forEach(value => tr.append(node("td", "", value)));
      body.append(tr);
    }
  } catch (error) {
    body.append(node("tr")); body.lastChild.append(node("td", "muted-cell", error.message)); body.lastChild.firstChild.colSpan = 5;
  }
}
function openDialog(id) { const dialog = document.getElementById(id); if (dialog?.showModal) dialog.showModal(); }
function formData(form) { return Object.fromEntries(new FormData(form).entries()); }
async function submitForm(form, path, body, success) {
  if (state.busy) return;
  state.busy = true;
  const submit = form.querySelector('[type="submit"]'); if (submit) submit.disabled = true;
  try {
    const result = await api(path, { method: "POST", body });
    form.closest("dialog").close(); form.reset(); toast(success);
    if (result.assetId) state.selectedId = result.assetId;
    await refreshAssets();
    if (state.selectedId) await selectAsset(state.selectedId);
    if (canReview()) await refreshAudit();
  } catch (error) { toast(error.message); }
  finally { state.busy = false; if (submit) submit.disabled = false; }
}
$("#newAsset").addEventListener("click", () => openDialog("assetDialog"));
$("#assetList").addEventListener("click", async event => {
  const card = event.target.closest("[data-asset-id]"); if (!card) return;
  try { await selectAsset(card.dataset.assetId); } catch (error) { toast(error.message); }
});
$("#search").addEventListener("input", renderAssets);
$("#statusFilter").addEventListener("change", renderAssets);
$("#assetForm").addEventListener("submit", event => { event.preventDefault(); submitForm(event.currentTarget, "/assets", formData(event.currentTarget), "Asset record created."); });
$("#versionForm").addEventListener("submit", event => { event.preventDefault(); submitForm(event.currentTarget, "/assets/" + state.selectedId + "/versions", formData(event.currentTarget), "Immutable version recorded."); });
$("#rightsForm").addEventListener("submit", event => { event.preventDefault(); submitForm(event.currentTarget, "/assets/" + state.selectedId + "/rights", formData(event.currentTarget), "Rights evidence attached."); });
$("#reviewForm").addEventListener("submit", event => { event.preventDefault(); submitForm(event.currentTarget, "/assets/" + state.selectedId + "/decisions", formData(event.currentTarget), "Independent review decision recorded."); });
$("#detailPanel").addEventListener("click", async event => {
  const action = event.target.closest("[data-action]")?.dataset.action; if (!action || !state.selectedId) return;
  if (action === "version") openDialog("versionDialog");
  if (action === "rights") openDialog("rightsDialog");
  if (action === "review") openDialog("reviewDialog");
  if (action === "publish" || action === "rollback") {
    const phrase = action === "publish" ? "Publish this version? The API will re-check every release gate." : "Rollback to the previous published version? History will be retained.";
    if (!window.confirm(phrase)) return;
    try { await api("/assets/" + state.selectedId + "/" + action, { method: "POST", body: {} }); toast(action === "publish" ? "Version published in registry history." : "Rollback recorded."); await refreshAssets(); await selectAsset(state.selectedId); await refreshAudit(); }
    catch (error) { toast(error.message); }
  }
});
$("#refreshAudit").addEventListener("click", refreshAudit);
$("#auditNav").addEventListener("click", event => { if (!canReview()) { event.preventDefault(); toast("Audit trail requires reviewer or administrator access."); } else refreshAudit(); });
async function init() {
  try {
    state.user = await api("/me");
    $("#userEmail").textContent = state.user.email;
    $("#userRole").textContent = roleLabel[state.user.role] || "Read-only access";
    $("#newAsset").disabled = !canCreate();
    if (canReview()) await refreshAudit();
    await refreshAssets();
  } catch (error) {
    $("#userEmail").textContent = "Access not established";
    $("#userRole").textContent = "Cloudflare Access required";
    $("#assetList").replaceChildren(node("div", "empty-state", error.message + " Protect this page and /api/* with the configured Cloudflare Access application."));
    $("#resultCount").textContent = "API unavailable";
    toast(error.message);
  }
}
init();
