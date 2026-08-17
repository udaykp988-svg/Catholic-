/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

app.use(express.json());
app.use(cors());

// ── Supabase client (optional — falls back to JSON file if not configured) ──
let supabase: ReturnType<typeof createClient> | null = null;
if (process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
  console.log("Supabase connected.");
} else {
  console.log("No Supabase config — using local JSON fallback.");
}

// ── Auto-create table on first run ──────────────────────────────────────────
async function setupDatabase() {
  if (!supabase) return;
  try {
    // Try to query the table — if it doesn't exist, create it via REST API
    const { error } = await supabase.from("community_prayers").select("id").limit(1);
    if (error && error.code === "42P01") {
      // Table doesn't exist — use Supabase management API to create it
      console.log("Creating community_prayers table...");
      await supabase.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS community_prayers (
            id BIGSERIAL PRIMARY KEY,
            content TEXT NOT NULL,
            author_name TEXT NOT NULL DEFAULT 'Anonymous',
            amen_count INTEGER NOT NULL DEFAULT 0,
            category TEXT NOT NULL DEFAULT 'Other',
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
          );
          INSERT INTO community_prayers (content, author_name, amen_count, category) VALUES
            ('Please pray for my mother who is undergoing surgery tomorrow. Asking for Saint Luke''s intercession.', 'M. G.', 14, 'Healing'),
            ('Giving thanks to Our Lord for a healthy baby boy born today! Thank you, Mother Mary.', 'Anonymous', 22, 'Thanksgiving'),
            ('In search of job opportunities and peace. Praying for Saint Cajetan''s intercession.', 'T. J.', 8, 'Strength')
          ON CONFLICT DO NOTHING;
        `
      });
      console.log("Table created successfully.");
    } else if (!error) {
      console.log("Database table ready.");
    }
  } catch (e) {
    console.log("Database auto-setup note:", e);
  }
}
setupDatabase();

// ── Rate limiters ────────────────────────────────────────────────────────────
const communityWallPostLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many prayer submissions. Please wait a few minutes." },
});

const amenLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: "Too many Amen requests. Please slow down." },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: "Too many AI requests. Please wait a moment." },
});

// ── Gemini AI ────────────────────────────────────────────────────────────────
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    console.log("Gemini API initialized.");
  } catch (err) {
    console.error("Error initializing Gemini API:", err);
  }
} else {
  console.log("No GEMINI_API_KEY — using static fallback content.");
}

async function generateContentWithRetry(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
}) {
  if (!ai) throw new Error("Gemini API client not initialized");

  const primaryModel = params.preferredModel || "gemini-2.0-flash";
  const fallbackModel = "gemini-1.5-flash";

  try {
    const response = await ai.models.generateContent({
      model: primaryModel,
      contents: params.contents,
      config: params.config,
    });
    return response;
  } catch (firstError: any) {
    console.log(`Primary model failed, trying ${fallbackModel}...`);
    try {
      return await ai.models.generateContent({
        model: fallbackModel,
        contents: params.contents,
        config: params.config,
      });
    } catch (secondError: any) {
      console.error("Both models failed:", secondError?.message);
      throw firstError;
    }
  }
}

// ── Community Prayer Wall — Supabase + JSON fallback ────────────────────────
interface CommunityPrayer {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  amenCount: number;
  category: "Healing" | "Family" | "Thanksgiving" | "Strength" | "Hope" | "Other";
}

// JSON fallback (used when Supabase is not configured)
const DATA_FILE = path.join(process.cwd(), "prayers_db.json");
let localPrayers: CommunityPrayer[] = [];

const defaultPrayers: CommunityPrayer[] = [
  {
    id: "1",
    content: "Please pray for my mother who is undergoing surgery tomorrow morning. Asking for Saint Luke's intercession and God's healing hands.",
    authorName: "M. G.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    amenCount: 14,
    category: "Healing",
  },
  {
    id: "2",
    content: "Giving thanks to Our Lord for a healthy baby boy born today! Thank you, Mother Mary, for your continuous protection.",
    authorName: "Anonymous",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    amenCount: 22,
    category: "Thanksgiving",
  },
  {
    id: "3",
    content: "In search of job opportunities and emotional peace. Praying for Saint Cajetan's intercession.",
    authorName: "T. J.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    amenCount: 8,
    category: "Strength",
  },
];

function loadLocalPrayers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      localPrayers = JSON.parse(fs.readFileSync(DATA_FILE, "utf-8"));
    } else {
      localPrayers = [...defaultPrayers];
      saveLocalPrayers();
    }
  } catch {
    localPrayers = [...defaultPrayers];
  }
}

function saveLocalPrayers() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(localPrayers, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving prayers:", e);
  }
}

loadLocalPrayers();

// ── Wall API helpers ─────────────────────────────────────────────────────────
async function dbGetPrayers(): Promise<CommunityPrayer[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from("community_prayers")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return (data || []).map((r: any) => ({
      id: String(r.id),
      content: r.content,
      authorName: r.author_name,
      createdAt: r.created_at,
      amenCount: r.amen_count,
      category: r.category,
    }));
  }
  return [...localPrayers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

async function dbAddPrayer(prayer: CommunityPrayer): Promise<CommunityPrayer> {
  if (supabase) {
    const { data, error } = await supabase
      .from("community_prayers")
      .insert({
        content: prayer.content,
        author_name: prayer.authorName,
        amen_count: 0,
        category: prayer.category,
      })
      .select()
      .single();
    if (error) throw error;
    return {
      id: String(data.id),
      content: data.content,
      authorName: data.author_name,
      createdAt: data.created_at,
      amenCount: data.amen_count,
      category: data.category,
    };
  }
  localPrayers.push(prayer);
  saveLocalPrayers();
  return prayer;
}

async function dbAmen(id: string): Promise<CommunityPrayer | null> {
  if (supabase) {
    const { data, error } = await supabase.rpc("increment_amen", { prayer_id: parseInt(id) });
    if (error) {
      // fallback: manual increment
      const { data: row } = await supabase
        .from("community_prayers")
        .select("amen_count")
        .eq("id", id)
        .single();
      if (row) {
        const { data: updated } = await supabase
          .from("community_prayers")
          .update({ amen_count: row.amen_count + 1 })
          .eq("id", id)
          .select()
          .single();
        if (updated) return {
          id: String(updated.id),
          content: updated.content,
          authorName: updated.author_name,
          createdAt: updated.created_at,
          amenCount: updated.amen_count,
          category: updated.category,
        };
      }
      return null;
    }
    return data;
  }
  const prayer = localPrayers.find(p => p.id === id);
  if (!prayer) return null;
  prayer.amenCount += 1;
  saveLocalPrayers();
  return prayer;
}

// ── Static reflections ───────────────────────────────────────────────────────
const staticReflections: Record<string, any> = {
  default: {
    id: "today-default",
    title: "Behold, I am with you always",
    verse: "Go therefore and make disciples of all nations... And behold, I am with you always, to the end of the age.",
    reference: "Matthew 28:19-20",
    reflectionText: "Our Lord does not promise a life without storms. He promises His perpetual presence. Even in moments when we feel abandoned, Christ is there, bearing our cross with us. We are called to step out in deep faith, knowing we are loved with an everlasting, divine love.",
    morningPrayer: "Heavenly Father, thank You for the gift of a new day. Keep me close to Your Sacred Heart. Let my every word and action be a hymn of praise to You. Jesus, I trust in You. Amen.",
    eveningPrayer: "Merciful Lord, as the sun sets, I place all my worries into Your hands. Forgive my shortcomings, and bless my loved ones. Mary, Help of Christians, pray for us. Amen.",
  },
  Monday: { id: "ref-mon", title: "The Narrow Gate and the Path of Life", verse: "Enter through the narrow gate. For wide is the gate and broad is the road that leads to destruction.", reference: "Matthew 7:13-14", reflectionText: "The Christian life is not a path of easy compromises. Walking the narrow road requires humility, frequent confession, and self-discipline. Yet this path offers the ultimate spiritual freedom. By letting go of worldly attachments, we gain the fullness of God's grace.", morningPrayer: "Lord Jesus, establish my feet on the narrow path today. Grant me courage to reject easy falsehoods and stand firm in Your truth. Holy Spirit, guide my conscience. Amen.", eveningPrayer: "Father, thank you for guiding me through today. Cleanse my soul with Your mercy, and grant me peaceful sleep. Guardian Angel, keep watch. Amen." },
  Tuesday: { id: "ref-tue", title: "Like a Tree Planted Near Streams of Water", verse: "He is like a tree planted near streams of water, that yields its fruit in due season.", reference: "Psalm 1:1-3", reflectionText: "To bear fruit in our spiritual life, we must remain rooted in the sacraments and daily prayer. When dry seasons come, our deep spiritual roots drawn from the Eucharistic waters will keep us nourishing. Stay planted near the Lord.", morningPrayer: "O Loving Creator, root my soul in Your holy word today. Let Your grace water my dry moments and help me produce fruits of patience and charity. Amen.", eveningPrayer: "Sacred Heart of Jesus, I place my family under the shelter of Your mercy. Comfort the sick and dying this evening. O Lord, keep us under Your wings. Amen." },
  Wednesday: { id: "ref-wed", title: "The Good Shepherd's Voice", verse: "My sheep hear my voice; I know them, and they follow me. I give them eternal life.", reference: "John 10:27-28", reflectionText: "The world is incredibly loud. Amid this noise, the Good Shepherd whispers with gentle majesty. Silent meditation, especially before the Blessed Sacrament, allows us to discern His voice from chaos. Listen and find rest.", morningPrayer: "Lord Jesus, my Good Shepherd, speak to my heart in silence today. Calm my restless thoughts so I can follow Your voice. Amen.", eveningPrayer: "Lord, thank You for Your shield of peace today. I surrender my fears to Your sovereign wisdom. Eternal Father, protect us through the night. Amen." },
  Thursday: { id: "ref-thu", title: "The Eucharist: The Bread of Life", verse: "I am the living bread that came down from heaven; whoever eats this bread will live forever.", reference: "John 6:51", reflectionText: "In the Holy Eucharist, Jesus does not merely give us a symbol, but His actual Body, Blood, Soul, and Divinity. It is the source and summit of our Christian life. Consuming Him in Holy Communion transforms us, aligning our hearts with His infinite love.", morningPrayer: "Lord Jesus, I adore You in the Blessed Sacrament. Come spiritually into my heart and live in me. Amen.", eveningPrayer: "O Blessed Sacrament, our shelter and strength. Thank you for refueling my soul today. Sweet Heart of Mary, prepare our souls. Amen." },
  Friday: { id: "ref-fri", title: "The Power of the Cross", verse: "But God proves his love for us in that while we were still sinners Christ died for us.", reference: "Romans 5:8", reflectionText: "Friday is traditionally a day for remembering our Lord's Passion. The cross, which once symbolized defeat, was transformed into the key of heaven and the throne of mercy. When we suffer, we are invited to unite our pains with Christ's cross, making our trials redemptive.", morningPrayer: "My crucified Lord, thank You for Your love on Calvary. I offer up all my discomforts today in union with Your Holy Passion. Amen.", eveningPrayer: "O Christ, by Your Holy Cross You have redeemed the world. Cover us with Your precious blood tonight. Stay with us, Lord. Amen." },
  Saturday: { id: "ref-sat", title: "Mary's Fiat and Obedience of Faith", verse: "Mary said, 'Behold, I am the handmaid of the Lord. May it be done to me according to your word.'", reference: "Luke 1:38", reflectionText: "Our Lady's Fiat — her complete surrender to God's will — set salvation into motion. To follow Mary is to say a joyful Yes to God, even when the path ahead seems mysterious or painful. By surrendering our control, we make beautiful room for divine grace.", morningPrayer: "Holy Mary, Mother of God, teach me to say yes to God as you did. Hold my hand today and lead me to Your Divine Son. Amen.", eveningPrayer: "Hail, Holy Queen, Mother of Mercy. We entrust our parish and all lonely souls to your motherly care as we sleep. Amen." },
  Sunday: { id: "ref-sun", title: "The Glory of the Resurrection", verse: "Why do you seek the living one among the dead? He is not here, but he has been raised.", reference: "Luke 24:5-6", reflectionText: "Sunday is the day of our Lord's triumphant victory over sin and death! The Resurrection is the foundation of our eternal hope. No matter how dark our Friday is, Sunday is coming. Let us worship with profound joy and go forth as Easter people.", morningPrayer: "Almighty Father, by the resurrection of Your Son, You conquered death. Fill me with Your Holy Spirit as I celebrate the Mass today. Amen.", eveningPrayer: "Risen Lord, thank you for the spiritual rejuvenation of this Sabbath. May Your resurrection light shine through my life this week. All glory be to the Father, Son, and Holy Spirit. Amen." },
};

// ── API ROUTES ───────────────────────────────────────────────────────────────

// 1. Daily reflection
app.get("/api/reflections/today", aiLimiter, async (req, res) => {
  const customTopic = req.query.topic as string;
  const daysOfWeek = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const todayDayName = daysOfWeek[new Date().getDay()];
  const baseReflection = staticReflections[todayDayName] || staticReflections["default"];

  if (customTopic && ai) {
    try {
      const prompt = `You are a warm, traditional Catholic theologian. Provide a personal daily reflection based on the user's focus topic: "${customTopic}". Respond in strict JSON format:
{"title":"...","verse":"...","reference":"...","reflectionText":"...","morningPrayer":"...","eveningPrayer":"..."}
Only valid JSON, no markdown.`;
      const response = await generateContentWithRetry({
        preferredModel: "gemini-2.0-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });
      const text = response.text?.trim();
      if (text) return res.json({ id: "today-gen", date: new Date().toISOString().substring(0, 10), ...JSON.parse(text) });
    } catch (e) {
      console.log("Reflection AI failed, using static fallback");
    }
  }

  return res.json({ ...baseReflection, date: new Date().toISOString().substring(0, 10) });
});

// 2. Generate devotional
app.post("/api/generate-devotional", aiLimiter, async (req, res) => {
  const { mood, intention } = req.body;
  const fallback = {
    text: `"Come to me, all you who labor and are burdened, and I will give you rest." (Matthew 11:28)\n\nMy child, as you seek support for your intention: "${intention || "General Peace"}", remember that God's timing is perfect. Walk in His light today. Saint Jude, pray for us.`,
    simulated: true,
  };
  if (!ai) return res.json(fallback);
  try {
    const prompt = `You are an encouraging Catholic spiritual director. Write a beautiful Catholic Morning devotional for someone with a mood of "${mood || "trusting"}" praying for: "${intention || "spiritual growth"}". Include: a relevant Scripture with citation, a brief compassionate commentary, and a prayer with saint intercession. Keep it serene, traditional, and beautiful.`;
    const response = await generateContentWithRetry({ preferredModel: "gemini-2.0-flash", contents: prompt });
    return res.json({ text: response.text || fallback.text, simulated: false });
  } catch {
    return res.json(fallback);
  }
});

// 3. Get wall prayers
app.get("/api/community-wall", async (req, res) => {
  try {
    const prayers = await dbGetPrayers();
    res.json(prayers);
  } catch (e) {
    console.error("Error fetching wall:", e);
    res.json(localPrayers);
  }
});

// 4. Post prayer
app.post("/api/community-wall", communityWallPostLimiter, async (req, res) => {
  const { content, authorName, category } = req.body;
  if (!content || typeof content !== "string" || content.trim().length === 0)
    return res.status(400).json({ error: "Prayer content cannot be empty." });
  if (content.trim().length > 600)
    return res.status(400).json({ error: "Prayer content is too long (max 600 characters)." });
  if (authorName && typeof authorName === "string" && authorName.trim().length > 60)
    return res.status(400).json({ error: "Author name is too long (max 60 characters)." });

  const validCategories = ["Healing","Family","Thanksgiving","Strength","Hope","Other"];
  const safeCategory = validCategories.includes(category) ? category : "Other";

  const newPrayer: CommunityPrayer = {
    id: String(Date.now()),
    content: content.trim(),
    authorName: authorName?.trim() || "Anonymous",
    createdAt: new Date().toISOString(),
    amenCount: 0,
    category: safeCategory as CommunityPrayer["category"],
  };

  try {
    const saved = await dbAddPrayer(newPrayer);
    res.status(201).json(saved);
  } catch (e) {
    console.error("Error saving prayer:", e);
    res.status(500).json({ error: "Failed to save prayer." });
  }
});

// 5. Amen
app.post("/api/community-wall/:id/amen", amenLimiter, async (req, res) => {
  try {
    const prayer = await dbAmen(req.params.id);
    if (!prayer) return res.status(404).json({ error: "Prayer not found." });
    res.json(prayer);
  } catch (e) {
    res.status(500).json({ error: "Failed to update amen count." });
  }
});

// 6. Generate affirmation
app.post("/api/generate-affirmation", aiLimiter, async (req, res) => {
  const { season, favoriteSaint } = req.body;
  const validSeasons = ["Ordinary Time","Lent","Easter","Advent","Christmas"];
  const selectedSeason = validSeasons.includes(season) ? season : "Ordinary Time";

  const fallback = {
    quote: "Do ordinary things with extraordinary love.",
    saintName: "Saint Teresa of Calcutta",
    affirmation: "I will seek God in the small moments of this ordinary day, transforming my routine tasks into acts of prayer and love.",
    contemplation: "God does not ask great deeds, but great love in the midst of normal responsibilities.",
    liturgicalSeason: selectedSeason,
    simulated: true,
  };

  if (!ai) return res.json(fallback);

  try {
    const prompt = `You are a devout Catholic theologian. Generate a saint-inspired Quote, Affirmation, and Contemplation ${favoriteSaint ? `focused on ${favoriteSaint}` : `for the ${selectedSeason} season`}. Respond in strict JSON:
{"quote":"...","saintName":"...","affirmation":"...","contemplation":"..."}
Only valid JSON, no markdown.`;
    const response = await generateContentWithRetry({
      preferredModel: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    const text = response?.text?.trim();
    if (text) return res.json({ ...JSON.parse(text), liturgicalSeason: selectedSeason, simulated: false });
    throw new Error("Empty response");
  } catch {
    return res.json(fallback);
  }
});

// 7. Saints explore
app.get("/api/saints/explore", aiLimiter, async (req, res) => {
  const query = req.query.q as string;
  if (!query || query.trim().length === 0)
    return res.status(400).json({ error: "Saint search query cannot be empty." });
  if (query.trim().length > 100)
    return res.status(400).json({ error: "Query too long." });

  if (!ai) {
    return res.json({
      id: `st-offline-${Date.now()}`,
      name: query.startsWith("Saint") ? query : `Saint ${query}`,
      title: "Devout Servant of Christ",
      feastDay: "October 17",
      patronage: "Seekers of truth",
      era: "Early Church",
      color: "white",
      biography: "A dedicated witness of Christ who served with exemplary faith.",
      virtues: ["Devotion","Humility","Peace"],
      traditionalPrayer: "O Lord, grant us grace through the intercession of this blessed saint. Amen.",
      simulated: true,
    });
  }

  try {
    const prompt = `You are an expert Catholic hagiographer. Generate a detailed profile for: "${query}". Respond in strict JSON:
{"name":"...","title":"...","feastDay":"...","patronage":"...","era":"...","color":"white|red|green|violet|rose|blue","biography":"...","virtues":["...","...","..."],"traditionalPrayer":"..."}
Only valid JSON, no markdown.`;
    const response = await generateContentWithRetry({
      preferredModel: "gemini-2.0-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" },
    });
    const text = response?.text?.trim();
    if (text) return res.json({ id: `st-gen-${Date.now()}`, ...JSON.parse(text), simulated: false });
    throw new Error("Empty response");
  } catch (err) {
    return res.json({
      id: `st-err-${Date.now()}`,
      name: query.startsWith("Saint") ? query : `Saint ${query}`,
      title: "Holy Advocate of Faith",
      feastDay: "November 14",
      patronage: "Patience under trial",
      era: "Early Church",
      color: "white",
      biography: "A quiet disciple who offered a life of contemplation and charitable service.",
      virtues: ["Patience","Prayer","Grace"],
      traditionalPrayer: "O Holy Saint, pray for us that we may grow in quiet patience. Amen.",
      simulated: true,
    });
  }
});

// ── Serve frontend ────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== "production") {
  const startVite = async () => {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  };
  startVite();
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => res.sendFile(path.join(distPath, "index.html")));
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Catholic Prayer server running on http://0.0.0.0:${PORT}`);
  console.log(`Database: ${supabase ? "Supabase ✓" : "Local JSON (ephemeral)"}`);
});
