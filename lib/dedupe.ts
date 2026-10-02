export function normalizeTitle(value:string){return value.toLowerCase().replace(/https?:\/\/\S+/g,"").replace(/[^a-z0-9\s]/g," ").replace(/\s+/g," ").trim();}
function creatorKey(value:string){return normalizeTitle(value).slice(0,80);}
function tokenSet(value:string){return new Set(normalizeTitle(value).split(" ").filter(Boolean));}
function similarity(a:string,b:string){const A=tokenSet(a),B=tokenSet(b);if(!A.size||!B.size)return 0;let hit=0;A.forEach(x=>{if(B.has(x))hit++});return hit/Math.max(A.size,B.size);}
export function canonicalUrl(value:string){try{const u=new URL(value);["utm_source","utm_medium","utm_campaign","utm_content","utm_term","si"].forEach(k=>u.searchParams.delete(k));return u.toString().replace(/\/$/,"").toLowerCase();}catch{return value.toLowerCase();}}
export function dedupe<T extends {platform:string;id:string;title?:string;creator?:string;url?:string}>(items:T[]){
 const seenIds=new Set<string>(), seenUrls=new Set<string>(), kept:T[]=[];
 for(const item of items){const idKey=`${item.platform}:${item.id}`.toLowerCase();if(seenIds.has(idKey))continue;seenIds.add(idKey);
  const url=canonicalUrl(item.url||"");if(url&&seenUrls.has(url))continue;if(url)seenUrls.add(url);
  const duplicate=kept.some(prev=>prev.platform===item.platform&&creatorKey(prev.creator||"")===creatorKey(item.creator||"")&&similarity(prev.title||"",item.title||"")>=.86);
  if(duplicate)continue;kept.push(item);
 }return kept;
}