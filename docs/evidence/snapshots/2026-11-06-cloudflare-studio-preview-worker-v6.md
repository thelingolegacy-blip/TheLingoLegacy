# Forensic Snapshot — Cloudflare Studio Preview Worker v6

**Classification:** EVIDENCE ONLY — NOT CANONICAL SOURCE — NOT DEPLOYABLE  
**Captured:** 2026-11-06 (UTC)  
**Cloudflare account:** `16cb6f247cd1b28fca864760c7269606`  
**Worker script:** `lingo-studio-control-center-staging`  
**Active version:** `6`  
**Version ID:** `e142ffd0-8e76-495d-a9f0-e6a3c9ef3558`  
**Deployment ID:** `a61fd6e1-65b8-47e1-9cd0-a04f1b307669`  
**Version created:** `2026-11-06T03:37:56.109299Z`  
**Script ETag:** `a4af202764fb4914a0bd109796432b539fe3b6a380b2832358d599a10dff39de`  
**Compatibility date:** `2026-11-02`  
**Cloudflare script content SHA-256 (UTF-8 source bytes):** `unavailable`

## Handling rules

This file preserves the source body returned by Cloudflare's read-only `GET /content/v2` endpoint for the active version at capture time. It is a forensic snapshot to enable review and comparison. It does **not** establish authorship, approval, source ownership, or a canonical GitHub deployment workflow. Do not point Wrangler, CI, or deployment automation at this file. Do not deploy it. First establish owner approval, intended environment semantics, and source-to-deployment provenance.

The Worker Domain metadata is separately recorded as environment `production`, while this source declares `ENVIRONMENT = "staging"`. That discrepancy remains unresolved.

## Captured source

```javascript
const ROUTES = [["universe","https://lingolegacy-universe-gateway-h6kqu4.v2.appdeploy.ai"],["control-center","https://lingo-enterprise-control-center-qos4ix.v2.appdeploy.ai"],["loyalty","https://lingoloyalty-staging-preview-x4ld0h.v2.appdeploy.ai"],["asklingo","https://lingo-ai-sonic-boom-2030-7plgl2.v2.appdeploy.ai"],["studio","https://lingo-legacy-studio-hub-nhda3b.v2.appdeploy.ai"],["master-plan","https://lingo-legacy-master-project-plan-rkh6r6.v2.appdeploy.ai"],["runtime","https://hello-the-lingo-legacy-ois1rj.v2.appdeploy.ai"],["thats-my-lingo","https://that-s-my-lingo-casino-studio-2xntye.v2.appdeploy.ai"],["arcade","https://lingo-legacy-universe-rpekc0.v2.appdeploy.ai"],["verification","https://lingo-legacy-verification-bridge-wwagn2.v2.appdeploy.ai"],["jersey-shore","https://jersey-shore-the-undead-l4h5ea.v2.appdeploy.ai"],["hq","https://the-lingo-legacy-hq-vhjt6i.v2.appdeploy.ai"],["kottonscode","https://kotton-s-code-cartoon-studio-509py3.v2.appdeploy.ai"],["loyalty-lane","https://loyalty-lane-community-hub-zb39n2.v2.appdeploy.ai"],["crazy-weasels","https://crazy-weasels-0j3ujc.v2.appdeploy.ai"],["travel","https://lingo-traveltm-uyd57n.v2.appdeploy.ai"]];
const ENVIRONMENT = "staging";
const UNIVERSE_ORIGIN = ROUTES.find(([slug])=>slug==="universe")[1];
const UNIVERSE_STATIC_PAGE_SLUGS = new Set(["legacy","slots","arcade","library","media","world","lane","legacyxclub","studio"]);
const INDEX = `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LINGOlegacy Studio Preview</title><style>body{font:16px system-ui;background:#0c0b10;color:#f6f1f3;margin:0;padding:28px}main{max-width:900px;margin:auto}h1{color:#ff8297}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}.card{padding:16px;border:1px solid #53303d;border-radius:12px;background:#19141b}a{color:#ffb2c0;text-decoration:none;font-weight:650}.muted{color:#b7aab1;font-size:13px}</style><main><p class="muted">LINGOLEGACY · STAGING ONLY · READ-ONLY PREVIEW</p><h1>Studio Control Center — Application Gateway</h1><p class="muted">16 registered application surfaces. This gateway is a static preview proxy; application APIs, writes, authentication callbacks and production routing are not exposed.</p><p><a href="/healthz/apps">Run 16-origin health check</a></p><section class="grid">${ROUTES.map(([slug])=>'<article class="card"><a href="/apps/'+slug+'/">Open '+slug+'</a></article>').join('')}</section></main></html>`;
function response(body,status=200,headers={}) { const h=new Headers(headers);h.set("x-content-type-options","nosniff");h.set("referrer-policy","strict-origin-when-cross-origin");h.set("x-frame-options","SAMEORIGIN");h.set("cache-control","no-store");h.set("content-security-policy","default-src 'self' https: data:; object-src 'none'; base-uri 'self'; frame-ancestors 'self'");return new Response(body,{status,headers:h});}
async function proxyStaticAsset(request,target) {
 const headers=new Headers();
 for(const name of ["accept","accept-language","range"]) {const value=request.headers.get(name);if(value)headers.set(name,value);}
 let upstream;
 try {upstream=await fetch(new Request(target.toString(),{method:request.method,headers,redirect:"manual"}));}
 catch {return response("Static asset unavailable.",502);}
 if(upstream.status>=300&&upstream.status<400) return response("Static asset redirect blocked.",502);
 const h=new Headers(upstream.headers);
 h.delete("set-cookie");h.delete("server");
 h.set("cache-control","no-store");h.set("x-content-type-options","nosniff");
 h.set("referrer-policy","strict-origin-when-cross-origin");h.set("x-frame-options","SAMEORIGIN");
 return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers:h});
}
function safeStaticPath(path) {
 let decoded;
 try {decoded=decodeURIComponent(path);} catch {return false;}
 return !!decoded&&!decoded.startsWith("/")&&!decoded.includes("\\")&&!decoded.includes(String.fromCharCode(0))&&!decoded.split("/").some(part=>part==="."||part==="..");
}
class Rewriter { constructor(prefix){this.prefix=prefix;} element(el){for(const a of ["href","src","action","poster"]){const v=el.getAttribute(a);if(v&&v.startsWith("/")&&!v.startsWith("//"))el.setAttribute(a,this.prefix.slice(0,-1)+v);else if(v&&v.startsWith("./"))el.setAttribute(a,this.prefix+v.slice(2));}}}
export default { async fetch(request) {
 if (ENVIRONMENT !== "staging") return new Response("Staging environment required.", { status: 503 });
 if(request.method!=="GET"&&request.method!=="HEAD") return response("Read-only staging preview. Method not allowed.",405,{allow:"GET, HEAD"});
 const incoming=new URL(request.url);
if(incoming.pathname.startsWith("/_next/static/")){
  const relative=incoming.pathname.slice("/_next/static/".length);
  if(!safeStaticPath(relative)) return response("Invalid static asset path.",400);
  const target=new URL(incoming.pathname,UNIVERSE_ORIGIN);
  target.search=incoming.search;
  return proxyStaticAsset(request,target);
 }
 const dataMatch=incoming.pathname.match(/^\/_next\/data\/([A-Za-z0-9_-]{1,64})\/([a-z0-9-]+)\.json$/);
 if(dataMatch){
  const pageSlug=dataMatch[2];
  const slugValues=incoming.searchParams.getAll("slug");
  if(!UNIVERSE_STATIC_PAGE_SLUGS.has(pageSlug)||slugValues.length!==1||slugValues[0]!==pageSlug||[...incoming.searchParams.keys()].length!==1) return response("Static page data path not allowed.",403);
  const target=new URL(incoming.pathname,UNIVERSE_ORIGIN);
  target.search=incoming.search;
  return proxyStaticAsset(request,target);
 }
 if(incoming.pathname.startsWith("/_next/data/")) return response("Protected application data paths are not proxied.",403);
 if(incoming.pathname==="/_next/image"||incoming.pathname.startsWith("/_next/image/")) return response("Image optimization route is not proxied.",403);
 if(/^\/(?:api|auth|oauth|admin|__)(?:\/|$)/i.test(incoming.pathname)) return response("Protected application endpoints are not proxied.",403);
 if(/^\/resources\/KottonsCode-world-[1-4]\.jpeg$/i.test(incoming.pathname)){
  const item=ROUTES.find(([slug])=>slug==="kottonscode");
  if(!item) return response("Static asset origin unavailable.",502);
  const target=new URL(incoming.pathname,item[1]);
  let asset;
  try { asset=await fetch(new Request(target.toString(),{method:request.method,redirect:"manual"})); }
  catch { return response("Static asset unavailable.",502); }
  if(asset.status>=300&&asset.status<400) return response("Static asset redirect blocked.",502);
  const h=new Headers(asset.headers);
  h.delete("set-cookie");h.delete("server");
  h.set("cache-control","no-store");h.set("x-content-type-options","nosniff");
  h.set("referrer-policy","strict-origin-when-cross-origin");h.set("x-frame-options","SAMEORIGIN");
  return new Response(asset.body,{status:asset.status,statusText:asset.statusText,headers:h});
 }
 if(incoming.pathname==="/healthz/apps"){const checks=await Promise.all(ROUTES.map(async ([slug,origin])=>{try{const result=await fetch(new Request(new URL("/",origin),{method:"HEAD",redirect:"manual"}));return {slug,status:result.status,ok:result.status>=200&&result.status<400};}catch{return {slug,status:null,ok:false};}}));return response(JSON.stringify({service:"lingo-studio-control-center-staging",environment:"staging",checked:checks.length,ok:checks.every(x=>x.ok),checks}),200,{"content-type":"application/json"});}
 if(incoming.pathname==="/healthz") return response(JSON.stringify({service:"lingo-studio-control-center-staging",environment:"staging",status:"ready",routeCount:ROUTES.length,mode:"read-only"}),200,{"content-type":"application/json"});
 if(incoming.pathname==="/") return response(INDEX,200,{"content-type":"text/html; charset=utf-8"});
 
 const parts=incoming.pathname.split("/");
 if(parts.length<4||parts[1]!=="apps") return response("Route not registered.",404);
 const slug=parts[2];
 const item=ROUTES.find(([s])=>s===slug);
 if(!item) return response("Application not registered.",404);
 const prefix="/apps/"+slug+"/";
 if(!incoming.pathname.startsWith(prefix)) return response("Invalid route.",404);
 const rawRemainder=incoming.pathname.slice(prefix.length);
 let decoded;
 try { decoded=decodeURIComponent(rawRemainder); } catch { return response("Invalid path encoding.",400); }
 if(decoded.startsWith("/")||decoded.includes("\\")||decoded.includes("\0")||decoded.split("/").some(s=>s==="."||s==="..")) return response("Invalid path.",400);
 const first=decoded.split("/")[0].toLowerCase();
 if(["api","auth","oauth","admin","__"].includes(first)||(first==="_next"&&!decoded.startsWith("_next/static/"))||first.startsWith(".env")) return response("Protected application endpoints are not proxied.",403);
 const origin=new URL(item[1]);
 const upstream=new URL("/"+rawRemainder,origin);
 if(upstream.origin!==origin.origin) return response("Origin mismatch.",400);
 upstream.search=incoming.search;
 const headers=new Headers();
 for(const name of ["accept","accept-language","range"]) {const value=request.headers.get(name);if(value)headers.set(name,value);}
 let upstreamResponse;
 try {upstreamResponse=await fetch(new Request(upstream.toString(),{method:request.method,headers,redirect:"manual"}));}
 catch {return response("Upstream unavailable.",502);}
 const outHeaders=new Headers(upstreamResponse.headers);
 outHeaders.delete("set-cookie");outHeaders.delete("server");outHeaders.set("cache-control","no-store");outHeaders.set("x-content-type-options","nosniff");outHeaders.set("referrer-policy","strict-origin-when-cross-origin");outHeaders.set("x-frame-options","SAMEORIGIN");
 const location=outHeaders.get("location");
 if(location){const target=new URL(location,origin);if(target.origin!==origin.origin)return response("External redirect blocked.",502);outHeaders.set("location",prefix+target.pathname.replace(/^\//,"")+target.search+target.hash);}
 let out=new Response(upstreamResponse.body,{status:upstreamResponse.status,statusText:upstreamResponse.statusText,headers:outHeaders});
 if(request.method==="GET"&&(upstreamResponse.headers.get("content-type")||"").includes("text/html")) out=new HTMLRewriter().on("a[href],link[href],script[src],img[src],source[src],form[action]",new Rewriter(prefix)).transform(out);
 return out;
}};

```
