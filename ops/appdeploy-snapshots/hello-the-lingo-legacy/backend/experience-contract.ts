import { db } from '@appdeploy/sdk';

type RecordValue=Record<string,unknown>;
const now=()=>new Date().toISOString();
export async function getExperienceContract(appId:string){const {items}=await db.list<RecordValue>('experience_contracts',{limit:50});const found=items.find(item=>item.app_id===appId);return found??{app_id:appId,experience_id:`experience-${appId}`,publication_state:'DRAFT',media:{},animations:{},sounds:{},tap_stitch:{enabled:false},game:{enabled:false},commerce:{enabled:false},xp_rewards:{enabled:false},analytics:{events:[]},updated_at:now()};}
