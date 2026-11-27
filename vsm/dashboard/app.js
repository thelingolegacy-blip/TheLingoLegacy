const $=s=>document.querySelector(s);
const centers=[
["Release Dispatch","Packages, gates, acceptance and promotion records."],
["Execution & Orchestration","Local jobs and preview dispatch."],
["G02 Authority","Fail-closed release authority and LKG protection."],
["Troubleshooting & Evidence","Probe history, logs and diagnostics."],
["Security / SAAAE","Roles, privileged boundaries and audit."],
["Studio & World Matrix","Existing worlds, assets and playable previews."],
["Economy & Commerce","Virtual wallet and isolated commerce testing."],
["Identity & Lingo ID","Shared identity and session contracts."],
["askLINGO & AI","Policy kernel and model-routing boundaries."],
["Infrastructure Truth","Cloudflare inventory and drift comparison."],
["Observability & Cost","Health, telemetry, rate and cost guardrails."]
];
let ownerToken=sessionStorage.getItem("vsm-owner-token")||"";
async function api(path,opts={}){const headers={"Content-Type":"application/json",...(opts.headers||{})};if(ownerToken)headers.Authorization="Bearer "+ownerToken;const r=await fetch(path,{...opts,headers});const j=await r.json().catch(()=>({error:"Invalid response"}));if(!r.ok)throw new Error(j.error||r.statusText);return j}
function renderCenters(){ $("#centers").innerHTML=centers.map(([n,d])=>'<article class="center"><b>'+n+'</b><span>'+d+'</span><small class="state">REGISTERED · PHASE 0</small></article>').join("")}
function renderReleases(items){$("#releaseCount").textContent=items.length;$("#releases").innerHTML=items.length?items.map(x=>'<article class="release"><strong>'+escapeHtml(x.title)+'</strong><small>'+escapeHtml(x.id)+' · '+escapeHtml(x.status)+' · '+escapeHtml(x.target)+' · '+escapeHtml(x.source.commit)+'</small><div class="gate-row">'+Object.entries(x.gates).map(([k,v])=>'<span class="gate">'+k.toUpperCase()+': '+v+'</span>').join("")+'</div></article>').join(""):'<p class="muted">No release packages yet. Create the first package above.</p>'}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
async function refresh(){try{const [health,releases]=await Promise.all([api("/api/health"),api("/api/releases")]);$("#systemState").textContent="ONLINE";$("#systemState").className="pill ok";$("#apiState").textContent="ONLINE";$("#authorityState").textContent=health.authority;renderReleases(releases.releases)}catch(e){$("#systemState").textContent="OFFLINE";$("#apiState").textContent="UNAVAILABLE";$("#formMessage").textContent=e.message}}
$("#releaseForm").addEventListener("submit",async e=>{e.preventDefault();const f=new FormData(e.currentTarget);try{const r=await api("/api/releases",{method:"POST",body:JSON.stringify({title:f.get("title"),source:{repo:"thelingolegacy-blip/TheLingoLegacy",branch:f.get("branch"),commit:f.get("commit").toLowerCase()},target:f.get("target")})});$("#formMessage").textContent="Created "+r.release.id+" · Draft only. Run probes from the package detail/API.";e.currentTarget.reset();e.currentTarget.elements.branch.value="main";await refresh()}catch(err){$("#formMessage").textContent=err.message}});
$("#refresh").addEventListener("click",refresh);
renderCenters();refresh();
