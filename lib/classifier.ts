export type ClipType="standalone"|"compilation"|"ranking"|"mashup"|"reaction"|"unknown";
export type Classification={type:ClipType;confidence:number;reasons:string[]};
type Rule={type:Exclude<ClipType,"standalone"|"unknown">;terms:string[];weight:number};
const rules:Rule[]=[
 {type:"compilation",weight:19,terms:["compilation","best moments","funniest moments","funny moments","collection of clips","clip collection","montage","all moments","every moment","hour of","mega compilation","ultimate compilation","clips compilation","full compilation","try not to laugh"]},
 {type:"ranking",weight:25,terms:["top 10","top 5","top 20","top 100","top ten","ranking","ranked","tier list","best to worst","worst to best","countdown","number one","#1","1-10"]},
 {type:"mashup",weight:21,terms:["mashup","mix of clips","mixed clips","mega edit","edit compilation","supercut","clip mix","fan edit","multi clip","multiple clips","best of"]},
 {type:"reaction",weight:17,terms:["reaction","reacts to","reacting to","watching","commentary","my reaction","react channel","responding to","reacts"]},
];
const standaloneTerms=["caught on camera","one moment","this happened","single clip","original clip","original video","short clip","incident","prank","caught","unexpected","watch this","real footage"];
function normalize(text:string){return text.toLowerCase().replace(/[#_\-]+/g," ").replace(/\s+/g," ").trim();}
export function classify(input:{title?:string;description?:string;tags?:string[];durationSeconds?:number}):Classification{
 const text=normalize([input.title,input.description,...(input.tags||[])].filter(Boolean).join(" "));const scores=new Map<ClipType,{score:number;reasons:string[]}>();
 for(const rule of rules){const hits=rule.terms.filter(t=>text.includes(t));if(hits.length)scores.set(rule.type,{score:Math.min(100,hits.reduce((s,h)=>s+rule.weight+Math.min(10,Math.floor(h.length/12)),0)),reasons:hits.slice(0,4).map(h=>`matched “${h}”`)});}
 const standaloneHits=standaloneTerms.filter(t=>text.includes(t));const seconds=input.durationSeconds||0;const longForm=seconds>=900, shortForm=seconds>0&&seconds<=180;
 if(!scores.size){const confidence=Math.min(96,58+standaloneHits.length*7+(shortForm?8:0)-(longForm?10:0));return{type:"standalone",confidence,reasons:standaloneHits.length?standaloneHits.slice(0,4).map(x=>`standalone signal “${x}”`):["No strong multi-clip signal found"]};}
 const ranked=[...scores.entries()].sort((a,b)=>b[1].score-a[1].score);const [type,data]=ranked[0];const boost=shortForm&&type!=="reaction"?4:0;const confidence=Math.min(99,Math.max(55,data.score+boost));return{type,confidence,reasons:data.reasons.concat(longForm?["long-form signal"]:[]).slice(0,5)};
}
export function keepClassification(c:Classification){return c.type==="standalone"||c.confidence<72;}