const $=id=>document.getElementById(id);
const output=$("output"),status=$("status");
const show=(value)=>{output.textContent=JSON.stringify(value,null,2)};
async function request(path,token,options={}) {
  const response=await fetch(path,{...options,headers:{...(options.headers||{}),authorization:"Bearer "+token,...(options.body?{"content-type":"application/json"}:{})}});
  const body=await response.json().catch(()=>({error:"invalid_response"}));
  if(!response.ok) throw new Error(JSON.stringify(body));
  return body;
}
$("health").addEventListener("click",async()=>{try{const r=await fetch("/healthz");show(await r.json());status.textContent="Liveness check completed."}catch(e){status.textContent=e.message}});
$("search").addEventListener("click",async()=>{try{const token=$("readToken").value;if(!token)throw new Error("Enter a reader token.");const q=encodeURIComponent($("query").value);const result=await request("/api/v1/records?q="+q,token);show(result);status.textContent=result.count+" record(s) returned. Search respects token classification."}catch(e){status.textContent=e.message}});
$("create").addEventListener("click",async()=>{try{const token=$("adminToken").value;if(!token)throw new Error("Enter an admin token.");const record=JSON.parse($("record").value);const result=await request("/api/v1/records",token,{method:"POST",body:JSON.stringify(record)});show(result);status.textContent="Proposed record stored; it is not yet verified."}catch(e){status.textContent=e.message}});
$("verify").addEventListener("click",async()=>{try{const token=$("reviewToken").value,id=encodeURIComponent($("recordId").value);if(!token||!id)throw new Error("Enter reviewer token and record ID.");const result=await request("/api/v1/records/"+id+"/verify",token,{method:"POST"});show(result);status.textContent="Knowledge record independently marked verified."}catch(e){status.textContent=e.message}});
