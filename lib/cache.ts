type Entry<T>={value:T;expires:number};const cache=new Map<string,Entry<unknown>>();
export function cacheGet<T>(key:string):T|undefined{const e=cache.get(key);if(!e)return; if(e.expires<Date.now()){cache.delete(key);return;}return e.value as T;}
export function cacheSet<T>(key:string,value:T,ttlMs=30000){cache.set(key,{value,expires:Date.now()+ttlMs});}
export function cacheClear(){cache.clear();}