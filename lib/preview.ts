import {createHandler,type Store,type Row} from '../cloud/tencent/handler';
// Isolated preview sandbox. No request is made to the production database.
const key='xiaoweng-checkin-test-v1';
const seed:Record<string,Row>={};
const read=():Record<string,Row>=>{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):structuredClone(seed)};
const store:Store={async saveCheckin(id,version,row,date){const rows=read(),path='study_entries/'+id;if((rows[path]?.version||0)!==version)return false;const key='study_progress/'+date,previous=rows[key];rows[path]=row;if(previous?.status!=='done')rows[key]={...previous,date,status:'done',deferredTo:'',version:(previous?.version||0)+1,updatedAt:row.updatedAt};localStorage.setItem('xiaoweng-checkin-test-v1',JSON.stringify(rows));return true;},async list(collection){return Object.entries(read()).filter(([id])=>id.startsWith(collection+'/')).map(([,row])=>row)},async save(collection,id,version,row){const rows=read(),path=collection+'/'+id;if((rows[path]?.version||0)!==version)return false;rows[path]=row;localStorage.setItem(key,JSON.stringify(rows));return true}};
const handle=createHandler(store);
export async function previewFetch(path:string,init?:RequestInit){const url=new URL(path,'https://preview.invalid');const result=await handle({path:url.pathname,method:init?.method||'GET',kind:url.searchParams.get('kind')||undefined,body:init?.body?JSON.parse(String(init.body)):undefined});return new Response(JSON.stringify(result.body),{status:result.status,headers:{'Content-Type':'application/json'}})}
