import { VideoResult } from "./types";
type Signal = { type: VideoResult["classification"]["type"]; words: string[]; weight: number };
const signals: Signal[] = [
  { type: "compilation", words: ["compilation", "best moments", "funniest moments", "funny moments", "clips", "collection", "montage", "all moments", "hour of", "mega compilation", "ultimate compilation"], weight: 30 },
  { type: "ranking", words: ["top 10", "top 5", "top 20", "top 100", "ranking", "ranked", "tier list", "best to worst", "worst to best", "countdown"], weight: 38 },
  { type: "mashup", words: ["mashup", "mix of", "mixed clips", "edit compilation", "supercut", "fan edit"], weight: 32 },
  { type: "reaction", words: ["reacts", "reaction", "reacting to", "watching", "commentary", "my reaction"], weight: 26 },
];
const standaloneSignals = ["caught on camera", "for the first time", "one moment", "this happened", "incident", "fails", "prank", "short clip", "original clip"];
export function classify(video: VideoResult): VideoResult {
  const haystack = `${video.title} ${video.description}`.toLowerCase();
  const scores = new Map<string, { score: number; reasons: string[] }>();
  for (const signal of signals) {
    const hits = signal.words.filter(word => haystack.includes(word));
    if (hits.length) scores.set(signal.type, {score: Math.min(99, hits.length * signal.weight + (hits.length > 1 ? 12 : 0)), reasons: hits.map(hit => `matched “${hit}”`)});
  }
  const standaloneHits = standaloneSignals.filter(word => haystack.includes(word));
  const ranked = [...scores.entries()].sort((a, b) => b[1].score - a[1].score);
  if (!ranked) return video;
  if (!ranked.length) {
    const confidence = Math.min(92, 58 + standaloneHits.length * 10 + (video.durationSeconds > 0 && video.durationSeconds < 180 ? 8 : 0));
    return {...video,classification:{type:"standalone",confidence,reasons:standaloneHits.length ? standaloneHits.map(x => `standalone signal “${x}”`) : ["No strong compilation, ranking, mashup or reaction signal found"]},score:Math.min(99, confidence + standaloneHits.length * 3)};
  }
  const [type, data] = ranked[0]; const shortClipBoost = video.durationSeconds > 0 && video.durationSeconds < 180 ? 5 : 0;
  const confidence = Math.min(99, data.score + shortClipBoost); const score = Math.max(1, 100 - data.score + standaloneHits.length * 4);
  return {...video,classification:{type:type as VideoResult["classification"]["type"],confidence,reasons:data.reasons},score:Math.min(99,score)};
}
export function shouldKeep(video: VideoResult): boolean {const {type,confidence}=video.classification;return type==="standalone"||confidence<72;}