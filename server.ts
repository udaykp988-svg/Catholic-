/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini SDK with safety checks
// Safe initialization prevents crashes during node boot
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully with build telemetry.");
  } catch (err) {
    console.error("Error initializing Gemini API:", err);
  }
} else {
  console.log("No GEMINI_API_KEY found. Using liturgical fallback engine.");
}

/**
 * Robust helper to query Gemini content generation with automated retries and fallback model.
 * If the primary model (default: gemini-3.5-flash) experiences high demand (503),
 * rate limits (429), or general outages, it automatically fails over to gemini-3.1-flash-lite.
 */
async function generateContentWithRetry(params: {
  contents: any;
  config?: any;
  preferredModel?: string;
}) {
  if (!ai) {
    throw new Error("Gemini API client not initialized");
  }

  const primaryModel = params.preferredModel || "gemini-3.5-flash";
  const fallbackModel = "gemini-3.1-flash-lite";

  try {
    console.log(`Attempting generateContent with primary model: ${primaryModel}`);
    const response = await ai.models.generateContent({
      model: primaryModel,
      contents: params.contents,
      config: params.config,
    });
    return response;
  } catch (firstError: any) {
    const errorMsg = String(firstError?.message || firstError);
    const isTemporaryError = firstError && (
      firstError.status === "UNAVAILABLE" || 
      firstError.code === 503 ||
      firstError.status === "RESOURCE_EXHAUSTED" ||
      firstError.code === 429 ||
      errorMsg.includes("503") ||
      errorMsg.includes("429") ||
      errorMsg.includes("RESOURCE_EXHAUSTED") ||
      errorMsg.includes("UNAVAILABLE") ||
      errorMsg.includes("high demand")
    );

    if (isTemporaryError) {
      console.log(`[Graceful Recovery] Primary model ${primaryModel} is experiencing temporary high demand. Automatically routeing to ${fallbackModel}.`);
      try {
        const response = await ai.models.generateContent({
          model: fallbackModel,
          contents: params.contents,
          config: params.config,
        });
        console.log(`[Graceful Recovery] Failover to ${fallbackModel} succeeded.`);
        return response;
      } catch (secondError: any) {
        console.error(`[Server Alert] Fallback model ${fallbackModel} also failed:`, secondError?.message || secondError);
        throw secondError;
      }
    } else {
      console.log(`[Graceful Recovery] General busy status on primary model. Trying ${fallbackModel} for high availability.`);
      try {
        const response = await ai.models.generateContent({
          model: fallbackModel,
          contents: params.contents,
          config: params.config,
        });
        console.log(`[Graceful Recovery] Failover to ${fallbackModel} succeeded after general status.`);
        return response;
      } catch (secondError: any) {
        console.error(`[Server Alert] Both primary and fallback models failed:`, firstError?.message || firstError);
        throw firstError; // Throw original error if both fail
      }
    }
  }
}

// Memory database for the anonymous Community Prayer Wall
// To persist across server refreshes, we can utilize a temp JSON file
const DATA_FILE = path.join(process.cwd(), "prayers_db.json");

interface CommunityPrayer {
  id: string;
  content: string;
  authorName: string;
  createdAt: string;
  amenCount: number;
  category: 'Healing' | 'Family' | 'Thanksgiving' | 'Strength' | 'Hope' | 'Other';
}

let communityPrayers: CommunityPrayer[] = [];

const defaultPrayers: CommunityPrayer[] = [
  {
    id: "1",
    content: "Please pray for my mother who is undergoing surgery tomorrow morning. Asking for Saint Luke's intercession and God's healing hands.",
    authorName: "M. G.",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    amenCount: 14,
    category: "Healing"
  },
  {
    id: "2",
    content: "Giving thanks to Our Lord for a healthy baby boy born today! Thank you, Mother Mary, for your continuous protection.",
    authorName: "Anonymous",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    amenCount: 22,
    category: "Thanksgiving"
  },
  {
    id: "3",
    content: "In search of job opportunities and emotional peace. Praying for Saint Cajetan's intercession to overcome this financial crisis.",
    authorName: "T. J.",
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    amenCount: 8,
    category: "Strength"
  },
  {
    id: "4",
    content: "For a family suffering from division and resentment. Praying that Saint Joseph repairs their hearts and brings unity and reconciliation.",
    authorName: "Anonymous",
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    amenCount: 19,
    category: "Family"
  },
  {
    id: "5",
    content: "Praying for our parish community and all priests, that they are filled with the Holy Spirit as they shepherd the flock.",
    authorName: "Faithful Pilgrim",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    amenCount: 12,
    category: "Hope"
  }
];

// Load community prayers from temporary JSON DB or seed with defaults
function loadPrayers() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, "utf-8");
      communityPrayers = JSON.parse(raw);
    } else {
      communityPrayers = [...defaultPrayers];
      savePrayers();
    }
  } catch (error) {
    console.error("Error loading prayers:", error);
    communityPrayers = [...defaultPrayers];
  }
}

function savePrayers() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(communityPrayers, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing prayers database:", error);
  }
}

// Initial load
loadPrayers();

// Daily static reflections as fallbacks or presets
const staticReflections: { [key: string]: {
  id: string;
  title: string;
  verse: string;
  reference: string;
  reflectionText: string;
  morningPrayer: string;
  eveningPrayer: string;
}} = {
  "default": {
    id: "today-default",
    title: "Behold, I am with you always",
    verse: "Go therefore and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit, teaching them to observe all that I have commanded you. And behold, I am with you always, to the end of the age.",
    reference: "Matthew 28:19-20",
    reflectionText: "Our Lord Jesus Christ does not promise us that we will walk through life without storms or struggles. Rather, He promises a far greater reality: His perpetual presence. Even in moments when we feel abandoned or when the dark night of our soul seems infinite, Christ is there with us, bearing our cross, comforting our spirits. We are called to step out in deep faith, knowing that we are loved with an everlasting, divine love.",
    morningPrayer: "Heavenly Father, thank You for the gift of a new day. Keep me close to Your Sacred Heart. Let my every word, action, and silent thought be a hymn of praise to You. Jesus, I trust in You. Amen.",
    eveningPrayer: "Merciful Lord, as the sun sets, I place all my worries, successes, and failures of this day into Your hands. Forgive my shortcomings, and bless my loved ones who rest tonight in Your protection. Mary, Help of Christians, pray for us. Amen."
  },
  "Monday": {
    id: "ref-mon",
    title: "The Narrow Gate and the Path of Life",
    verse: "Enter through the narrow gate. For wide is the gate and broad is the road that leads to destruction, and many enter through it. But small is the gate and narrow the road that leads to life, and only a few find it.",
    reference: "Matthew 7:13-14",
    reflectionText: "The Christian life is not a path of easy compromises. Walking the narrow road requires humility, frequent confession, self-discipline, and carrying our crosses each day. Yet, this path, seemingly rigid, offers the ultimate spiritual freedom and security. By letting go of temporal worldly attachments, we gain the eternal fullness of God's abundant grace.",
    morningPrayer: "Lord Jesus, establish my feet on the narrow path of righteousness today. Grant me the courage to reject easy falsehoods and stand firm in your truth. Holy Spirit, guide my conscience. Amen.",
    eveningPrayer: "Father, thank you for guiding me through the chores and trials of today. Cleanse my soul with your mercy, and grant me a peaceful sleep so that I may rise ready to serve you. Guardian Angel, keep watch. Amen."
  },
  "Tuesday": {
    id: "ref-tue",
    title: "Like a Tree Planted Near Streams of Water",
    verse: "Blessed is the man who does not walk in the counsel of the wicked... He is like a tree planted near streams of water, that yields its fruit in due season, and whose leaves do not wither.",
    reference: "Psalm 1:1-3",
    reflectionText: "To bear fruit in our spiritual life, we must remain rooted in the sacraments and the habit of earnest, daily prayer. When dry seasons come—whether through grief, dry prayers, or secular distractions—our deep spiritual roots drawn from the Eucharistic waters will keep us nourishing. Stay planted near the Lord, and do not fear the summer heat.",
    morningPrayer: "O Loving Creator, root my soul in Your holy word today. Let your grace water my dry moments and help me produce fruits of patience, charity, and understanding. Amen.",
    eveningPrayer: "Sacred Heart of Jesus, I place my family and friends under the shelter of your infinite mercy. Comfort the sick and the dying this evening. O Lord, keep us under your wings. Amen."
  },
  "Wednesday": {
    id: "ref-wed",
    title: "The Good Shepherd's Voice",
    verse: "My sheep hear my voice; I know them, and they follow me. I give them eternal life, and they shall never perish.",
    reference: "John 10:27-28",
    reflectionText: "The world is incredibly loud, constantly calling us to look at screens, worry about statistics, and seek material affirmation. Amid this sensory noise, the Good Shepherd whispers with gentle majesty. Silent meditation, especially before the Blessed Sacrament or during the Holy Rosary, allows us to discern His voice from the echoes of chaos. Listen and find rest.",
    morningPrayer: "Lord Jesus Christ, my Good Shepherd, speak to my heart in the silence today. Calm my restless thoughts so I can follow Your voice wherever You lead me. Amen.",
    eveningPrayer: "Lord, I give You thanks for your shield of peace today. I surrender my fears of the future to Your sovereign wisdom. Eternal Father, protect us through the dark night. Amen."
  },
  "Thursday": {
    id: "ref-thu",
    title: "The Eucharist: The Bread of Life",
    verse: "I am the living bread that came down from heaven; whoever eats this bread will live forever; and the bread that I will give is my flesh for the life of the world.",
    reference: "John 6:51",
    reflectionText: "In the Holy Eucharist, Jesus does not merely give us a historical symbol, but His actual Body, Blood, Soul, and Divinity. It is the source and summit of our entire Christian life! Consuming Him in Holy Communion or spending time in quiet Eucharistic Adoration transforms us, aligning our hearts to beat in harmony with His perfect, infinite love.",
    morningPrayer: "Lord Jesus, I adore you profoundly in the Blessed Sacrament. Though I may not receive you sacramentally this very hour, I ask you to come spiritually into my heart and live in me. Amen.",
    eveningPrayer: "O Blessed Sacrament, our shelter and strength. Thank you for refueling my soul today. We pray for all Christians who face persecution for their Eucharistic faith. Sweet Heart of Mary, prepare our souls. Amen."
  },
  "Friday": {
    id: "ref-fri",
    title: "The Power of the Cross",
    verse: "But God proves his love for us in that while we were still sinners Christ died for us.",
    reference: "Romans 5:8",
    reflectionText: "Friday is traditionally a day for remembering our Lord's suffering and crucifixion. The cross, which once symbolized execution and absolute defeat, was transformed into the key of heaven and the ultimate throne of mercy. When we suffer, we are invited to unite our pains with Christ's cross, rendering our individual trials deeply meaningful and redemptive.",
    morningPrayer: "My crucified Lord, thank You for Your endless, self-sacrificing love on Calvary. I offer up all my modern discomforts and trials today in union with Your Holy Passion for the conversion of sinners. Amen.",
    eveningPrayer: "O Christ, by your Holy Cross, you have redeemed the world. Cover us with Your precious blood tonight. Comfort all who grieve and relieve the suffering in purgatory. Stay with us, Lord. Amen."
  },
  "Saturday": {
    id: "ref-sat",
    title: "Mary's Fiat and Obedience of Faith",
    verse: "Mary said, 'Behold, I am the handmaid of the Lord. May it be done to me according to your word.'",
    reference: "Luke 1:38",
    reflectionText: "Our Lady's 'Fiat'—her complete, unreserved surrender to God's will—set file of salvation into holy motion. On Saturday, we traditionally honor Saint Mary. To follow Mary's example is to say a joyful 'Yes' to God, even when the path ahead seems mysterious or painful. By surrendering our own control, we make beautiful room for divine grace.",
    morningPrayer: "Holy Mary, Mother of God, teach me to say yes to God as you did. Hold my hand today, lead me to your Divine Son, and shield me from temptation under your maternal mantle. Amen.",
    eveningPrayer: "Hail, Holy Queen, Mother of Mercy, our life, our sweetness, and our hope. We entrust our parish and all lonely souls to your motherly care as we sleep. Pray for us, holy Mother of God. Amen."
  },
  "Sunday": {
    id: "ref-sun",
    title: "The Glory of the Resurrection",
    verse: "Why do you seek the living one among the dead? He is not here, but he has been raised.",
    reference: "Luke 24:5-6",
    reflectionText: "Sunday is the day of our Lord's triumphant victory over sin and death! The Resurrection is the foundation of our eternal hope. No matter how dark our Friday is, we are assured that Sunday is coming. Let us worship with profound joy, celebrate the Holy Mass with absolute reverence, and go forth as easter people carrying the light of Christ to a dark world.",
    morningPrayer: "Almighty Father, by the resurrection of Your Son, You conquered death and opened the gateway to eternal life. Fill me with Your Holy Spirit as I celebrate the Mass today. Amen.",
    eveningPrayer: "Risen Lord, thank you for the spiritual rejuvenation of this Sabbath Day. May your resurrection light shine brightly through my life in the coming week. All glory be to the Father, Son, and Holy Spirit. Amen."
  }
};

// --- API ENDPOINTS ---

// 1. Get reflection for today
app.get("/api/reflections/today", async (req, res) => {
  const customTopic = req.query.topic as string;
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayDayName = daysOfWeek[new Date().getDay()];
  const baseReflection = staticReflections[todayDayName] || staticReflections["default"];

  if (customTopic && ai) {
    try {
      console.log(`Generating a customized reflection using Gemini model for topic: ${customTopic}`);
      const prompt = `You are a warm, traditional, compassionate Catholic theologian and priest. Provide a personal daily reflection based on the user's focus topic: "${customTopic}". 
      Respond in strict JSON format matching this schema:
      {
        "title": "A beautiful, uplifting title",
        "verse": "A highly relevant scripture verse",
        "reference": "The scripture citation (e.g. John 14:27)",
        "reflectionText": "A deeply encouraging, orthodox 3-paragraph Catholic homily/reflection touching on Catholic tradition, saints, or sacramental life. Make it spiritually dense and beautiful.",
        "morningPrayer": "A beautiful short morning prayer of surrender.",
        "eveningPrayer": "A beautiful night prayer or Examen prayer."
      }
      Do not include markdown tags like \`\`\`json or backticks. Only output valid parsable JSON.`;

      const response = await generateContentWithRetry({
        preferredModel: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text ? response.text.trim() : "";
      if (responseText) {
        const jsonResult = JSON.parse(responseText);
        return res.json({
          id: "today-gen",
          date: new Date().toISOString().substring(0, 10),
          ...jsonResult
        });
      }
    } catch (e: any) {
      console.log("Reflections service gracefully initialized static calendar fallback.");
    }
  }

  // Fallback to static reflections based on today's day of week
  return res.json({
    ...baseReflection,
    date: new Date().toISOString().substring(0, 10)
  });
});

// 2. Generate custom morning / evening devotionals as an AI assistant
app.post("/api/generate-devotional", async (req, res) => {
  const { mood, intention, type } = req.body; // type = 'devotional' | 'examen'
  
  if (!ai) {
    // If no API key, generate a high-quality simulated devotional
    const simulatedDevotional = {
      text: `[SIMULATED SACRED RESPONSE]\n\n"Come to me, all you who labor and are burdened, and I will give you rest." (Matthew 11:28)\n\nMy child, as you seek support for your intention: "${intention || "General Peace"}", remember that God's timing is perfect. Walk in his light today. Saint Jude, pray for us.`,
      verse: "Matthew 11:28",
      reference: "The Lord's Comfort",
      simulated: true
    };
    return res.json(simulatedDevotional);
  }

  try {
    const isExamen = type === 'examen';
    const prompt = `You are an encouraging, devout Catholic spiritual director. 
    Write a beautiful Catholic ${isExamen ? 'Evening Examen and prayer' : 'Morning devotional'} designed for someone carrying a mood of "${mood || 'trusting'}" and praying specifically for: "${intention || 'spiritual growth'}". 
    Include:
    1. A relevant Scripture passage with its citation.
    2. A brief, highly compassionate commentary encouraging trust in God and the sacraments.
    3. An inspirational prayer asking for the intercession of a saint suited for this situation (e.g. Saint Jude for hope, Saint Dymphna for peace of mind, Saint Rita for family, Saint Michael for protection, or Saint Joseph for work/strength).
    Keep the tone serene, traditional, deeply faith-affirming, and beautiful. Format it neatly with spacing.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.5-flash",
      contents: prompt,
    });

    return res.json({
      text: response.text || "Your spiritual devotional could not be completed, but God hears your prayers.",
      simulated: false
    });
  } catch (error: any) {
    console.log("Devotional service gracefully loaded simulated daily sacred practice.");
    const simulatedDevotional = {
      text: `[DAILY SACRED PRACTICE]\n\n"Come to me, all you who labor and are burdened, and I will give you rest." (Matthew 11:28)\n\nMy child, as you seek support for your intention: "${intention || "General Peace"}", remember that God's timing is perfect. Walk in his light today. Saint Jude, pray for us.`,
      verse: "Matthew 11:28",
      reference: "The Lord's Comfort",
      simulated: true
    };
    return res.json(simulatedDevotional);
  }
});

// 3. Get all shared prayers from Community Wall
app.get("/api/community-wall", (req, res) => {
  // Sort prayers: newest first
  const sorted = [...communityPrayers].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  res.json(sorted);
});

// 4. Post a new public prayer (anonymous / initials)
app.post("/api/community-wall", (req, res) => {
  const { content, authorName, category } = req.body;

  if (!content || content.trim().length === 0) {
    return res.status(400).json({ error: "Prayer content cannot be empty." });
  }

  const newPrayer: CommunityPrayer = {
    id: String(Date.now()),
    content: content.trim(),
    authorName: (authorName && authorName.trim()) ? authorName.trim() : "Anonymous",
    createdAt: new Date().toISOString(),
    amenCount: 0,
    category: category || "Healing"
  };

  communityPrayers.push(newPrayer);
  savePrayers();

  res.status(201).json(newPrayer);
});

// 5. Increment Amen count of a prayer
app.post("/api/community-wall/:id/amen", (req, res) => {
  const prayerId = req.params.id;
  const prayer = communityPrayers.find(p => p.id === prayerId);

  if (!prayer) {
    return res.status(404).json({ error: "Prayer request not found." });
  }

  prayer.amenCount += 1;
  savePrayers();

  res.json(prayer);
});

// 6. Generate seasonal saint affirmation
app.post("/api/generate-affirmation", async (req, res) => {
  const { season, favoriteSaint } = req.body;
  const validSeasons = ["Ordinary Time", "Lent", "Easter", "Advent", "Christmas"];
  const selectedSeason = (validSeasons.includes(season)) ? season : "Ordinary Time";

  // Handcrafted popular saint fallback affirmations
  const saintFallbacks: Record<string, { quote: string; saintName: string; affirmation: string; contemplation: string }> = {
    "s-peter": {
      quote: "Lord, you know all things; you know that I love you.",
      saintName: "Saint Peter the Apostle",
      affirmation: "Even in moments of doubt or high pressure, I will declare my deep love for Jesus and trust that His grace will rebuild and strengthen my resolve.",
      contemplation: "Saint Peter teaches us that our human flaws do not disqualify us from our sacred purpose. Speak your loving surrender and trust to the Good Shepherd today."
    },
    "s-paul": {
      quote: "I can do all things through Christ who strengthens me.",
      saintName: "Saint Paul the Apostle",
      affirmation: "I will press forward with holy zeal today, confident that Christ's strength is made perfect in my ultimate weakness.",
      contemplation: "Reflect on Saint Paul's boundless energy to proclaim hope. Ask for apostolic fortitude and trust that no obstacle is too great when Christ guides your steps."
    },
    "s-mary": {
      quote: "My soul proclaims the greatness of the Lord; my spirit rejoices in God my Savior.",
      saintName: "Blessed Virgin Mary",
      affirmation: "I offer my positive, joyful 'Fiat' to God's holy path today, allowing Him to work wonders through my humble, quiet heart.",
      contemplation: "Our Lady's absolute obedience is the masterclass in spiritual trust. In quiet composure, offer your daily contributions to God as a pleasing sacrifice of prayer."
    },
    "s-john-baptist": {
      quote: "He must increase, but I must decrease.",
      saintName: "Saint John the Baptist",
      affirmation: "I will humble my pride today, seeking to point others to the Lamb of God so that Christ may shine more brightly through my actions.",
      contemplation: "Saint John dedicated his life to preparing the way. Stepping back from temporal self-glory allows God's loving light to occupy the center stage."
    },
    "s-therese": {
      quote: "My vocation is love! In the heart of the Church, my Mother, I will be love.",
      saintName: "Saint Thérèse of Lisieux",
      affirmation: "I will scatter small details of active love and patience today, walking the 'Little Way' of profound trust and simple surrender.",
      contemplation: "The Little Flower showed us that holiness is found in doing ordinary deeds with supreme supernatural charity. See each minor irritation as a golden intercession."
    },
    "s-francis": {
      quote: "Lord, make me an instrument of your peace.",
      saintName: "Saint Francis of Assisi",
      affirmation: "I choose the path of peace, simple living, and deep reverence for all of God's creation, bringing light where there is darkness.",
      contemplation: "Saint Francis embraced holy simplicity and immediate trust in God's providence. Let go of material anxieties and rest in the abundance of Fatherly love."
    },
    "s-augustine": {
      quote: "You have made us for yourself, O Lord, and our heart is restless until it rests in You.",
      saintName: "Saint Augustine of Hippo",
      affirmation: "I will quiet my restless, wandering thoughts today, seeking my true rest and home only in the merciful embrace of God.",
      contemplation: "Saint Augustine found after many years that God is closer to us than we are to ourselves. Lift your eyes, surrender restlessness, and breathe peace."
    },
    "s-padre-pio": {
      quote: "Pray, hope, and don't worry. Worry is useless. God is merciful and will hear your prayer.",
      saintName: "Saint Padre Pio of Pietrelcina",
      affirmation: "Today, I choose to pray, hope, and refuse to worry, resting in the absolute confidence of God's merciful listening ear.",
      contemplation: "Padre Pio was an ultimate advocate of serene trust. Do not allow tomorrow's unknown to rob you of today's prayerful peace. God runs the future."
    },
    "s-ignatius": {
      quote: "Receive, Lord, all my liberty, my memory, my understanding, and my whole will. All that I have or cherish You have given me.",
      saintName: "Saint Ignatius of Loyola",
      affirmation: "I surrender all my wishes, plans, and liberties to God today, asking only for His love and grace, which is fully sufficient for me.",
      contemplation: "Saint Ignatius designed the Spiritual Exercises to align our wills perfectly with God. Seek to find God in all things and work everything for His greater glory."
    },
    "s-teresa-calcutta": {
      quote: "Do ordinary things with extraordinary love.",
      saintName: "Saint Teresa of Calcutta",
      affirmation: "I will seek God in the small, seemingly mundane moments of this ordinary day, transforming my routine tasks into acts of deep prayer and love.",
      contemplation: "Mother Teresa teaches us that God does not ask of us great deeds, but rather great love in the midst of our normal responsibilities. Let tiny acts shine."
    }
  };

  const defaultFallbacks = {
    "Ordinary Time": {
      quote: "Do ordinary things with extraordinary love.",
      saintName: "Saint Teresa of Calcutta",
      affirmation: "I will seek God in the small, seemingly mundane moments of this ordinary day, transforming my routine tasks into acts of deep prayer and love.",
      contemplation: "God does not ask of us great deeds, but rather great love in the midst of our normal responsibilities. Let the green of this liturgical season remind you of steady, quiet spiritual growth."
    },
    "Lent": {
      quote: "Apart from the cross, there is no other ladder by which we may get to heaven.",
      saintName: "Saint Rose of Lima",
      affirmation: "I will embrace my small daily sacrifices with joy, recognizing that dying to my self-will allows the life of Christ to blossom more fully in my heart.",
      contemplation: "Lent is a period of sweet wilderness. Do not look upon fasting or almsgiving as a burden, but rather as spiritual training to free your heart from attachments that keep you from perfect trust in Our Father."
    },
    "Easter": {
      quote: "We are an Easter people and Alleluia is our song!",
      saintName: "Saint John Paul II",
      affirmation: "I will live today in the light of the Resurrection, refusing to let fear define me, because Christ has conquered death and filled my life with everlasting hope.",
      contemplation: "The Easter season invites us to enter into deep joy. Let any worry fade in the blinding light of the empty tomb. You are loved, redeemed, and called to bear witness to the Risen Lord."
    },
    "Advent": {
      quote: "Make your heart a pristine dwelling where the Infant Jesus may lay His head in silence and absolute peace.",
      saintName: "Saint Padre Pio",
      affirmation: "I will quiet my thoughts today, creating a space of silent anticipation and preparation for the arrival of the Prince of Peace.",
      contemplation: "Advent is a time of longing. Minimize the noise of the world and light the candle of hope in your heart, trusting that Emmanuel is near."
    },
    "Christmas": {
      quote: "Today, Christ is born; today the Savior has appeared; today the Angels sing on earth.",
      saintName: "Saint Augustine",
      affirmation: "I will rejoice in the great mystery of the Incarnation, remembering that God loved the world so deeply that He became a vulnerable child to dwell beside me.",
      contemplation: "The Christmas season is a celebration of divine intimacy. God is not distant; He is Emmanuel, God with us. Lift your eyes and behold the wonder of His humble birth."
    }
  };

  const getFallback = () => {
    if (favoriteSaint) {
      const match = saintFallbacks[favoriteSaint];
      if (match) return match;
      
      // If it is custom name string
      const matchedKey = Object.keys(saintFallbacks).find(k => 
        saintFallbacks[k].saintName.toLowerCase().includes(favoriteSaint.toLowerCase())
      );
      if (matchedKey) return saintFallbacks[matchedKey];

      // Generic customized custom saint fallback if not matching hardcoded list
      return {
        quote: `Trust in the Lord and declare His praise in all your tabernacles.`,
        saintName: favoriteSaint.startsWith("Saint") || favoriteSaint.startsWith("Blessed") ? favoriteSaint : `Saint ${favoriteSaint}`,
        affirmation: `I walk today inspired by the life of ${favoriteSaint}, holding fast to humble service, perfect peace, and sincere faith in all things.`,
        contemplation: `Reflecting on the unique teachings and virtues of ${favoriteSaint} helps us pattern our lives after the Gospel. Carry their saintly perspective into your ordinary duties today.`
      };
    }
    return defaultFallbacks[selectedSeason as keyof typeof defaultFallbacks];
  };

  if (!ai) {
    return res.json({
      ...getFallback(),
      liturgicalSeason: selectedSeason,
      simulated: true
    });
  }

  try {
    let prompt = `You are an encouraging, devout Catholic theologian and spiritual director.
    Generate a beautiful, traditional saint-inspired Quote, Affirmation, and Contemplation based on the liturgical season: "${selectedSeason}".
    The quote must be from a real Catholic saint whose theology or spirituality matches the key themes of this liturgical season.`;

    if (favoriteSaint) {
      prompt = `You are an encouraging, devout Catholic theologian and spiritual director.
      Generate a beautiful, traditional saint-inspired Quote, Affirmation, and Contemplation specifically focused on the spiritual teachings, theological insights, and life of the saint: "${favoriteSaint}".
      If possible or appropriate, harmonize it with the themes of the active liturgical season: "${selectedSeason}".`;
    }

    const finalPrompt = `${prompt}

    Respond in strict JSON format matching this schema:
    {
      "quote": "A beautifully selected quote from this saint (or matching the theme/spirit).",
      "saintName": "Name of the Saint",
      "affirmation": "A highly comforting, personal first-person positive Catholic daily affirmation (e.g., 'I will walk in...', 'Today, I choose to...') tailored to the saint's quote.",
      "contemplation": "A brief, 2-3 sentence spiritual director's contemplation/reflection on how the reader can integrate this saintly wisdom and live out this affirmation in their day-to-day life."
    }
    Do not include markdown tags like \`\`\`json or backticks. Only output valid parsable JSON.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.5-flash",
      contents: finalPrompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response?.text ? response.text.trim() : "";
    if (responseText) {
      const jsonResult = JSON.parse(responseText);
      return res.json({
        ...jsonResult,
        liturgicalSeason: selectedSeason,
        simulated: false
      });
    } else {
      throw new Error("Empty response from Gemini");
    }
  } catch (error: any) {
    if (error && (error.status === "RESOURCE_EXHAUSTED" || error.code === 429 || String(error).includes("429") || String(error).includes("quota"))) {
      console.log("Season affirmation fallback activated (Gemini API rate limit / quota exceeded).");
    } else {
      console.log("Season affirmation fallback activated gracefully:", error?.message || error);
    }
    return res.json({
      ...getFallback(),
      liturgicalSeason: selectedSeason,
      simulated: true
    });
  }
});

// 7. Explore and fetch any Saint's biographical profile dynamically using Gemini
app.get("/api/saints/explore", async (req, res) => {
  const query = req.query.q as string;
  if (!query || query.trim().length === 0) {
    return res.status(400).json({ error: "Saint search query cannot be empty." });
  }

  const cleanQuery = query.trim().replace(/^saint\s+/i, "").replace(/^st\.\s+/i, "");

  // Predefined catalog fallbacks in case AI is offline / key missing
  const offlineSaints = [
    {
      id: "s-peter",
      name: "Saint Peter",
      title: "Prince of the Apostles & First Pope",
      feastDay: "June 29",
      patronage: "Fishermen, Popes, Rome, Net makers",
      era: "1st Century",
      color: "red",
      biography: "A Galilean fisherman chosen by Jesus to be the base rock of His Church. He is the first Pope, martyred upside-down in Rome in 64 AD.",
      virtues: ["Repentance", "Bold Leadership", "Faithfulness"],
      traditionalPrayer: "O Saint Peter, Keybearer of the Kingdom, obtain for us a sincere contrition for our sins and the strength to leave our nets to follow Christ. Amen."
    },
    {
      id: "s-paul",
      name: "Saint Paul",
      title: "Apostle to the Gentiles",
      feastDay: "June 29",
      patronage: "Theologians, Writers, Publishers, Missionaries",
      era: "1st Century",
      color: "red",
      biography: "Formerly Saul of Tarsus, he experienced a blinding conversion on the road to Damascus. He authored 14 letters and founded churches across the Greco-Roman world.",
      virtues: ["Zeal for Souls", "Spiritual Fortitude", "Theological Depth"],
      traditionalPrayer: "O Saint Paul, Apostle of the nations, grant us your fierce zeal to share Christ's message and final perseverance to finish our race in faith. Amen."
    },
    {
      id: "s-jude",
      name: "Saint Jude Thaddeus",
      title: "Patron of Hopeless Causes & Desperate Scenarios",
      feastDay: "October 28",
      patronage: "Desperate situations, Hospitals, Lost causes",
      era: "1st Century",
      color: "red",
      biography: "One of Jesus's Twelve Apostles. He was a relative of Jesus and preached with profound courage. Known globally as a quick refuge for impossible trials.",
      virtues: ["Unshakable Hope", "Merciful Compassion", "Final Perseverance"],
      traditionalPrayer: "Glorious Apostle Saint Jude, intercede for me in my hour of distress. Bring speedy relief and let me experience the grace of the Savior. Amen."
    },
    {
      id: "s-joseph",
      name: "Saint Joseph",
      title: "Chaste Spouse of Mary & Foster-Father of Jesus",
      feastDay: "March 19",
      patronage: "Fathers, Workers, Families, Happy Death",
      era: "1st Century BC - 1st Century AD",
      color: "white",
      biography: "A righteous craftsman of Davidic descent. He listened to angels' warnings, guarding the child Jesus and Mary in complete silent obedience.",
      virtues: ["Silent Vigilance", "Noble Justness", "Sacrificial Labor"],
      traditionalPrayer: "O Blessed Saint Joseph, guardian of the Savior. Guide my daily labors, keep my family safe from discord, and lead us finally to a happy, holy death. Amen."
    },
    {
      id: "s-therese",
      name: "Saint Thérèse of Lisieux",
      title: "The Little Flower & Doctor of the Church",
      feastDay: "October 1",
      patronage: "Missionaries, Florists, Loss of Parents",
      era: "19th Century",
      color: "white",
      biography: "A French Carmelite nun who died at 24. Her 'Little Way' of performing ordinary daily chores with tremendous, burning love has healed and guided millions.",
      virtues: ["Childlike Trust", "Spiritual Simplicity", "Priceless Sacrifices"],
      traditionalPrayer: "O Saint Thérèse, let fall a shower of roses upon my small needs. Grant that I may love Jesus in tiny details and trust His mercy completely. Amen."
    }
  ];

  if (!ai) {
    // If Gemini is not set up, search our offline database for best match
    const match = offlineSaints.find(s => 
      s.name.toLowerCase().includes(cleanQuery.toLowerCase()) || 
      s.patronage.toLowerCase().includes(cleanQuery.toLowerCase())
    );

    if (match) {
      return res.json({ ...match, simulated: true });
    }

    // Default simulated fallback of any requested saint name
    const genericName = query.charAt(0).toUpperCase() + query.slice(1);
    return res.json({
      id: `st-sim-${Date.now()}`,
      name: genericName.startsWith("Saint") ? genericName : `Saint ${genericName}`,
      title: "Holy Confessor and Advocate of Faith",
      feastDay: "October 17",
      patronage: "Seekers, Devotional prayers, Pure of heart",
      era: "Patristic Era",
      color: "white",
      biography: `A dedicated witness of Christ who lived in profound devotion, serving the community with exemplary faith. Known for teaching spiritual endurance, this saint reminds us that a life surrendered to God's providence is never in vain.`,
      virtues: ["Devotion", "Humility", "Quiet Peace"],
      traditionalPrayer: `O Lord, grant us the grace of holy endurance through the intercession of this blessed Saint. May we, inspired by their courage, carry our small daily crosses with love. Amen.`,
      simulated: true
    });
  }

  try {
    const prompt = `You are an expert Catholic hagiographer, theologian, and historian.
    Generate an authentic, highly detailed biographical and patronage profile for the saint: "${query}".
    
    The details must be fully orthodox and accurate to Catholic tradition and historical records.
    Choose a liturgical color most fitting for this saint (e.g. "red" for martyrs/apostles, "white" for pastors/virgins/confessors, "blue" for Mary/Marian themes, "violet" for penitents, "rose" for joy, "green" for ordinary times).

    Respond in strict JSON format matching this schema:
    {
      "name": "Full name of the saint (with 'Saint' prefix, e.g. 'Saint Francis of Assisi')",
      "title": "A beautiful traditional title (e.g. 'Founder of the Franciscan Order & Mirror of Christ')",
      "feastDay": "The official Catholic feast day (e.g. 'October 4')",
      "patronage": "What this saint is the patron saint of (e.g. 'Animals, Ecology, Merchants, Italy')",
      "era": "The historical era or century (e.g. '13th Century' or '1181 - 1226 AD')",
      "color": "Choose exactly one from: 'white', 'red', 'green', 'violet', 'rose', 'blue'",
      "biography": "A beautifully written, highly accurate 4-5 sentence biography focusing on their conversion, holy encounters or miraculous life, their specific teachings, and their holy death. Make it deeply inspiring.",
      "virtues": ["Three core virtues e.g. 'Radical Poverty', 'Love of Creation', 'Inward Calmness'"],
      "traditionalPrayer": "A beautiful, heartfelt traditional or custom intercessory prayer specifically to this saint seeking their spiritual aid and guidance in our intentions."
    }
    Do not include markdown tags like \`\`\`json or backticks. Only output valid parsable JSON.`;

    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const responseText = response?.text ? response.text.trim() : "";
    if (responseText) {
      const jsonResult = JSON.parse(responseText);
      return res.json({
        id: `st-gen-${Date.now()}`,
        ...jsonResult,
        simulated: false
      });
    } else {
      throw new Error("Empty hagiography from Gemini");
    }
  } catch (err: any) {
    if (err && (err.status === "RESOURCE_EXHAUSTED" || err.code === 429 || String(err).includes("429") || String(err).includes("quota"))) {
      console.log("Saint exploration fallback activated (Gemini API rate limit / quota exceeded).");
    } else {
      console.log("Saint exploration fallback activated gracefully:", err?.message || err);
    }
    // Fallback to offline matching
    const match = offlineSaints.find(s => 
      s.name.toLowerCase().includes(cleanQuery.toLowerCase()) || 
      s.patronage.toLowerCase().includes(cleanQuery.toLowerCase())
    );

    if (match) {
      return res.json({ ...match, simulated: true });
    }

    const genericName = query.charAt(0).toUpperCase() + query.slice(1);
    return res.json({
      id: `st-sim-err-${Date.now()}`,
      name: genericName.startsWith("Saint") ? genericName : `Saint ${genericName}`,
      title: "Devout Advocate of the Sacred Word",
      feastDay: "November 14",
      patronage: "Patience under trial, Inner stillness",
      era: "Early Church",
      color: "white",
      biography: `A quiet disciple who offered a life of contemplation and charitable service to neighbors, inspiring our parish through severe patience. This saint lived in holy surrender, teaching that our prayers are heard when they are whispered with trust.`,
      virtues: ["Patience", "Inner Prayer", "Grace"],
      traditionalPrayer: `O Holy Advocate in heaven, pray for us that we may grow in quiet patience and seek the face of Christ in our daily trials. Amen.`,
      simulated: true
    });
  }
});

// Serve frontend assets
// In production, Vite builds static client into '/dist'
// We serve standard client paths
if (process.env.NODE_ENV !== "production") {
  const startVite = async () => {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  };
  startVite();
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// Start Server bound on 0.0.0.0 and port 3000
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Heavenly server booting on http://0.0.0.0:${PORT}`);
});
