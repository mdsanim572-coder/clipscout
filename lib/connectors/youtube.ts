import { classify } from "../classifier";
import { SearchOptions, VideoConnector, VideoResult } from "../types";
function isoDurationToSeconds(value: string): number { const m=value.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/); return m?Number(m[1]||0)*3600+Number(m[2]||0)*60+Number(m[3]||0):0; }
function formatDuration(s:number){const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sec=s%60;return h?`${h}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`:`${m}:${String(sec).padStart(2,"0")}`;}
function age(date:string){const days=Math.max(0,Math.floor((Date.now()-Date.parse(date))/86400000));if(days===0)return "today";if(days===1)return "1 day ago";if(days<7)return `${days} days ago`;if(days<30)return `${Math.floor(days/7)} weeks ago`;return `${Math.floor(days/30)} months ago`;}
export const youtubeConnector: VideoConnector = {
 id:"youtube", name:"YouTube",
 async search({query,limit=24}:SearchOptions){
  const key=process.env.YOUTUBE_API_KEY; if(!key)return [];
  const searchUrl=new URL("https://www.googleapis.com/youtube/v3/search");
  searchUrl.searchParams.set("key",key); searchUrl.searchParams.set("part","snippet"); searchUrl.searchParams.set("q",query); searchUrl.searchParams.set("type","video"); searchUrl.searchParams.set("maxResults",String(Math.min(limit,50)));
  const searchRes=await fetch(searchUrl,{next:{revalidate:60}}); if(!searchRes.ok)throw new Error(`YouTube search failed (${searchRes.status})`);
  const search=await searchRes.json(); const ids=(search.items||[]).map((x:any)=>x.id?.videoId).filter(Boolean).join(","); if(!ids)return [];
  const detailsUrl=new URL("https://www.googleapis.com/youtube/v3/videos"); detailsUrl.searchParams.set("key",key); detailsUrl.searchParams.set("part","contentDetails,snippet,statistics"); detailsUrl.searchParams.set("id",ids);
  const detailsRes=await fetch(detailsUrl,{next:{revalidate:60}}); if(!detailsRes.ok)throw new Error(`YouTube details failed (${detailsRes.status})`);
  const details=await detailsRes.json();
  return (details.items||[]).map((x:any):VideoResult=>{
   const s=x.snippet||{}, seconds=isoDurationToSeconds(x.contentDetails?.duration||"");
   const tags=Array.isArray(s.tags)?s.tags:[]; const classification=classify({title:s.title||"",description:s.description||"",tags,durationSeconds:seconds});
   const engagement=Number(x.statistics?.viewCount||0)>1000000?6:Number(x.statistics?.viewCount||0)>100000?3:0;
   return {id:`yt-${x.id}`,sourceId:x.id,platform:"YouTube",platformId:"youtube",creator:s.channelTitle||"Unknown creator",title:s.title||"Untitled",description:s.description||"",tags,duration:formatDuration(seconds),durationSeconds:seconds,publishedAt:s.publishedAt||"",age:age(s.publishedAt||new Date().toISOString()),thumbnail:s.thumbnails?.maxres?.url||s.thumbnails?.high?.url||s.thumbnails?.medium?.url||"",url:`https://www.youtube.com/watch?v=${x.id}`,classification,score:Math.min(99,60+engagement)};
  });
 }
};