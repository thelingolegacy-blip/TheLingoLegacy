import { createServer } from "node:http";
import { timingSafeEqual } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { RecordStore, validateRecord } from "./record-store.mjs";
const packageDir = fileURLToPath(new URL("..", import.meta.url));
const dataFile = process.env.LKIS_DATA_FILE || resolve(packageDir, "var", "records.json");
const store = new RecordStore(dataFile);
const limit = 64 * 1024;
const levels = { public: 0, internal: 1, confidential: 2, restricted: 3 };
function safeEqual(a, b) { const x = Buffer.from(a), y = Buffer.from(b); return x.length === y.length && timingSafeEqual(x, y); }
function identify(req) {
  const token = (req.headers.authorization || "").replace(/^Bearer\s+/i, "");
  if (!token) return null;
  for (const [env, role, maxClass] of [["LKIS_ADMIN_TOKEN","admin",3],["LKIS_REVIEW_TOKEN","reviewer",2],["LKIS_CONFIDENTIAL_TOKEN","confidential_reader",2],["LKIS_READ_TOKEN","reader",1]]) {
    const expected = process.env[env]; if (expected && safeEqual(token, expected)) return { role, maxClass };
  }
  return null;
}
function send(res, status, body) { res.writeHead(status, { "content-type":"application/json; charset=utf-8", "cache-control":"no-store", "x-content-type-options":"nosniff" }); res.end(JSON.stringify(body)); }
async function bodyJson(req) {
  let raw = ""; for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw) > limit) throw Object.assign(new Error("Request body too large"), { status:413 }); }
  try { return JSON.parse(raw); } catch { throw Object.assign(new Error("Invalid JSON"), { status:400 }); }
}
function visible(row, actor) { return levels[row.record.classification] <= actor.maxClass; }
export function createLkisServer() {
  return createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      if (req.method === "GET" && url.pathname === "/healthz") return send(res,200,{status:"ok",service:"lkis-runtime",mode:"repository-backed-pilot"});
      if (req.method === "GET" && url.pathname === "/readyz") {
        try { await store.readAll(); return send(res,200,{status:"ready",storage:"readable",production_mutations:false}); }
        catch { return send(res,503,{status:"not_ready",storage:"unavailable"}); }
      }
      const actor = identify(req);
      if (!actor) return send(res,401,{error:"unauthorized",message:"A valid LKIS bearer token is required."});
      if (req.method === "GET" && url.pathname === "/api/v1/records") {
        const q=(url.searchParams.get("q")||"").trim().toLowerCase(), domain=url.searchParams.get("domain"), status=url.searchParams.get("status");
        const rows=(await store.list()).filter(row=>visible(row,actor)).filter(row=>!domain||row.record.domain===domain).filter(row=>!status||row.record.status===status).filter(row=>!q||[row.record.title,row.record.statement,row.record.domain,row.record.knowledge_type].join(" ").toLowerCase().includes(q));
        return send(res,200,{count:rows.length,records:rows});
      }
      if (req.method === "GET" && url.pathname === "/api/v1/assistant/context") {
        const q=(url.searchParams.get("q")||"").trim().toLowerCase(); if(!q) return send(res,400,{error:"query_required"});
        const rows=(await store.list()).filter(row=>visible(row,actor)&&row.record.status==="verified").filter(row=>[row.record.title,row.record.statement,row.record.domain].join(" ").toLowerCase().includes(q)).slice(0,10);
        return send(res,200,{mode:"retrieval_only",generated_answer:false,query:q,records:rows.map(row=>({id:row.record.id,title:row.record.title,statement:row.record.statement,source_refs:row.record.source_refs,evidence_refs:row.record.evidence_refs||[],observed_at:row.record.observed_at,status:row.record.status,sha256:row.sha256})),citations_required:true});
      }
      if (req.method === "POST" && url.pathname === "/api/v1/records") {
        if(actor.role!=="admin") return send(res,403,{error:"write_forbidden"});
        const record=await bodyJson(req), errors=validateRecord(record);
        if(errors.length) return send(res,422,{error:"schema_validation_failed",details:errors});
        if(record.status!=="proposed") return send(res,422,{error:"new_records_must_be_proposed"});
        const result=await store.create(record); if(result.conflict) return send(res,409,{error:"record_id_exists"});
        return send(res,201,{created:true,record:result.row});
      }
      const verifyMatch=url.pathname.match(/^\/api\/v1\/records\/([a-z0-9._:-]{3,128})\/verify$/);
      if(req.method==="POST"&&verifyMatch){
        if(actor.role!=="reviewer") return send(res,403,{error:"independent_reviewer_token_required"});
        if(!process.env.LKIS_REVIEWER_ID) return send(res,503,{error:"reviewer_identity_not_configured"});
        const existing=(await store.list()).find(row=>row.record.id===verifyMatch[1]);
        if(!existing || !visible(existing,actor)) return send(res,404,{error:"record_not_found"});
        const result=await store.verify(verifyMatch[1],process.env.LKIS_REVIEWER_ID);
        if(result.missing) return send(res,404,{error:"record_not_found"});
        if(result.missingEvidence) return send(res,422,{error:"evidence_refs_required"});
        if(result.conflict) return send(res,409,{error:"record_not_proposed",current_status:result.status});
        return send(res,200,{verified:true,record:result.row});
      }
      return send(res,404,{error:"not_found"});
    } catch(error){ return send(res,error.status||500,{error:error.status?error.message:"internal_error"}); }
  });
}
if(process.argv[1]===fileURLToPath(import.meta.url)){
  const port=Number(process.env.PORT||8787); if(!Number.isInteger(port)||port<1||port>65535) throw new Error("PORT must be a valid TCP port");
  const server=createLkisServer(); server.listen(port,"127.0.0.1",()=>process.stdout.write("LKIS pilot listening on http://127.0.0.1:"+port+"\n"));
}
