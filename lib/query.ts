const stopWords=new Set(["the","a","an","of","and","or","to","for","in","on","with","video","videos","clip","clips","please","show","me"]);
export function cleanQuery(q:string){return q.replace(/[\u0000-\u001f]/g," ").replace(/\s+/g," ").trim().slice(0,180);}
export function tokenize(q:string){return cleanQuery(q).toLowerCase().split(/[^a-z0-9]+/).filter(x=>x.length>1&&!stopWords.has(x));}
export function queryKey(q:string){return tokenize(q).join(" ");}
export function highlightTerms(text:string,q:string){const terms=tokenize(q);return terms.reduce((n,t)=>n+(text.toLowerCase().includes(t)?1:0),0);}