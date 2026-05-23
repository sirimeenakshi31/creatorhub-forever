// Central registry of every tool. All routes link from here.
export type ToolKind = "text" | "image" | "audio-tts" | "audio-stt" | "video" | "face-swap" | "bg-remove" | "editor" | "resource" | "palette" | "fonts";
export type ToolCategory = "Content" | "Video" | "Audio" | "Image" | "Resources";

export interface Tool {
  slug: string;
  name: string;
  description: string;
  category: ToolCategory;
  kind: ToolKind;
  icon: string; // lucide name
  trending?: boolean;
  // text/image tool config
  system?: string;
  placeholder?: string;
  imagePromptPrefix?: string;
  aspect?: "1:1" | "9:16" | "16:9" | "4:5" | "2:3";
  // structured JSON output schema for text tools
  json?: boolean;
}

const txt = (cfg: Omit<Tool, "kind">): Tool => ({ kind: "text", ...cfg });
const img = (cfg: Omit<Tool, "kind">): Tool => ({ kind: "image", ...cfg });

export const TOOLS: Tool[] = [
  // ─── Content ──────────────────────────────────────────────
  txt({ slug: "script-generator", name: "AI Script Generator", description: "Generate scroll-stopping scripts for any platform.", category: "Content", icon: "FileText", trending: true,
    system: "You are an elite short-form video scriptwriter. Generate a 30–60 second script with a hook, body, and CTA. Use line breaks. No preamble.",
    placeholder: "Topic, niche, or angle (e.g. 'morning routine for solopreneurs')" }),
  txt({ slug: "caption-generator", name: "Caption Generator", description: "Captions that convert — hook first.", category: "Content", icon: "MessageSquare", trending: true,
    system: "You write punchy Instagram captions. Start with a strong hook, keep it under 150 words, add 1 CTA, no hashtags.",
    placeholder: "Describe your post (e.g. 'photo of my new home office setup')" }),
  txt({ slug: "hook-generator", name: "Hook Generator", description: "10 killer hooks for any video.", category: "Content", icon: "Zap", trending: true,
    system: "Generate 10 scroll-stopping video hooks, numbered 1–10, each under 12 words. No preamble.",
    placeholder: "Topic (e.g. 'making money with AI')" }),
  txt({ slug: "viral-title-generator", name: "Viral Title Generator", description: "Titles built for clicks.", category: "Content", icon: "Flame",
    system: "Generate 10 viral YouTube titles. Each under 60 chars. Use curiosity, numbers, or contrast. Numbered list.",
    placeholder: "Video topic" }),
  txt({ slug: "hashtag-generator", name: "Hashtag Generator", description: "30 perfectly-mixed hashtags.", category: "Content", icon: "Hash",
    system: "Generate 30 Instagram hashtags: 10 high-volume, 10 mid-volume niche, 10 long-tail. Output as space-separated list, each starting with #. No commentary.",
    placeholder: "Niche or post topic" }),
  txt({ slug: "youtube-description", name: "YouTube Description Writer", description: "SEO descriptions with chapters.", category: "Content", icon: "Youtube",
    system: "Write a YouTube description: 2 punchy intro lines, expanded summary, suggested chapters with timestamps, 5 tags. Plain text.",
    placeholder: "Video title + 1–2 sentences about the content" }),
  txt({ slug: "story-prompts", name: "Storytelling Prompt Generator", description: "Hooks for personal stories.", category: "Content", icon: "BookOpen",
    system: "Generate 8 storytelling prompts to spark a creator's personal story. Numbered list.",
    placeholder: "Theme (optional, e.g. 'overcoming fear')" }),
  txt({ slug: "blog-writer", name: "Blog Writer", description: "Full SEO blog post in seconds.", category: "Content", icon: "PenLine",
    system: "Write a 600–900 word SEO blog post with H2 sections, intro, conclusion, and a meta description at the end. Markdown.",
    placeholder: "Blog topic + audience" }),
  txt({ slug: "tweet-generator", name: "Tweet Generator", description: "10 tweets ready to post.", category: "Content", icon: "Twitter",
    system: "Generate 10 standalone tweets under 270 chars each. Numbered. No hashtags unless essential.",
    placeholder: "Topic or angle" }),
  txt({ slug: "pinterest-description", name: "Pinterest Description Generator", description: "Pin descriptions with keywords.", category: "Content", icon: "Image",
    system: "Write a 2–3 sentence Pinterest pin description with embedded SEO keywords. Add 5 hashtags at the end.",
    placeholder: "What's the pin about?" }),

  // ─── Video (text helpers) ─────────────────────────────────
  txt({ slug: "reel-idea-generator", name: "Reel Idea Generator", description: "10 fresh reel ideas.", category: "Video", icon: "Clapperboard", trending: true,
    system: "Generate 10 short-form video ideas with hook + format. Numbered list.",
    placeholder: "Niche (e.g. 'travel solo female')" }),
  txt({ slug: "scene-prompt", name: "Scene Prompt Generator", description: "Cinematic prompts for AI video.", category: "Video", icon: "Camera",
    system: "Write 5 cinematic AI-video prompts. Each: subject, action, environment, camera, lighting, mood. Numbered.",
    placeholder: "What scene or vibe?" }),
  txt({ slug: "subtitle-generator", name: "Subtitle Generator", description: "Clean SRT-ready subtitles.", category: "Video", icon: "Subtitles",
    system: "Convert this text into a clean SRT subtitle file. Split sentences at natural pauses, 2–6 words per line, 2 lines per block max. Use 00:00:00,000 timestamps assuming a reading speed of ~3 words/second.",
    placeholder: "Paste your script…" }),
  txt({ slug: "video-caption", name: "Video Caption Generator", description: "On-screen caption styles.", category: "Video", icon: "Captions",
    system: "Rewrite this as 8–12 short on-screen video captions. Each on its own line. ALL CAPS allowed for emphasis.",
    placeholder: "Paste your script" }),
  txt({ slug: "thumbnail-prompt", name: "Thumbnail Prompt Generator", description: "Prompts for clickable thumbnails.", category: "Video", icon: "Image",
    system: "Generate 3 AI image prompts for a YouTube thumbnail: high contrast, big readable text overlay description, bold colors. Numbered.",
    placeholder: "Video title" }),

  // ─── Audio (text helpers) ─────────────────────────────────
  txt({ slug: "podcast-intro", name: "Podcast Intro Generator", description: "Polished show intros.", category: "Audio", icon: "Mic",
    system: "Write a 30-second podcast intro script: hook, host intro, episode tease, CTA. Conversational tone.",
    placeholder: "Show name + episode topic" }),
  txt({ slug: "sound-effects-prompt", name: "Sound Effects Prompt Generator", description: "Prompts for AI SFX models.", category: "Audio", icon: "Music",
    system: "Generate 6 detailed sound-effect prompts (each 1–2 sentences) for an AI sfx model. Numbered.",
    placeholder: "Scene or vibe (e.g. 'rainy jazz café')" }),

  // ─── Image (image generation tools) ───────────────────────
  img({ slug: "ai-image", name: "AI Image Generator", description: "Create stunning images from text.", category: "Image", icon: "Image", trending: true,
    placeholder: "A cinematic portrait of a desert traveler at golden hour, 35mm film" }),
  img({ slug: "pinterest-pin", name: "Pinterest Pin Creator", description: "Vertical pins built to save.", category: "Image", icon: "Image", aspect: "2:3",
    imagePromptPrefix: "Vertical Pinterest pin design (2:3), bold typography overlay space at top, aesthetic and shareable, soft pastel palette. Subject: ",
    placeholder: "Pin topic (e.g. '5 morning habits for clear skin')" }),
  img({ slug: "instagram-carousel", name: "Instagram Carousel Creator", description: "Square carousel slides.", category: "Image", icon: "Square", aspect: "1:1",
    imagePromptPrefix: "Square (1:1) Instagram carousel slide, modern minimal design, large bold heading area, brand-ready, soft gradient background. Topic: ",
    placeholder: "Carousel topic" }),
  img({ slug: "logo-generator", name: "Logo Generator", description: "Concept logos for your brand.", category: "Image", icon: "Sparkles", aspect: "1:1",
    imagePromptPrefix: "Minimalist vector-style logo on a clean white background, balanced composition, modern, premium, scalable. Brief: ",
    placeholder: "Brand name + style (e.g. 'Lumen Studio, soft pastel, geometric')" }),
  img({ slug: "poster-generator", name: "Poster Generator", description: "Event & promo posters.", category: "Image", icon: "Image", aspect: "2:3",
    imagePromptPrefix: "Stunning event poster, bold typography zone, vibrant colors, designed for print. Brief: ",
    placeholder: "Event type, vibe, key info" }),
  img({ slug: "youtube-thumbnail", name: "YouTube Thumbnail Creator", description: "High-CTR thumbnails.", category: "Image", icon: "Youtube", aspect: "16:9",
    imagePromptPrefix: "YouTube thumbnail (16:9), high contrast, dramatic facial expression area, bold space for big headline text, saturated colors. Topic: ",
    placeholder: "Video topic + reaction (e.g. 'shocked face, $1 vs $1000 setup')" }),
  img({ slug: "profile-picture", name: "Profile Picture Generator", description: "Stylized portraits.", category: "Image", icon: "User", aspect: "1:1",
    imagePromptPrefix: "Square stylized profile picture, soft studio lighting, shallow depth of field, vibrant aesthetic. Description: ",
    placeholder: "Describe the person and style" }),

  // ─── Specialized image / video ────────────────────────────
  { slug: "color-palette", name: "Color Palette Generator", description: "AI-curated palettes from a vibe.", category: "Image", kind: "palette", icon: "Palette",
    placeholder: "Vibe or mood (e.g. 'sunset over Tokyo')" },
  { slug: "font-pairing", name: "Font Pairing Tool", description: "Heading + body pairings.", category: "Image", kind: "fonts", icon: "Type",
    placeholder: "Brand vibe (e.g. 'luxury skincare')" },
  { slug: "canvas-editor", name: "Canva-style Editor", description: "Quick drag-and-drop image editor.", category: "Image", kind: "editor", icon: "Layers" },
  { slug: "background-remover", name: "Background Remover", description: "Remove backgrounds in one click.", category: "Image", kind: "bg-remove", icon: "Scissors", trending: true },
  { slug: "character-swap", name: "Character Swap", description: "Swap subjects between images.", category: "Image", kind: "face-swap", icon: "Users" },
  { slug: "face-swap", name: "Face Swap", description: "Face swap between two photos.", category: "Image", kind: "face-swap", icon: "User", trending: true },

  // ─── Video generation ─────────────────────────────────────
  { slug: "ai-video", name: "AI Video Generator", description: "Generate short cinematic clips.", category: "Video", kind: "video", icon: "Film", trending: true },
  { slug: "faceless-video", name: "Faceless Video Generator", description: "AI-narrated faceless videos.", category: "Video", kind: "video", icon: "Video" },
  { slug: "video-enhancer", name: "Video Enhancer", description: "Upscale & enhance footage.", category: "Video", kind: "video", icon: "Wand" },
  { slug: "auto-shorts", name: "Auto Shorts Generator", description: "Turn long videos into shorts.", category: "Video", kind: "video", icon: "Scissors" },

  // ─── Audio ────────────────────────────────────────────────
  { slug: "voice", name: "AI Voice Generator", description: "Realistic voiceovers in any voice.", category: "Audio", kind: "audio-tts", icon: "Mic", trending: true },
  { slug: "text-to-speech", name: "Text to Speech", description: "Fast TTS for any script.", category: "Audio", kind: "audio-tts", icon: "Volume2" },
  { slug: "speech-to-text", name: "Speech to Text", description: "Transcribe audio to text.", category: "Audio", kind: "audio-stt", icon: "FileAudio" },
  { slug: "music-generator", name: "AI Music Generator", description: "Royalty-free background music.", category: "Audio", kind: "audio-tts", icon: "Music" },
  { slug: "voice-changer", name: "Voice Changer", description: "Re-voice any audio file.", category: "Audio", kind: "audio-stt", icon: "Repeat" },
  { slug: "audio-cleaner", name: "Audio Cleaner", description: "Remove noise & hum.", category: "Audio", kind: "audio-stt", icon: "Sparkles" },
  { slug: "audio-subtitles", name: "Audio Subtitle Generator", description: "Transcribe & subtitle audio.", category: "Audio", kind: "audio-stt", icon: "Subtitles" },

  // ─── Resources ────────────────────────────────────────────
  { slug: "stock-videos", name: "Free Stock Videos", description: "Hand-picked free 4K clips.", category: "Resources", kind: "resource", icon: "Video" },
  { slug: "free-music", name: "Free Music Library", description: "No-copyright music tracks.", category: "Resources", kind: "resource", icon: "Music" },
  { slug: "sound-effects", name: "Free Sound Effects", description: "SFX for every scene.", category: "Resources", kind: "resource", icon: "Volume2" },
  { slug: "aesthetic-images", name: "Aesthetic Images", description: "Beautiful free stock photos.", category: "Resources", kind: "resource", icon: "Image" },
  { slug: "trending-sounds", name: "Trending Sounds", description: "What's trending on Reels & TikTok.", category: "Resources", kind: "resource", icon: "Flame" },
  { slug: "viral-reel-ideas", name: "Viral Reel Ideas", description: "Fresh viral ideas daily.", category: "Resources", kind: "resource", icon: "Sparkles", trending: true },
  { slug: "inspiration-gallery", name: "Creator Inspiration", description: "Curated visual moodboard.", category: "Resources", kind: "resource", icon: "LayoutGrid" },
];

export const CATEGORIES: ToolCategory[] = ["Content", "Video", "Audio", "Image", "Resources"];

export function findTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}
