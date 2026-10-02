export type PlatformId = "youtube" | "tiktok" | "reddit" | "instagram" | "x" | "facebook" | "twitch" | "dailymotion";
export type Platform = "YouTube" | "TikTok" | "Reddit" | "Instagram" | "X" | "Facebook" | "Twitch" | "Dailymotion";
export type ClipType = "standalone" | "compilation" | "ranking" | "reaction" | "mashup" | "unknown";
export type SortMode = "relevance" | "recent" | "duration" | "score";
export type DurationFilter = "any" | "under60" | "under180" | "1to10" | "over10";
export type VideoResult = {
  id: string; sourceId?: string; platform: Platform; platformId?: PlatformId;
  creator: string; title: string; description: string; tags?: string[];
  duration: string; durationSeconds: number; publishedAt: string; age: string;
  thumbnail: string; url: string;
  classification: { type: ClipType; confidence: number; reasons: string[] };
  score: number;
  viewCount?: number;
};
export type SearchOptions = { query: string; limit?: number };
export type VideoConnector = { id: PlatformId; name: Platform; search(options: SearchOptions): Promise<VideoResult[]> };