const CATALOG = [
  {id:"tee-legacy",name:"Legacy Block Tee",category:"clothing",price:35,active:true},
  {id:"hoodie-copper",name:"Copperline Hoodie",category:"clothing",price:80,active:true},
  {id:"sneakers",name:"Corner-Cut Sneakers",category:"clothing",price:65,active:true},
  {id:"cap",name:"Money Mile Snapback",category:"clothing",price:30,active:true},
  {id:"backpack",name:"Everyday Utility Pack",category:"gear",price:55,active:true},
  {id:"headphones",name:"Studio Headphones",category:"gear",price:70,active:true},
  {id:"watch",name:"Block-Time Watch",category:"gear",price:90,active:true},
  {id:"bike",name:"Neighborhood Bike",category:"transport",price:140,active:true},
  {id:"board",name:"Street Cruiser Board",category:"transport",price:95,active:true},
  {id:"scooter",name:"Electric Scooter Concept",category:"transport",price:220,active:true},
  {id:"savings",name:"Savings Habit Badge",category:"banking",price:20,active:true},
  {id:"budgetbook",name:"Pocket Budget Book",category:"banking",price:25,active:true},
  {id:"repairkit",name:"Street Repair Kit",category:"tools",price:75,active:true},
  {id:"flashlight",name:"Oasis Flashlight",category:"tools",price:45,active:true},
  {id:"mapcase",name:"Waterproof Map Case",category:"tools",price:40,active:true},
  {id:"workbench",name:"Home Workshop Upgrade",category:"tools",price:180,active:true}
];
const CATEGORIES = new Set(["clothing","gear","transport","banking","tools"]);
const json = (data, status=200, extra={}) => new Response(JSON.stringify(data), {
  status, headers: {"content-type":"application/json; charset=utf-8","cache-control":"no-store","x-content-type-options":"nosniff",...extra}
});
function cors(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map(s=>s.trim()).filter(Boolean);
  if (!origin) return {};
  if (!allowed.includes(origin)) return {"vary":"Origin"};
  return {"access-control-allow-origin":origin,"access-control-allow-methods":"GET,POST,OPTIONS","access-control-allow-headers":"Authorization,Content-Type,Idempotency-Key","vary":"Origin"};
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = cors(request, env);
    if (request.method === "OPTIONS") return new Response(null,{status:204,headers});
    if (!url.pathname.startsWith("/api/oasis/v1/")) return json({error:"NOT_FOUND"},404,headers);
    if (url.pathname === "/api/oasis/v1/healthz" && request.method === "GET") {
      return json({ok:true,service:"oasis-edge-api",backend:env.OASIS_BACKEND_URL?"configured":"not-configured",payments:"disabled",gps:"off"},200,headers);
    }
    if (url.pathname === "/api/oasis/v1/catalog" && request.method === "GET") {
      const category=url.searchParams.get("category");
      if (category && !CATEGORIES.has(category)) return json({error:"INVALID_CATEGORY"},400,headers);
      const items=CATALOG.filter(i=>i.active && (!category||i.category===category)).map(({active,...item})=>item);
      return new Response(JSON.stringify({items,virtualCurrency:"DOUGH",cashValue:false}),{
        status:200,headers:{"content-type":"application/json; charset=utf-8","cache-control":"public, max-age=60, s-maxage=300","x-content-type-options":"nosniff",...headers}
      });
    }
    if (url.pathname === "/api/oasis/v1/map/landmarks" && request.method === "GET") {
      return json({mode:"fictional-static",landmarks:["Money Mile","Player HQ","Community Clinic","Library","Workshop","Transit Stop"],gpsEnabled:false},200,headers);
    }
    if (url.pathname === "/api/oasis/v1/location/unlock") {
      return json({error:"FEATURE_DISABLED",message:"Location unlock is disabled pending explicit privacy and security approval."},403,headers);
    }
    if (!["GET","POST"].includes(request.method)) return json({error:"METHOD_NOT_ALLOWED"},405,headers);
    // Fail closed until a trusted Firebase-backed API is provisioned and its token
    // verification, rate limits, idempotency and Firestore transaction tests pass.
    if (!env.OASIS_BACKEND_URL) return json({error:"BACKEND_NOT_CONFIGURED"},503,headers);
    const auth=request.headers.get("Authorization")||"";
    if (!auth.startsWith("Bearer ")) return json({error:"UNAUTHENTICATED"},401,headers);
    // Backend must verify Firebase ID tokens. Never treat this edge check as identity proof.
    const upstreamPath=url.pathname.replace("/api/oasis/v1","");
    const upstream=new URL(upstreamPath,env.OASIS_BACKEND_URL);
    upstream.search=url.search;
    const forwarded=new Request(upstream.toString(),request);
    const response=await fetch(forwarded,{redirect:"manual"});
    const body=await response.arrayBuffer();
    return new Response(body,{status:response.status,headers:{"content-type":response.headers.get("content-type")||"application/json","cache-control":"no-store","x-content-type-options":"nosniff",...headers}});
  }
};
