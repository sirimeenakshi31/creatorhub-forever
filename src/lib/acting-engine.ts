/**
 * Cinematic AI Visual Acting Engine
 * ---------------------------------
 * Pure-canvas, dependency-free renderer that turns storyboard metadata
 * (characters, action, emotion, location, weather, time of day) into an
 * animated performance: acting poses, facial animation, lip-sync, gestures
 * and living environments.
 *
 * Everything here is deterministic given (t, seed) so preview and export match.
 */

export type ActorAction =
  | "walking" | "running" | "sitting" | "standing" | "talking" | "looking-around"
  | "smiling" | "crying" | "laughing" | "hugging" | "waving" | "pointing"
  | "reading" | "writing" | "sleeping" | "jumping" | "dancing" | "swimming"
  | "flying" | "fighting" | "working" | "thinking" | "driving";

export type ActorEmotion =
  | "happy" | "sad" | "angry" | "fear" | "excited"
  | "hope" | "confused" | "inspired" | "calm" | "motivated" | "neutral";

export type CharacterType =
  | "girl" | "boy" | "baby" | "teacher" | "student" | "doctor"
  | "business" | "elderly" | "cartoon" | "anime" | "doll" | "fantasy" | "animal";

export type EnvironmentKind =
  | "river" | "forest" | "ocean" | "city" | "mountain" | "desert"
  | "space" | "indoor" | "office" | "classroom" | "field" | "abstract";

export type TimeOfDay = "dawn" | "day" | "sunset" | "night" | "unknown";
export type WeatherKind = "clear" | "rain" | "snow" | "fog" | "storm" | "wind" | "unknown";

export const ACTOR_ACTIONS: ActorAction[] = [
  "walking", "running", "sitting", "standing", "talking", "looking-around",
  "smiling", "crying", "laughing", "hugging", "waving", "pointing",
  "reading", "writing", "sleeping", "jumping", "dancing", "swimming",
  "flying", "fighting", "working", "thinking", "driving",
];

export const ACTOR_EMOTIONS: ActorEmotion[] = [
  "happy", "sad", "angry", "fear", "excited",
  "hope", "confused", "inspired", "calm", "motivated", "neutral",
];

export const CHARACTER_TYPES: CharacterType[] = [
  "girl", "boy", "baby", "teacher", "student", "doctor",
  "business", "elderly", "cartoon", "anime", "doll", "fantasy", "animal",
];

type Palette = { skin: string; hair: string; outfit: string; outfit2: string; accent: string; scale: number };

export const CHARACTER_PALETTES: Record<CharacterType, Palette & { label: string }> = {
  girl:     { label: "Girl",           skin: "#f4c79b", hair: "#4a2c1a", outfit: "#ec4899", outfit2: "#be185d", accent: "#fde047", scale: 1.0 },
  boy:      { label: "Boy",            skin: "#e8b98a", hair: "#241a12", outfit: "#2563eb", outfit2: "#1e40af", accent: "#22c55e", scale: 1.0 },
  baby:     { label: "Baby",           skin: "#ffd9bd", hair: "#c2874f", outfit: "#fbcfe8", outfit2: "#f9a8d4", accent: "#a5f3fc", scale: 0.72 },
  teacher:  { label: "Teacher",        skin: "#f1c3a0", hair: "#6b3a1f", outfit: "#1e40af", outfit2: "#1e3a8a", accent: "#fbbf24", scale: 1.03 },
  student:  { label: "Student",        skin: "#e7bd93", hair: "#1f2937", outfit: "#0ea5e9", outfit2: "#0369a1", accent: "#f97316", scale: 0.95 },
  doctor:   { label: "Doctor",         skin: "#f0c6a0", hair: "#2b2b2b", outfit: "#f8fafc", outfit2: "#cbd5e1", accent: "#ef4444", scale: 1.03 },
  business: { label: "Business",       skin: "#e3b48a", hair: "#151515", outfit: "#0f172a", outfit2: "#1e293b", accent: "#0ea5e9", scale: 1.04 },
  elderly:  { label: "Elderly",        skin: "#eec7ab", hair: "#d4d4d8", outfit: "#78716c", outfit2: "#57534e", accent: "#a3a3a3", scale: 0.97 },
  cartoon:  { label: "Cartoon",        skin: "#ffcf9e", hair: "#3a2a1f", outfit: "#22c55e", outfit2: "#15803d", accent: "#fde047", scale: 1.0 },
  anime:    { label: "Anime",          skin: "#fde6cf", hair: "#1e293b", outfit: "#3b82f6", outfit2: "#1d4ed8", accent: "#ef4444", scale: 1.0 },
  doll:     { label: "3D Doll",        skin: "#ffd8b8", hair: "#a855f7", outfit: "#ec4899", outfit2: "#db2777", accent: "#22d3ee", scale: 0.95 },
  fantasy:  { label: "Fantasy",        skin: "#dcd0ff", hair: "#7c3aed", outfit: "#4c1d95", outfit2: "#312e81", accent: "#facc15", scale: 1.05 },
  animal:   { label: "Animal",         skin: "#d9a066", hair: "#8b5e34", outfit: "#b45309", outfit2: "#92400e", accent: "#fcd34d", scale: 0.9 },
};

// ---------------------------------------------------------------- inference

const ACTION_HINTS: Array<[RegExp, ActorAction]> = [
  [/\brun(s|ning)?|sprint|rush/i, "running"],
  [/\bwalk(s|ing)?|stroll|stepping|journey/i, "walking"],
  [/\bsit(s|ting)?|seated|desk/i, "sitting"],
  [/\btalk(s|ing)?|speak|say|explain|present/i, "talking"],
  [/\blook(s|ing)? around|search|scan|explore/i, "looking-around"],
  [/\bsmil(e|es|ing)|grin/i, "smiling"],
  [/\bcry(ing)?|tears|weep|sob/i, "crying"],
  [/\blaugh(s|ing|ter)?/i, "laughing"],
  [/\bhug(s|ging)?|embrace/i, "hugging"],
  [/\bwav(e|es|ing)|greet|hello/i, "waving"],
  [/\bpoint(s|ing)?|indicat/i, "pointing"],
  [/\bread(s|ing)?|book|study/i, "reading"],
  [/\bwrit(e|es|ing)|note|journal/i, "writing"],
  [/\bsleep(s|ing)?|dream|rest|bed/i, "sleeping"],
  [/\bjump(s|ing)?|leap|hop/i, "jumping"],
  [/\bdanc(e|es|ing)|celebrat|party/i, "dancing"],
  [/\bswim(s|ming)?|dive|underwater/i, "swimming"],
  [/\bfly(ing)?|soar|float|hover/i, "flying"],
  [/\bfight(s|ing)?|battle|punch|struggle/i, "fighting"],
  [/\bwork(s|ing)?|type|laptop|comput|build/i, "working"],
  [/\bthink(s|ing)?|wonder|imagine|idea|reflect/i, "thinking"],
  [/\bdriv(e|es|ing)|car|road trip/i, "driving"],
];

export function inferAction(text: string, fallback: ActorAction = "talking"): ActorAction {
  for (const [re, a] of ACTION_HINTS) if (re.test(text)) return a;
  return fallback;
}

export function normalizeAction(raw?: string, context = ""): ActorAction {
  const v = (raw || "").toLowerCase().trim();
  const direct = ACTOR_ACTIONS.find((a) => v === a || v.includes(a.replace("-", " ")) || v.includes(a));
  if (direct) return direct;
  return inferAction(`${v} ${context}`);
}

export function normalizeEmotion(raw?: string): ActorEmotion {
  const v = (raw || "").toLowerCase();
  const direct = ACTOR_EMOTIONS.find((e) => v.includes(e));
  if (direct) return direct;
  if (/joy|glad|cheer/.test(v)) return "happy";
  if (/curious|puzzl/.test(v)) return "confused";
  if (/shock|scare|terror/.test(v)) return "fear";
  if (/determin|drive/.test(v)) return "motivated";
  if (/hopeful/.test(v)) return "hope";
  return "neutral";
}

export function inferCharacterType(desc: string, index = 0): CharacterType {
  const d = (desc || "").toLowerCase();
  if (/\b(dog|cat|bird|horse|lion|fox|animal|puppy|kitten|rabbit)\b/.test(d)) return "animal";
  if (/\bbab(y|ies)|infant|toddler\b/.test(d)) return "baby";
  if (/\bteacher|professor|mentor|coach\b/.test(d)) return "teacher";
  if (/\bstudent|pupil|learner|kid|child\b/.test(d)) return "student";
  if (/\bdoctor|nurse|surgeon|medic\b/.test(d)) return "doctor";
  if (/\bceo|manager|entrepreneur|business|founder|developer|engineer\b/.test(d)) return "business";
  if (/\bold|elder|grandma|grandpa|senior\b/.test(d)) return "elderly";
  if (/\bwizard|dragon|elf|hero|warrior|fantasy|robot|alien\b/.test(d)) return "fantasy";
  if (/\bwoman|girl|lady|she|her|female|mother|sister\b/.test(d)) return "girl";
  if (/\bman|boy|guy|he\b|his|male|father|brother/.test(d)) return "boy";
  const rotation: CharacterType[] = ["girl", "boy", "student", "business", "teacher", "cartoon", "anime"];
  return rotation[index % rotation.length];
}

export function inferEnvironment(location: string, narration = ""): EnvironmentKind {
  const d = `${location} ${narration}`.toLowerCase();
  if (/river|stream|lake|creek|waterfall/.test(d)) return "river";
  if (/forest|jungle|woods|tree|park/.test(d)) return "forest";
  if (/ocean|sea|beach|shore|coast|wave/.test(d)) return "ocean";
  if (/city|street|urban|downtown|traffic|skyline/.test(d)) return "city";
  if (/mountain|hill|cliff|valley|peak/.test(d)) return "mountain";
  if (/desert|dune|sand/.test(d)) return "desert";
  if (/space|galaxy|stars|cosmos|planet|orbit/.test(d)) return "space";
  if (/office|boardroom|meeting|workspace/.test(d)) return "office";
  if (/class|school|lecture|university/.test(d)) return "classroom";
  if (/room|home|house|kitchen|indoor|studio|cafe/.test(d)) return "indoor";
  if (/field|meadow|farm|grass|garden/.test(d)) return "field";
  return "abstract";
}

export function inferTimeOfDay(text: string): TimeOfDay {
  const d = (text || "").toLowerCase();
  if (/dawn|sunrise|early morning/.test(d)) return "dawn";
  if (/sunset|dusk|golden hour|evening/.test(d)) return "sunset";
  if (/night|midnight|dark|moon|stars/.test(d)) return "night";
  if (/day|noon|afternoon|morning|sunny/.test(d)) return "day";
  return "unknown";
}

export function inferWeather(text: string): WeatherKind {
  const d = (text || "").toLowerCase();
  if (/rain|drizzle|shower|monsoon/.test(d)) return "rain";
  if (/snow|blizzard|frost|winter/.test(d)) return "snow";
  if (/fog|mist|haze/.test(d)) return "fog";
  if (/storm|thunder|lightning/.test(d)) return "storm";
  if (/wind|breeze|gust/.test(d)) return "wind";
  if (/clear|sunny|bright/.test(d)) return "clear";
  return "unknown";
}

const CAMERA_BY_ACTION: Partial<Record<ActorAction, string>> = {
  running: "tracking", walking: "pan-right", flying: "drone", swimming: "tracking",
  thinking: "close-up", crying: "close-up", talking: "close-up", writing: "close-up",
  reading: "close-up", dancing: "orbit", fighting: "zoom-in", jumping: "zoom-out",
  driving: "tracking", sleeping: "zoom-in", working: "orbit", hugging: "zoom-in",
  waving: "close-up", pointing: "zoom-in", "looking-around": "pan-left",
  sitting: "static", standing: "wide-shot", smiling: "close-up", laughing: "close-up",
};

export function cameraForAction(action: ActorAction, fallback = "zoom-in") {
  return CAMERA_BY_ACTION[action] || fallback;
}

export function musicForMood(emotion: ActorEmotion, style: string): string {
  const map: Record<ActorEmotion, string> = {
    happy: "Upbeat acoustic pop, 110 BPM",
    sad: "Slow solo piano, 68 BPM",
    angry: "Driving percussion & distorted bass, 128 BPM",
    fear: "Low drones with tense strings, 80 BPM",
    excited: "Energetic electronic pop, 124 BPM",
    hope: "Warm strings with soft piano build, 90 BPM",
    confused: "Sparse plucked textures, 84 BPM",
    inspired: "Cinematic orchestral swell, 96 BPM",
    calm: "Ambient pads with light guitar, 72 BPM",
    motivated: "Epic hybrid trailer drums, 118 BPM",
    neutral: "Neutral lo-fi underscore, 88 BPM",
  };
  return `${map[emotion]} — ${style} mix`;
}

// ---------------------------------------------------------------- drawing

function rgba(hex: string, a: number) {
  const h = hex.replace("#", "");
  return `rgba(${parseInt(h.slice(0, 2), 16)},${parseInt(h.slice(2, 4), 16)},${parseInt(h.slice(4, 6), 16)},${a})`;
}

/** Animated environment layer drawn behind the actors. */
export function drawEnvironment(
  ctx: CanvasRenderingContext2D,
  w: number, h: number, t: number,
  env: EnvironmentKind, time: TimeOfDay, weather: WeatherKind, accent: string,
) {
  ctx.save();

  // Time-of-day wash
  const washes: Record<TimeOfDay, [string, number]> = {
    dawn: ["#ff9e7d", 0.16], day: ["#9fd8ff", 0.1],
    sunset: ["#ff7b39", 0.2], night: ["#0b1030", 0.32], unknown: [accent, 0.06],
  };
  const [wc, wa] = washes[time];
  ctx.fillStyle = rgba(wc, wa);
  ctx.fillRect(0, 0, w, h);

  const horizon = h * 0.68;

  if (env === "river" || env === "ocean") {
    const deep = env === "ocean" ? "#0b3b63" : "#1d4e5f";
    const g = ctx.createLinearGradient(0, horizon, 0, h);
    g.addColorStop(0, rgba(deep, 0.85));
    g.addColorStop(1, rgba(deep, 0.55));
    ctx.fillStyle = g; ctx.fillRect(0, horizon, w, h - horizon);
    for (let i = 0; i < 26; i++) {
      const y = horizon + ((i / 26) ** 1.5) * (h - horizon);
      const amp = 6 + i * 1.2;
      const speed = env === "ocean" ? 1.6 : 1.0;
      ctx.strokeStyle = rgba("#ffffff", 0.05 + (i % 3) * 0.035);
      ctx.lineWidth = 1 + i * 0.06;
      ctx.beginPath();
      for (let x = 0; x <= w; x += 12) {
        const yy = y + Math.sin((x / 90) + t * speed + i * 0.6) * (amp * 0.18);
        x === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy);
      }
      ctx.stroke();
    }
    if (env === "ocean") {
      for (let i = 0; i < 40; i++) {
        const x = (i * 137.5 + t * 30) % w;
        const y = horizon + ((i * 53) % (h - horizon));
        ctx.fillStyle = rgba("#ffffff", 0.14);
        ctx.beginPath(); ctx.arc(x, y, 1.5 + (i % 3), 0, Math.PI * 2); ctx.fill();
      }
    }
  } else if (env === "forest" || env === "field") {
    ctx.fillStyle = rgba(env === "forest" ? "#0f2e1c" : "#1d3d16", 0.75);
    ctx.fillRect(0, horizon, w, h - horizon);
    const trees = env === "forest" ? 9 : 3;
    for (let i = 0; i < trees; i++) {
      const x = (w / (trees + 1)) * (i + 1) + Math.sin(t * 0.7 + i) * 6;
      const th = h * (0.28 + ((i * 37) % 10) / 60);
      ctx.fillStyle = rgba("#2b1b12", 0.85);
      ctx.fillRect(x - w * 0.008, horizon - th * 0.45, w * 0.016, th * 0.5);
      ctx.fillStyle = rgba("#1f5130", 0.9);
      ctx.beginPath();
      ctx.ellipse(x + Math.sin(t * 0.9 + i) * 5, horizon - th * 0.55, w * 0.05, th * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // falling leaves
    for (let i = 0; i < 22; i++) {
      const seed = i * 9.7;
      const x = (Math.sin(seed) * 0.5 + 0.5) * w + Math.sin(t * 0.8 + seed) * 40;
      const y = ((t * 40 + seed * 60) % (h + 60)) - 30;
      ctx.fillStyle = rgba(i % 2 ? "#c2833a" : "#7fae4a", 0.6);
      ctx.save(); ctx.translate(x, y); ctx.rotate(t + seed);
      ctx.beginPath(); ctx.ellipse(0, 0, 5, 2.4, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
    // birds
    for (let i = 0; i < 4; i++) {
      const bx = ((t * (40 + i * 12) + i * 300) % (w + 120)) - 60;
      const by = h * (0.16 + i * 0.05) + Math.sin(t * 2 + i) * 8;
      const flap = Math.sin(t * 8 + i) * 5;
      ctx.strokeStyle = rgba("#111827", 0.55); ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(bx - 9, by); ctx.quadraticCurveTo(bx, by - flap, bx + 9, by);
      ctx.stroke();
    }
  } else if (env === "city") {
    const rows = 3;
    for (let r = rows; r >= 1; r--) {
      const base = horizon + r * 6;
      const alpha = 0.35 + (rows - r) * 0.2;
      ctx.fillStyle = rgba("#111827", alpha);
      let x = -((t * (4 + r * 3)) % 120);
      let i = 0;
      while (x < w) {
        const bw = 40 + ((i * 47 + r * 13) % 60);
        const bh = h * (0.12 + ((i * 29 + r * 7) % 22) / 100) * (1 + (rows - r) * 0.25);
        ctx.fillRect(x, base - bh, bw, bh);
        // lit windows
        for (let wy = base - bh + 8; wy < base - 8; wy += 14) {
          for (let wx = x + 6; wx < x + bw - 6; wx += 12) {
            const on = ((wx * 7 + wy * 13 + Math.floor(t * 1.5)) % 11) < 4;
            ctx.fillStyle = rgba(on ? "#fde68a" : "#0b1220", on ? 0.75 : 0.5);
            ctx.fillRect(wx, wy, 5, 7);
          }
        }
        ctx.fillStyle = rgba("#111827", alpha);
        x += bw + 10; i++;
      }
    }
    // road + car lights
    ctx.fillStyle = rgba("#0a0a0f", 0.9);
    ctx.fillRect(0, h * 0.86, w, h * 0.14);
    for (let i = 0; i < 8; i++) {
      const dir = i % 2 === 0 ? 1 : -1;
      const speed = 120 + i * 30;
      const x = dir > 0 ? (t * speed + i * 200) % (w + 200) - 100 : w - ((t * speed + i * 170) % (w + 200) - 100);
      const y = h * (0.885 + (i % 3) * 0.03);
      ctx.fillStyle = rgba(dir > 0 ? "#fde68a" : "#ef4444", 0.85);
      ctx.beginPath(); ctx.ellipse(x, y, 16, 3.2, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else if (env === "mountain" || env === "desert") {
    const c = env === "mountain" ? "#3b4a63" : "#c08a4a";
    for (let layer = 2; layer >= 0; layer--) {
      ctx.fillStyle = rgba(c, 0.3 + layer * 0.2);
      ctx.beginPath();
      ctx.moveTo(0, h);
      const peaks = 4 + layer;
      for (let i = 0; i <= peaks; i++) {
        const x = (w / peaks) * i;
        const y = horizon - (h * 0.1 + Math.sin(i * 1.7 + layer) * h * 0.08) + layer * h * 0.06;
        ctx.lineTo(x, env === "desert" ? y + h * 0.06 : y);
      }
      ctx.lineTo(w, h); ctx.closePath(); ctx.fill();
    }
  } else if (env === "space") {
    for (let i = 0; i < 120; i++) {
      const seed = i * 12.9898;
      const x = (Math.sin(seed) * 0.5 + 0.5) * w;
      const y = (Math.cos(seed * 1.7) * 0.5 + 0.5) * h;
      const tw = 0.35 + 0.45 * (Math.sin(t * 2 + i) * 0.5 + 0.5);
      ctx.fillStyle = rgba("#ffffff", tw * 0.8);
      ctx.beginPath(); ctx.arc(x, y, 1 + (i % 3) * 0.4, 0, Math.PI * 2); ctx.fill();
    }
    const nb = ctx.createRadialGradient(w * 0.7, h * 0.3, 0, w * 0.7, h * 0.3, Math.min(w, h) * 0.5);
    nb.addColorStop(0, rgba(accent, 0.22)); nb.addColorStop(1, rgba(accent, 0));
    ctx.fillStyle = nb; ctx.fillRect(0, 0, w, h);
  } else if (env === "indoor" || env === "office" || env === "classroom") {
    ctx.fillStyle = rgba("#1b1b23", 0.55); ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = rgba("#2a2a35", 0.85); ctx.fillRect(0, horizon, w, h - horizon);
    // window with drifting light
    const wx = w * 0.12, wy = h * 0.18, ww = w * 0.22, wh = h * 0.3;
    ctx.fillStyle = rgba("#9ad0ff", 0.25 + Math.sin(t * 0.6) * 0.05);
    ctx.fillRect(wx, wy, ww, wh);
    ctx.strokeStyle = rgba("#0b0b12", 0.8); ctx.lineWidth = 4;
    ctx.strokeRect(wx, wy, ww, wh);
    ctx.beginPath(); ctx.moveTo(wx + ww / 2, wy); ctx.lineTo(wx + ww / 2, wy + wh);
    ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();
    if (env === "office" || env === "classroom") {
      ctx.fillStyle = rgba(env === "office" ? "#334155" : "#14532d", 0.9);
      ctx.fillRect(w * 0.55, h * 0.22, w * 0.33, h * 0.24);
    }
  }

  // Weather overlay
  if (weather === "rain" || weather === "storm") {
    ctx.strokeStyle = rgba("#cfe8ff", 0.35); ctx.lineWidth = 1.4;
    for (let i = 0; i < 160; i++) {
      const seed = i * 7.13;
      const x = ((Math.sin(seed) * 0.5 + 0.5) * w + t * 60) % w;
      const y = ((t * 900 + seed * 130) % (h + 60)) - 30;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 5, y + 18); ctx.stroke();
    }
    ctx.fillStyle = rgba("#ffffff", 0.06);
    ctx.fillRect(0, h * 0.9, w, h * 0.1); // wet surface sheen
    if (weather === "storm" && Math.sin(t * 1.3) > 0.985) {
      ctx.fillStyle = rgba("#ffffff", 0.35); ctx.fillRect(0, 0, w, h);
    }
  } else if (weather === "snow") {
    for (let i = 0; i < 120; i++) {
      const seed = i * 5.31;
      const x = (Math.sin(seed) * 0.5 + 0.5) * w + Math.sin(t * 0.8 + seed) * 26;
      const y = ((t * 70 + seed * 90) % (h + 40)) - 20;
      ctx.fillStyle = rgba("#ffffff", 0.6);
      ctx.beginPath(); ctx.arc(x, y, 1.5 + (i % 3) * 0.9, 0, Math.PI * 2); ctx.fill();
    }
  } else if (weather === "fog") {
    for (let i = 0; i < 4; i++) {
      const y = h * (0.5 + i * 0.12);
      const g = ctx.createLinearGradient(0, y - 60, 0, y + 60);
      g.addColorStop(0, rgba("#ffffff", 0)); g.addColorStop(0.5, rgba("#ffffff", 0.1)); g.addColorStop(1, rgba("#ffffff", 0));
      ctx.fillStyle = g;
      ctx.fillRect(Math.sin(t * 0.3 + i) * 40 - 40, y - 60, w + 80, 120);
    }
  } else if (weather === "wind") {
    ctx.strokeStyle = rgba("#ffffff", 0.12); ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
      const y = (i / 12) * h + Math.sin(t + i) * 8;
      const x = ((t * 260 + i * 180) % (w + 260)) - 130;
      ctx.beginPath();
      ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 60, y - 10, x + 130, y);
      ctx.stroke();
    }
  }

  ctx.restore();
}

// ------------------------------------------------------------------ actor

type PoseState = {
  bodyY: number; bodyX: number; lean: number; bob: number; crouch: number;
  armL: number; armR: number; legL: number; legR: number;
  headTilt: number; scale: number;
};

function pose(action: ActorAction, t: number, seed: number): PoseState {
  const s = (m: number, o = 0) => Math.sin(t * m + seed + o);
  const base: PoseState = {
    bodyY: 0, bodyX: 0, lean: 0, bob: s(1.4) * 0.012, crouch: 0,
    armL: 0.15, armR: -0.15, legL: 0, legR: 0, headTilt: s(0.8) * 0.03, scale: 1,
  };
  switch (action) {
    case "walking":
      return { ...base, bodyX: s(0.6) * 0.06, bob: Math.abs(s(4)) * 0.03,
        armL: s(4) * 0.5, armR: -s(4) * 0.5, legL: s(4) * 0.5, legR: -s(4) * 0.5, lean: 0.03 };
    case "running":
      return { ...base, bodyX: s(0.9) * 0.1, bob: Math.abs(s(7)) * 0.05,
        armL: s(7) * 0.9, armR: -s(7) * 0.9, legL: s(7) * 0.9, legR: -s(7) * 0.9, lean: 0.16 };
    case "sitting":
      return { ...base, crouch: 0.32, legL: 1.25, legR: 1.25, armL: 0.4, armR: -0.4, bob: s(1.1) * 0.006 };
    case "standing":
      return { ...base, bob: s(0.9) * 0.008 };
    case "talking":
      return { ...base, armL: 0.25 + s(3) * 0.25, armR: -0.25 - s(3.2) * 0.25, headTilt: s(1.6) * 0.06 };
    case "looking-around":
      return { ...base, headTilt: s(1.1) * 0.28, armL: 0.2, armR: -0.2 };
    case "smiling":
      return { ...base, headTilt: s(0.7) * 0.05 };
    case "crying":
      return { ...base, crouch: 0.08, lean: 0.06, armL: 1.05, armR: -1.05, headTilt: 0.12 + s(2) * 0.03 };
    case "laughing":
      return { ...base, lean: -0.14 + s(6) * 0.04, armL: 0.6, armR: -0.6, bob: Math.abs(s(6)) * 0.02 };
    case "hugging":
      return { ...base, armL: 1.25, armR: -1.25, lean: 0.05, bob: s(1.2) * 0.01 };
    case "waving":
      return { ...base, armR: -1.9 + s(7) * 0.4, armL: 0.2, headTilt: s(1.5) * 0.05 };
    case "pointing":
      return { ...base, armR: -1.35, armL: 0.15, lean: 0.05 };
    case "reading":
      return { ...base, crouch: 0.05, armL: 0.85, armR: -0.85, headTilt: 0.16 };
    case "writing":
      return { ...base, crouch: 0.18, armR: -0.95 + s(5) * 0.12, armL: 0.7, headTilt: 0.2 };
    case "sleeping":
      return { ...base, crouch: 0.5, headTilt: 0.4, armL: 0.7, armR: -0.7, bob: s(0.7) * 0.02, scale: 0.96 };
    case "jumping":
      return { ...base, bodyY: -Math.abs(s(3)) * 0.22, armL: -1.6, armR: 1.6, legL: -0.5, legR: 0.5 };
    case "dancing":
      return { ...base, bodyX: s(3) * 0.07, lean: s(3) * 0.14, armL: -1.2 + s(6) * 0.6, armR: 1.2 - s(6.4) * 0.6,
        legL: s(6) * 0.5, legR: -s(6) * 0.5, bob: Math.abs(s(6)) * 0.03 };
    case "swimming":
      return { ...base, lean: 1.3, bodyY: 0.05 + s(2) * 0.02, armL: s(5) * 1.4, armR: -s(5, Math.PI) * 1.4,
        legL: s(5) * 0.3, legR: -s(5) * 0.3 };
    case "flying":
      return { ...base, lean: 0.5, bodyY: -0.12 + s(1.6) * 0.05, armL: -1.5, armR: 1.5, legL: -0.2, legR: 0.2 };
    case "fighting":
      return { ...base, lean: 0.12, armL: 0.9, armR: -1.6 + Math.abs(s(6)) * 1.2,
        legL: 0.35, legR: -0.35, bodyX: s(6) * 0.03 };
    case "working":
      return { ...base, crouch: 0.22, armL: 0.9 + s(8) * 0.05, armR: -0.9 - s(8.5) * 0.05, headTilt: 0.18 };
    case "thinking":
      return { ...base, armR: -1.5, armL: 0.55, headTilt: 0.22 + s(0.8) * 0.04 };
    case "driving":
      return { ...base, crouch: 0.28, armL: 1.0, armR: -1.0, bob: s(9) * 0.008 };
    default:
      return base;
  }
}

type FaceState = { brow: number; mouthCurve: number; eyeOpen: number; blush: number; tear: boolean; sweat: boolean };

function face(emotion: ActorEmotion): FaceState {
  switch (emotion) {
    case "happy":     return { brow: -0.15, mouthCurve: 1, eyeOpen: 0.95, blush: 0.4, tear: false, sweat: false };
    case "sad":       return { brow: 0.5, mouthCurve: -1, eyeOpen: 0.7, blush: 0.1, tear: true, sweat: false };
    case "angry":     return { brow: -0.7, mouthCurve: -0.7, eyeOpen: 1.05, blush: 0.35, tear: false, sweat: false };
    case "fear":      return { brow: 0.7, mouthCurve: -0.5, eyeOpen: 1.3, blush: 0, tear: false, sweat: true };
    case "excited":   return { brow: -0.3, mouthCurve: 1.2, eyeOpen: 1.2, blush: 0.5, tear: false, sweat: false };
    case "hope":      return { brow: 0.15, mouthCurve: 0.6, eyeOpen: 1.05, blush: 0.25, tear: false, sweat: false };
    case "confused":  return { brow: 0.35, mouthCurve: -0.15, eyeOpen: 0.95, blush: 0.15, tear: false, sweat: true };
    case "inspired":  return { brow: -0.1, mouthCurve: 0.8, eyeOpen: 1.15, blush: 0.3, tear: false, sweat: false };
    case "calm":      return { brow: 0.05, mouthCurve: 0.35, eyeOpen: 0.85, blush: 0.2, tear: false, sweat: false };
    case "motivated": return { brow: -0.45, mouthCurve: 0.5, eyeOpen: 1.1, blush: 0.25, tear: false, sweat: false };
    default:          return { brow: 0, mouthCurve: 0.2, eyeOpen: 1, blush: 0.2, tear: false, sweat: false };
  }
}

export type ActorOptions = {
  type: CharacterType;
  action: ActorAction;
  emotion: ActorEmotion;
  cx: number; cy: number; size: number;
  mouthOpen: number;
  t: number;
  seed?: number;
  facing?: 1 | -1;
};

/** Draw a fully-articulated acting character with facial animation and lip-sync. */
export function drawActor(ctx: CanvasRenderingContext2D, o: ActorOptions) {
  const pal = CHARACTER_PALETTES[o.type] ?? CHARACTER_PALETTES.girl;
  const seed = o.seed ?? 0;
  const p = pose(o.action, o.t, seed);
  const f = face(o.emotion);
  const S = o.size * pal.scale * p.scale;
  const facing = o.facing ?? 1;

  ctx.save();
  ctx.translate(o.cx + p.bodyX * S * 3, o.cy + (p.bodyY + p.bob + p.crouch * 0.35) * S * 2);
  ctx.scale(facing, 1);
  ctx.rotate(p.lean * 0.35);

  // ground shadow
  ctx.fillStyle = rgba("#000000", 0.22);
  ctx.beginPath();
  ctx.ellipse(0, S * 1.55, S * 0.55, S * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  const limb = (x: number, y: number, len: number, angle: number, wdt: number, color: string) => {
    ctx.save();
    ctx.translate(x, y); ctx.rotate(angle);
    ctx.strokeStyle = color; ctx.lineWidth = wdt; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, len); ctx.stroke();
    ctx.restore();
    return { x: x + Math.sin(angle) * -len, y: y + Math.cos(angle) * len };
  };

  // legs
  const hipY = S * 0.95 - p.crouch * S * 0.5;
  const legLen = S * (0.6 - p.crouch * 0.25);
  limb(-S * 0.16, hipY, legLen, p.legL * 0.5, S * 0.14, pal.outfit2);
  limb(S * 0.16, hipY, legLen, p.legR * 0.5, S * 0.14, pal.outfit2);

  // torso
  ctx.fillStyle = pal.outfit;
  ctx.beginPath();
  ctx.moveTo(-S * 0.34, hipY);
  ctx.lineTo(-S * 0.28, S * 0.18);
  ctx.quadraticCurveTo(0, S * 0.06, S * 0.28, S * 0.18);
  ctx.lineTo(S * 0.34, hipY);
  ctx.quadraticCurveTo(0, hipY + S * 0.08, -S * 0.34, hipY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = rgba(pal.accent, 0.9);
  ctx.beginPath();
  ctx.moveTo(-S * 0.1, S * 0.2); ctx.lineTo(0, S * 0.46); ctx.lineTo(S * 0.1, S * 0.2);
  ctx.closePath(); ctx.fill();

  // arms + hands
  const shoulderY = S * 0.26;
  const armLen = S * 0.55;
  const hl = limb(-S * 0.3, shoulderY, armLen, p.armL, S * 0.11, pal.outfit);
  const hr = limb(S * 0.3, shoulderY, armLen, p.armR, S * 0.11, pal.outfit);
  ctx.fillStyle = pal.skin;
  for (const hnd of [hl, hr]) { ctx.beginPath(); ctx.arc(hnd.x, hnd.y, S * 0.08, 0, Math.PI * 2); ctx.fill(); }

  // props by action
  if (o.action === "reading") {
    ctx.fillStyle = "#f8fafc"; ctx.save(); ctx.translate(0, S * 0.55); ctx.rotate(-0.15);
    ctx.fillRect(-S * 0.3, -S * 0.16, S * 0.6, S * 0.32);
    ctx.strokeStyle = "#94a3b8"; ctx.lineWidth = S * 0.02;
    ctx.beginPath(); ctx.moveTo(0, -S * 0.16); ctx.lineTo(0, S * 0.16); ctx.stroke(); ctx.restore();
  } else if (o.action === "working") {
    ctx.fillStyle = "#0f172a"; ctx.fillRect(-S * 0.35, S * 0.6, S * 0.7, S * 0.06);
    ctx.fillStyle = "#1e293b"; ctx.save(); ctx.translate(0, S * 0.6); ctx.rotate(-0.35);
    ctx.fillRect(-S * 0.3, -S * 0.36, S * 0.6, S * 0.36);
    ctx.fillStyle = rgba(pal.accent, 0.6); ctx.fillRect(-S * 0.27, -S * 0.33, S * 0.54, S * 0.3); ctx.restore();
  } else if (o.action === "writing") {
    ctx.strokeStyle = "#fbbf24"; ctx.lineWidth = S * 0.05; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(hr.x, hr.y); ctx.lineTo(hr.x + S * 0.16, hr.y + S * 0.16); ctx.stroke();
  } else if (o.action === "driving") {
    ctx.strokeStyle = "#111827"; ctx.lineWidth = S * 0.06;
    ctx.beginPath(); ctx.arc(0, S * 0.6, S * 0.3, 0, Math.PI * 2); ctx.stroke();
  } else if (o.action === "thinking") {
    for (let i = 0; i < 3; i++) {
      const r = S * (0.05 + i * 0.03);
      const yy = -S * (0.95 + i * 0.22) - Math.sin(o.t * 1.6 + i) * S * 0.03;
      ctx.fillStyle = rgba("#ffffff", 0.5 - i * 0.1);
      ctx.beginPath(); ctx.arc(S * (0.45 + i * 0.1), yy, r, 0, Math.PI * 2); ctx.fill();
    }
  }

  // head
  const headY = -S * 0.3;
  ctx.save();
  ctx.translate(0, headY);
  ctx.rotate(p.headTilt);

  ctx.fillStyle = pal.skin;
  ctx.beginPath();
  ctx.ellipse(0, 0, S * 0.33, S * 0.38, 0, 0, Math.PI * 2);
  ctx.fill();

  if (o.type === "animal") {
    ctx.fillStyle = pal.hair;
    ctx.beginPath();
    ctx.moveTo(-S * 0.3, -S * 0.24); ctx.lineTo(-S * 0.14, -S * 0.5); ctx.lineTo(-S * 0.04, -S * 0.24);
    ctx.moveTo(S * 0.3, -S * 0.24); ctx.lineTo(S * 0.14, -S * 0.5); ctx.lineTo(S * 0.04, -S * 0.24);
    ctx.fill();
  } else {
    ctx.fillStyle = pal.hair;
    ctx.beginPath();
    ctx.ellipse(0, -S * 0.19, S * 0.36, S * 0.26, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    if (o.type === "girl" || o.type === "anime" || o.type === "doll" || o.type === "influencer" as CharacterType) {
      ctx.beginPath();
      ctx.ellipse(-S * 0.32, 0, S * 0.09, S * 0.3, 0, 0, Math.PI * 2);
      ctx.ellipse(S * 0.32, 0, S * 0.09, S * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    if (o.type === "doctor") {
      ctx.fillStyle = "#f8fafc";
      ctx.fillRect(-S * 0.3, -S * 0.42, S * 0.6, S * 0.12);
    }
    if (o.type === "fantasy") {
      ctx.fillStyle = pal.accent;
      ctx.beginPath(); ctx.moveTo(0, -S * 0.72); ctx.lineTo(-S * 0.12, -S * 0.4); ctx.lineTo(S * 0.12, -S * 0.4);
      ctx.closePath(); ctx.fill();
    }
    if (o.type === "elderly") {
      ctx.strokeStyle = rgba("#8b6f5a", 0.5); ctx.lineWidth = S * 0.012;
      ctx.beginPath(); ctx.moveTo(-S * 0.2, S * 0.1); ctx.lineTo(-S * 0.1, S * 0.11);
      ctx.moveTo(S * 0.1, S * 0.11); ctx.lineTo(S * 0.2, S * 0.1); ctx.stroke();
    }
  }

  // eyes (blink + emotion)
  const blink = (Math.sin(o.t * 1.7 + seed) > 0.965 || o.action === "sleeping") ? 0.08 : 1;
  const eyeH = S * 0.085 * f.eyeOpen * blink;
  const eyeY = -S * 0.02;
  const bigEyes = o.type === "anime" || o.type === "doll" || o.type === "baby" || o.type === "cartoon";
  const eyeW = S * (bigEyes ? 0.095 : 0.07);
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(-S * 0.13, eyeY, eyeW, eyeH * (bigEyes ? 1.35 : 1), 0, 0, Math.PI * 2);
  ctx.ellipse(S * 0.13, eyeY, eyeW, eyeH * (bigEyes ? 1.35 : 1), 0, 0, Math.PI * 2);
  ctx.fill();
  const gaze = o.action === "looking-around" ? Math.sin(o.t * 1.1 + seed) * S * 0.03 : 0;
  ctx.fillStyle = "#161616";
  ctx.beginPath();
  ctx.ellipse(-S * 0.13 + gaze, eyeY, S * 0.033, eyeH * 0.75, 0, 0, Math.PI * 2);
  ctx.ellipse(S * 0.13 + gaze, eyeY, S * 0.033, eyeH * 0.75, 0, 0, Math.PI * 2);
  ctx.fill();

  // brows
  ctx.strokeStyle = pal.hair; ctx.lineWidth = S * 0.026; ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-S * 0.21, -S * 0.13 + f.brow * S * 0.05);
  ctx.lineTo(-S * 0.06, -S * 0.15 - f.brow * S * 0.05);
  ctx.moveTo(S * 0.06, -S * 0.15 - f.brow * S * 0.05);
  ctx.lineTo(S * 0.21, -S * 0.13 + f.brow * S * 0.05);
  ctx.stroke();

  // blush
  if (f.blush > 0) {
    ctx.fillStyle = rgba("#ff7a90", 0.3 * f.blush + 0.08);
    ctx.beginPath();
    ctx.ellipse(-S * 0.21, S * 0.08, S * 0.06, S * 0.035, 0, 0, Math.PI * 2);
    ctx.ellipse(S * 0.21, S * 0.08, S * 0.06, S * 0.035, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // mouth: lip-sync amplitude + emotional curve
  const openAmt = o.action === "sleeping" ? 0.12 + Math.sin(o.t * 1.2) * 0.05 : o.mouthOpen;
  const mw = S * (o.action === "laughing" ? 0.19 : 0.15);
  const mh = Math.max(S * 0.012, openAmt * S * 0.11 + (o.action === "laughing" ? S * 0.05 : 0));
  ctx.fillStyle = "#3a1a1a";
  ctx.beginPath();
  ctx.ellipse(0, S * 0.16, mw, mh, 0, 0, Math.PI * 2);
  ctx.fill();
  if (openAmt < 0.18) {
    ctx.strokeStyle = "#3a1a1a"; ctx.lineWidth = S * 0.022;
    ctx.beginPath();
    ctx.moveTo(-mw, S * 0.16);
    ctx.quadraticCurveTo(0, S * 0.16 + f.mouthCurve * S * 0.07, mw, S * 0.16);
    ctx.stroke();
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-mw * 0.7, S * 0.16 - mh * 0.5, mw * 1.4, mh * 0.3);
  }

  // tears / sweat
  if (f.tear || o.action === "crying") {
    const drop = ((o.t * 0.9 + seed) % 1);
    ctx.fillStyle = rgba("#7dd3fc", 0.85);
    for (const sx of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(sx * S * 0.15, S * 0.02 + drop * S * 0.3, S * 0.022, S * 0.035, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (f.sweat) {
    ctx.fillStyle = rgba("#bae6fd", 0.8);
    ctx.beginPath();
    ctx.ellipse(S * 0.26, -S * 0.16 + Math.sin(o.t * 2 + seed) * S * 0.02, S * 0.024, S * 0.036, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore(); // head
  ctx.restore(); // body

  // action motion cues (drawn unflipped)
  if (o.action === "running" || o.action === "walking") {
    ctx.strokeStyle = rgba("#ffffff", 0.18); ctx.lineWidth = o.size * 0.02;
    for (let i = 0; i < 3; i++) {
      const off = (o.t * 3 + i) % 1;
      const x = o.cx - facing * o.size * (0.7 + off * 0.6);
      ctx.beginPath();
      ctx.moveTo(x, o.cy + o.size * (0.2 + i * 0.25));
      ctx.lineTo(x - facing * o.size * 0.28, o.cy + o.size * (0.2 + i * 0.25));
      ctx.stroke();
    }
  }
  if (o.action === "swimming") {
    ctx.strokeStyle = rgba("#bae6fd", 0.4); ctx.lineWidth = o.size * 0.02;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const yy = o.cy + o.size * (0.9 + i * 0.12);
      for (let x = o.cx - o.size; x <= o.cx + o.size; x += 10) {
        const y2 = yy + Math.sin((x / 30) + o.t * 4 + i) * o.size * 0.03;
        x === o.cx - o.size ? ctx.moveTo(x, y2) : ctx.lineTo(x, y2);
      }
      ctx.stroke();
    }
  }
  if (o.action === "fighting") {
    const punch = Math.abs(Math.sin(o.t * 6));
    if (punch > 0.85) {
      ctx.strokeStyle = rgba("#fbbf24", 0.7); ctx.lineWidth = o.size * 0.03;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        const r1 = o.size * 0.28, r2 = o.size * 0.42;
        ctx.beginPath();
        ctx.moveTo(o.cx + facing * o.size * 0.55 + Math.cos(a) * r1, o.cy + Math.sin(a) * r1);
        ctx.lineTo(o.cx + facing * o.size * 0.55 + Math.cos(a) * r2, o.cy + Math.sin(a) * r2);
        ctx.stroke();
      }
    }
  }
  if (o.action === "flying") {
    ctx.fillStyle = rgba("#ffffff", 0.12);
    ctx.beginPath();
    ctx.ellipse(o.cx - facing * o.size * 0.9, o.cy + o.size * 0.2, o.size * 0.6, o.size * 0.08, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Lay out 1-3 actors across the frame for the scene's cast. */
export function actorLayout(count: number, w: number, h: number, size: number) {
  const n = Math.max(1, Math.min(3, count));
  const spots: Array<{ x: number; y: number; size: number; facing: 1 | -1 }> = [];
  if (n === 1) spots.push({ x: w * 0.5, y: h * 0.52, size, facing: 1 });
  if (n === 2) {
    spots.push({ x: w * 0.34, y: h * 0.54, size: size * 0.95, facing: 1 });
    spots.push({ x: w * 0.68, y: h * 0.52, size, facing: -1 });
  }
  if (n === 3) {
    spots.push({ x: w * 0.24, y: h * 0.56, size: size * 0.85, facing: 1 });
    spots.push({ x: w * 0.5, y: h * 0.52, size, facing: 1 });
    spots.push({ x: w * 0.77, y: h * 0.56, size: size * 0.85, facing: -1 });
  }
  return spots;
}
