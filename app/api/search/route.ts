import { NextRequest, NextResponse } from "next/server";
import { searchAll } from "../../../lib/search";
import type { DurationFilter, PlatformId, SortMode } from "../../../lib/types";
export const runtime = "nodejs"; export const dynamic = "force-dynamic";
const platforms = new Set<PlatformId | "all">(["all", "youtube", "tiktok", "reddit", "instagram", "x", "facebook", "twitch", "dailymotion"]);
const sorts = new Set<SortMode>(["relevance", "recent", "duration", "score"]);
const durations = new Set<DurationFilter>(["any", "under60", "under180", "1to10", "over10"]);
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url); const q=(searchParams.get("q")||"").trim();
  const platform=(searchParams.get("platform")||"all") as PlatformId|"all"; const sort=(searchParams.get("sort")||"relevance") as SortMode; const duration=(searchParams.get("duration")||"any") as DurationFilter;
  const parsedLimit=Number(searchParams.get("limit")||"24"); const limit=Number.isFinite(parsedLimit)?Math.max(1,Math.min(50,Math.floor(parsedLimit))):24;
  if(!q)return NextResponse.json({error:"Enter something to search for."},{status:400}); if(!platforms.has(platform))return NextResponse.json({error:"Unsupported platform filter."},{status:400}); if(!sorts.has(sort))return NextResponse.json({error:"Unsupported sort mode."},{status:400}); if(!durations.has(duration))return NextResponse.json({error:"Unsupported duration filter."},{status:400});
  try{return NextResponse.json(await searchAll(q,limit,platform,sort,duration),{headers:{"Cache-Control":"no-store"}})}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Search failed."},{status:500})}
}