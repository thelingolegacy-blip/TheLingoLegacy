addEventListener("fetch", event => {
  event.respondWith(handle(event.request));
});

const studioCss = `
:root{--cr:#b11226;--wh:#f5f5f5;--no:#070707;--sm:rgba(255,255,255,.08)}
*{box-sizing:border-box}body{margin:0;background:radial-gradient(circle at 15% 10%,#4b0714 0,transparent 35%),radial-gradient(circle at 85% 20%,#2b2b2b 0,transparent 30%),#070707;color:var(--wh);font:16px system-ui,sans-serif;min-height:100vh}
header{position:sticky;top:0;z-index:4;background:#070707dd;backdrop-filter:blur(16px);border-bottom:1px solid #b112264d}
nav{width:min(1200px,calc(100% - 32px));height:70px;margin:auto;display:flex;align-items:center;justify-content:space-between}
.brand{font-weight:950;letter-spacing:.06em}.brand i{color:var(--cr);font-style:normal}.nav a{color:#aaa;text-decoration:none;margin-left:18px}
.wrap{width:min(1200px,calc(100% - 32px));margin:auto}.hero{min-height:72vh;display:grid;place-items:center;text-align:center;padding:70px 0}
.hero h1{font-size:clamp(3rem,9vw,8rem);line-height:.86;letter-spacing:-.08em;margin:0;text-transform:uppercase}.hero h1 span{color:var(--cr)}
.hero p{max-width:720px;margin:24px auto;color:#aaa;font-size:1.15rem;line-height:1.7}.actions{display:flex;justify-content:center;gap:12px;flex-wrap:wrap}
.btn{border:1px solid var(--cr);border-radius:999px;padding:13px 20px;background:#111;color:#fff;font-weight:800;text-decoration:none;cursor:pointer}.btn.primary{background:var(--cr)}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;padding:30px 0 90px}.card{border:1px solid var(--sm);border-radius:24px;padding:22px;background:linear-gradient(160deg,#ffffff0d,#ffffff03);box-shadow:0 25px 70px #0008}
.card p{color:#aaa;line-height:1.6}.live{display:inline-flex;gap:8px;align-items:center;color:#aaa;font-size:.8rem;letter-spacing:.12em;text-transform:uppercase}.dot{width:8px;height:8px;background:var(--cr);border-radius:50%;box-shadow:0 0 16px var(--cr)}
#ask{position:fixed;right:18px;bottom:18px;z-index:20}.launcher{width:60px;height:60px;border-radius:18px;border:1px solid var(--cr);background:#0a0a0a;color:#fff;font-size:25px;box-shadow:0 16px 50px #000c;cursor:pointer}
.panel{display:none;width:min(390px,calc(100vw - 28px));height:min(520px,calc(100vh - 100px));border:1px solid var(--cr);border-radius:22px;background:#090909;color:#fff;box-shadow:0 25px 80px #000e;overflow:hidden}
.panel.open{display:flex;flex-direction:column}.head{padding:15px 17px;border-bottom:1px solid var(--sm);display:flex;justify-content:space-between}.body{flex:1;padding:15px;overflow:auto}
.msg{padding:10px 12px;margin:8px 0;border-radius:12px;background:#151515;border:1px solid var(--sm);line-height:1.45}.msg.u{border-color:var(--cr);text-align:right}
.input{display:flex;gap:7px;padding:10px;border-top:1px solid var(--sm)}.input input{flex:1;background:#050505;border:1px solid #333;color:#fff;border-radius:10px;padding:11px}
.input button{border-radius:10px;border:1px solid var(--cr);background:var(--cr);color:#fff;padding:0 14px}
@media(max-width:760px){.nav{display:none}.grid{grid-template-columns:1fr}}
`;

const page = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>The Lingo Legacy — Cloudflare Studio</title><style>${studioCss}</style></head><body>
<header><nav><div class="brand"><i>LINGO</i> LEGACY</div><div class="nav"><a href="/">Home</a><a href="#worlds">Worlds</a><a href="#studio">Studio</a></div></nav></header>
<main class="wrap"><section class="hero"><div><div class="live"><span class="dot"></span> Cloudflare Studio Build</div><h1>The Lingo <span>Legacy</span></h1><p>Crimson / White / Shadow Noire studio shell with the askLINGO live interface. Built from the GitHub source lane for Cloudflare Workers.</p><div class="actions"><a class="btn primary" href="#studio">Enter Studio</a><button class="btn" id="openAsk">askLINGO</button></div></div></section>
<section id="studio" class="grid"><article class="card"><h3>LINGOarcade</h3><p>Unified game-world navigation for the Legacy universe.</p></article><article class="card"><h3>Thats My Lingo</h3><p>5×3 reels, 20 paylines, demo-coin entertainment surface.</p></article><article class="card" id="worlds"><h3>Kottons Code</h3><p>Story, family, learning, and world-building lane.</p></article></section></main>
<div id="ask"><button id="launcher" class="launcher">⌁</button><div id="panel" class="panel"><div class="head"><b>askLINGO · LIVE STUDIO</b><button id="close" class="launcher" style="width:34px;height:34px;font-size:18px">×</button></div><div id="body" class="body"><div class="msg">Welcome to the live studio. Ask where you want to go.</div></div><div class="input"><input id="input" placeholder="Ask askLINGO…"><button id="send">Send</button></div></div></div>
<script>
const panel=document.getElementById("panel"),launcher=document.getElementById("launcher"),close=document.getElementById("close"),body=document.getElementById("body"),input=document.getElementById("input"),send=document.getElementById("send"),openAsk=document.getElementById("openAsk");
function say(t,u){const d=document.createElement("div");d.className="msg"+(u?" u":"");d.textContent=t;body.appendChild(d);body.scrollTop=body.scrollHeight}
function answer(q){const x=q.toLowerCase();if(x.includes("game")||x.includes("world"))return"Use the Studio navigation to explore LINGOarcade, Thats My Lingo, and Kottons Code.";if(x.includes("legacy"))return"The Lingo Legacy is the connected studio universe for games, stories, commerce, media, and community.";return"I can route you through Legacy, Worlds, Game, Kottons Code, or Studio."}
function submit(){const q=input.value.trim();if(!q)return;input.value="";say(q,true);setTimeout(()=>say(answer(q),false),160)}
function show(){panel.classList.add("open");launcher.style.display="none";input.focus()}function hide(){panel.classList.remove("open");launcher.style.display="block"}
launcher.onclick=show;openAsk.onclick=show;close.onclick=hide;send.onclick=submit;input.onkeydown=e=>{if(e.key==="Enter")submit()};
</script></body></html>`;

async function handle(request){
  const url=new URL(request.url);
  if(url.pathname==="/api/health")return new Response(JSON.stringify({status:"ok",build:"cloudflare-studio",source:"github",production:false}),{headers:{"content-type":"application/json"}});
  return new Response(page,{headers:{"content-type":"text/html;charset=UTF-8","cache-control":"no-store"}});
}
