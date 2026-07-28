/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Catholic Prayer App — Hallow-inspired redesign
 * All original state, logic, and handlers preserved.
 * Complete UI redesign: warm dark amber, bottom nav, mobile-first.
 */
import React, { useState, useEffect, useRef } from "react";
import { SplashScreen } from "./components/SplashScreen";
import { SkeletonCard } from "./components/SkeletonCard";
import {
  Flame, BookOpen, Heart, Compass, Calendar, Moon, Sun, Bell,
  Send, Plus, Trash, Check, Sparkles, RefreshCw, Info,
  CheckCircle, ChevronRight, ChevronDown, BookMarked, UserCheck,
  ShieldAlert, WifiOff, Wifi, Award, ClipboardCheck, Edit, X,
  Volume2, VolumeX, Filter, Sliders, Play, Pause, SkipBack,
  SkipForward, Home, Search, User, Music
} from "lucide-react";
import { AudioRosary } from "./components/AudioRosary";
import { SpeechToTextButton } from "./components/SpeechToTextButton";
import { FEAST_DAYS, TRADITIONAL_PRAYERS, NOVENAS, SCRIPTURE_READINGS, TraditionalPrayer } from "./data/liturgy";
import { PersonalIntention, CommunityPrayer, Novena, ScriptureReading, UserStats, DailyReflection, LiturgicalSeason } from "./types";
import { AuthOverlay } from "./components/AuthOverlay";
import { RoutinesTab } from "./components/RoutinesTab";
import { TrendingTab } from "./components/TrendingTab";
import { SleepStoriesTab } from "./components/SleepStoriesTab";
import BibleFlashcardsTab from "./components/BibleFlashcardsTab";
import SaintsCatalogTab from "./components/SaintsCatalogTab";
import { LITURGICAL_SAINTS } from "./data/saints";
import { ConfessionPrepTab } from "./components/ConfessionPrepTab";
import { CathedralSoundscape } from "./components/CathedralSoundscape";
import { motion, AnimatePresence } from "motion/react";

/* ─── Cross icon ───────────────────────────────────────────────────────────── */
const CrossIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M12 2v20M7 8h10" />
  </svg>
);

/* ─── Encouraging verses for focus mode ────────────────────────────────────── */
const ENCOURAGING_VERSES = [
  { text: "Fear not, for I am with you; be not dismayed, for I am your God.", reference: "Isaiah 41:10" },
  { text: "Come to me, all who labor and are heavy laden, and I will give you rest.", reference: "Matthew 11:28" },
  { text: "The Lord is my shepherd; there is nothing I lack.", reference: "Psalm 23:1" },
  { text: "Cast all your anxiety on him because he cares for you.", reference: "1 Peter 5:7" },
  { text: "Peace I leave with you; my peace I give to you.", reference: "John 14:27" },
  { text: "I can do all things through him who strengthens me.", reference: "Philippians 4:13" },
  { text: "For I know the plans I have for you, plans for welfare and not for evil.", reference: "Jeremiah 29:11" },
  { text: "God is our refuge and strength, a very present help in trouble.", reference: "Psalm 46:1" },
  { text: "But they who wait for the Lord shall renew their strength.", reference: "Isaiah 40:31" },
  { text: "We know that for those who love God all things work together for good.", reference: "Romans 8:28" },
];

/* ─── Intention categories ──────────────────────────────────────────────────── */
export const INTENTION_CATEGORIES = [
  { id: "penance",      name: "Penance & Repentance",  color: "violet",  badge: "bg-violet-500/10 text-violet-300 border border-violet-500/20", hex: "#9060d0" },
  { id: "thanksgiving", name: "Thanksgiving & Joy",    color: "gold",    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20",   hex: "#c9922a" },
  { id: "hope",         name: "Hope & Discernment",    color: "rose",    badge: "bg-rose-500/10 text-rose-400 border border-rose-500/20",      hex: "#e06090" },
  { id: "healing",      name: "Healing & Growth",      color: "green",   badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20", hex: "#50b870" },
  { id: "sacrifice",    name: "Sacrifice & Strength",  color: "red",     badge: "bg-red-500/10 text-red-400 border border-red-500/20",         hex: "#e05050" },
  { id: "purity",       name: "Purity & Grace",        color: "white",   badge: "bg-stone-500/10 text-stone-300 border border-stone-500/20",   hex: "#b0a890" },
  { id: "blue",         name: "Peace & Surrender",     color: "blue",    badge: "bg-blue-500/10 text-blue-400 border border-blue-500/20",      hex: "#5090e0" },
];

export const getCategoryConfig = (categoryId?: string) => {
  return INTENTION_CATEGORIES.find(c => c.id === categoryId) || INTENTION_CATEGORIES[3];
};

/* ════════════════════════════════════════════════════════════════════════════ */
/*  APP COMPONENT                                                               */
/* ════════════════════════════════════════════════════════════════════════════ */
export default function App() {

  /* ── Main tab (Hallow-style 5-tab bottom nav) ─────────────────────────── */
  type MainTab = "today" | "pray" | "bible" | "sleep" | "more";
  const [mainTab, setMainTab] = useState<MainTab>("today");

  /* ── Sub-tabs ─────────────────────────────────────────────────────────── */
  const [praySubTab, setPraySubTab] = useState<"rosary" | "novenas" | "intentions" | "wall" | "confession">("rosary");
  const [bibleSubTab, setBibleSubTab] = useState<"reflections" | "calendar" | "flashcards">("reflections");
  const [moreSubTab, setMoreSubTab] = useState<"saints" | "routines" | "trending" | "profile">("profile");

  /* ── Splash ───────────────────────────────────────────────────────────── */
  const [splashDone, setSplashDone] = useState(() =>
    sessionStorage.getItem("splashShown") === "true"
  );

  /* ── Auth ─────────────────────────────────────────────────────────────── */
  const [user, setUser] = useState<{ name: string; email?: string; isGuest: boolean } | null>(() => {
    const s = localStorage.getItem("sanctuary_user");
    return s ? JSON.parse(s) : null;
  });

  /* ── Appearance ───────────────────────────────────────────────────────── */
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  /* ── Reflection ───────────────────────────────────────────────────────── */
  const [reflectionFocus, setReflectionFocus] = useState("");
  const [isLoadingReflection, setIsLoadingReflection] = useState(false);
  const [todayReflection, setTodayReflection] = useState<DailyReflection | null>(null);

  /* ── Affirmation ──────────────────────────────────────────────────────── */
  const [selectedAffirmationSeason, setSelectedAffirmationSeason] = useState<LiturgicalSeason>("Ordinary Time");
  const [affirmationData, setAffirmationData] = useState<{
    quote: string; saintName: string; affirmation: string;
    contemplation: string; liturgicalSeason: LiturgicalSeason; simulated?: boolean;
  } | null>(() => {
    const s = localStorage.getItem("sanctuary_affirmation_data");
    return s ? JSON.parse(s) : null;
  });
  const [isGeneratingAffirmation, setIsGeneratingAffirmation] = useState(false);

  /* ── Profile ──────────────────────────────────────────────────────────── */
  const [favoriteSaint, setFavoriteSaint] = useState(() =>
    localStorage.getItem("sanctuary_favorite_saint") || "s-teresa-calcutta"
  );
  const [profileName, setProfileName] = useState(() =>
    localStorage.getItem("sanctuary_profile_name") || "Faithful Pilgrim"
  );
  const [favoriteSaintCustomText, setFavoriteSaintCustomText] = useState(() =>
    localStorage.getItem("sanctuary_favorite_saint_custom") || ""
  );
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isBioOpen, setIsBioOpen] = useState(false);
  const [tempProfileName, setTempProfileName] = useState("");
  const [tempFavoriteSaint, setTempFavoriteSaint] = useState("");
  const [tempFavoriteSaintCustomText, setTempFavoriteSaintCustomText] = useState("");
  const [tempFontSize, setTempFontSize] = useState(16);
  const [saintsSearchQuery, setSaintsSearchQuery] = useState("");

  /* ── Devotional generator ─────────────────────────────────────────────── */
  const [devotionalMood, setDevotionalMood] = useState("trusting");
  const [devotionalIntention, setDevotionalIntention] = useState("");
  const [generatedDevotional, setGeneratedDevotional] = useState<{ text: string; simulated?: boolean } | null>(null);
  const [isGeneratingDevotional, setIsGeneratingDevotional] = useState(false);

  /* ── Intentions ───────────────────────────────────────────────────────── */
  const [personalIntentions, setPersonalIntentions] = useState<PersonalIntention[]>([]);
  const [newIntentionTitle, setNewIntentionTitle] = useState("");
  const [newIntentionDesc, setNewIntentionDesc] = useState("");
  const [newIntentionCategory, setNewIntentionCategory] = useState("healing");
  const [newIntentionTime, setNewIntentionTime] = useState("08:00");
  const [newIntentionReminder, setNewIntentionReminder] = useState(true);
  const [shareNewWithWall, setShareNewWithWall] = useState(false);
  const [selectedIntentionIdForNotes, setSelectedIntentionIdForNotes] = useState<string | null>(null);
  const [intentionNoteText, setIntentionNoteText] = useState("");
  const [votiveDetailId, setVotiveDetailId] = useState<string | null>(null);
  const [votiveFilter, setVotiveFilter] = useState("all");

  /* ── Novenas ──────────────────────────────────────────────────────────── */
  const [activeNovenas, setActiveNovenas] = useState<Novena[]>([]);
  const [selectedNovenaId, setSelectedNovenaId] = useState<string | null>(null);

  /* ── Scripture ────────────────────────────────────────────────────────── */
  const [scriptures, setScriptures] = useState<ScriptureReading[]>([]);
  const [selectedScriptureIdx, setSelectedScriptureIdx] = useState(0);

  /* ── Community wall ───────────────────────────────────────────────────── */
  const [communityPrayers, setCommunityPrayers] = useState<CommunityPrayer[]>([]);
  const [newWallContent, setNewWallContent] = useState("");
  const [newWallAuthor, setNewWallAuthor] = useState("");
  const [newWallCategory, setNewWallCategory] = useState<CommunityPrayer["category"]>("Healing");
  const [isLoadingWall, setIsLoadingWall] = useState(false);

  /* ── Stats ────────────────────────────────────────────────────────────── */
  const [stats, setStats] = useState<UserStats>({
    streak: 3,
    lastPrayerDate: new Date(Date.now() - 86400000).toISOString().substring(0, 10),
    totalPrayersCount: 14,
    completedScripturesCount: 2,
  });

  /* ── Font size ────────────────────────────────────────────────────────── */
  const [appFontSize, setAppFontSize] = useState(() => {
    const s = localStorage.getItem("sanctuary_font_size");
    return s ? parseInt(s, 10) : 16;
  });

  /* ── Notifications ────────────────────────────────────────────────────── */
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [simulatedNotifications, setSimulatedNotifications] = useState<{ id: string; msg: string; time: string }[]>([]);
  const [selectedFeastId, setSelectedFeastId] = useState(FEAST_DAYS[0]?.id || "");
  const [searchPrayerQuery, setSearchPrayerQuery] = useState("");

  /* ── Focus mode ───────────────────────────────────────────────────────── */
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [focusBackground, setFocusBackground] = useState<"golden" | "stained_glass" | "twilight">("golden");
  const [isCathedralSoundActive, setIsCathedralSoundActive] = useState(false);
  const cathedralSoundRef = useRef<CathedralSoundscape | null>(null);

  /* ── Scripture overlay ────────────────────────────────────────────────── */
  const [isScriptureOverlayActive, setIsScriptureOverlayActive] = useState(false);
  const [currentVerseIdx, setCurrentVerseIdx] = useState(0);
  const [isVerseVisible, setIsVerseVisible] = useState(true);

  /* ── Audio player (simulated) ─────────────────────────────────────────── */
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerProgress, setPlayerProgress] = useState(0);

  /* ════════════════════════════════════════════════════════════════════════ */
  /*  EFFECTS                                                                 */
  /* ════════════════════════════════════════════════════════════════════════ */

  useEffect(() => {
    localStorage.setItem("sanctuary_favorite_saint", favoriteSaint);
  }, [favoriteSaint]);

  useEffect(() => {
    localStorage.setItem("sanctuary_profile_name", profileName);
  }, [profileName]);

  useEffect(() => {
    localStorage.setItem("sanctuary_favorite_saint_custom", favoriteSaintCustomText);
  }, [favoriteSaintCustomText]);

  useEffect(() => {
    document.documentElement.style.fontSize = `${appFontSize}px`;
    localStorage.setItem("sanctuary_font_size", appFontSize.toString());
  }, [appFontSize]);

  useEffect(() => {
    if (!isFocusMode) {
      if (isCathedralSoundActive) setIsCathedralSoundActive(false);
      if (isScriptureOverlayActive) setIsScriptureOverlayActive(false);
    }
  }, [isFocusMode]);

  useEffect(() => {
    if (isScriptureOverlayActive) {
      setCurrentVerseIdx(Math.floor(Math.random() * ENCOURAGING_VERSES.length));
      setIsVerseVisible(true);
      const interval = setInterval(() => {
        setIsVerseVisible(false);
        setTimeout(() => {
          setCurrentVerseIdx(prev => (prev + 1) % ENCOURAGING_VERSES.length);
          setIsVerseVisible(true);
        }, 1500);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isScriptureOverlayActive]);

  useEffect(() => {
    if (isCathedralSoundActive) {
      if (!cathedralSoundRef.current) cathedralSoundRef.current = new CathedralSoundscape();
      cathedralSoundRef.current.start();
    } else {
      cathedralSoundRef.current?.stop();
    }
  }, [isCathedralSoundActive]);

  useEffect(() => {
    return () => { cathedralSoundRef.current?.stop(); };
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setIsFocusMode(false); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("catholic_scriptures");
    setScriptures(stored ? JSON.parse(stored) : [...SCRIPTURE_READINGS]);

    const storedInts = localStorage.getItem("catholic_intentions");
    if (storedInts) {
      setPersonalIntentions(JSON.parse(storedInts));
    } else {
      const init: PersonalIntention[] = [
        { id: "int-1", title: "For grandad's arthritis relief", description: "Praying for strength and smooth doctor visits.", createdAt: new Date(Date.now() - 172800000).toISOString(), answered: false, reminderEnabled: true, reminderTime: "08:15", sharedToWall: false, notes: "Felt better Thursday.", category: "healing" },
        { id: "int-2", title: "Finding peace with my career pivot", description: "Asking for clarity during discernment.", createdAt: new Date().toISOString(), answered: true, reminderEnabled: false, sharedToWall: false, notes: "Received job offer! Answered.", category: "blue" },
      ];
      setPersonalIntentions(init);
      localStorage.setItem("catholic_intentions", JSON.stringify(init));
    }

    const storedNov = localStorage.getItem("catholic_novenas");
    setActiveNovenas(storedNov ? JSON.parse(storedNov) : [...NOVENAS]);

    const storedStats = localStorage.getItem("catholic_stats");
    if (storedStats) setStats(JSON.parse(storedStats));
  }, []);

  useEffect(() => {
    fetchTodayReflection();
    fetchWallPrayers();
  }, [isOfflineMode]);

  useEffect(() => {
    const season = getAutoLiturgicalSeason();
    setSelectedAffirmationSeason(season);
    const saved = localStorage.getItem("sanctuary_affirmation_data");
    if (!saved) fetchAffirmation(season);
  }, [favoriteSaint]);

  /* ─── Simulated player progress ──────────────────────────────────────── */
  useEffect(() => {
    if (!isPlaying) return;
    const iv = setInterval(() => {
      setPlayerProgress(p => {
        if (p >= 100) { setIsPlaying(false); return 0; }
        return p + 0.5;
      });
    }, 200);
    return () => clearInterval(iv);
  }, [isPlaying]);

  /* ════════════════════════════════════════════════════════════════════════ */
  /*  HELPERS                                                                 */
  /* ════════════════════════════════════════════════════════════════════════ */

  const getAutoLiturgicalSeason = (): LiturgicalSeason => {
    const d = new Date(), m = d.getMonth(), day = d.getDate();
    if ((m === 11 && day >= 25) || (m === 0 && day <= 11)) return "Christmas";
    if (m === 11 || (m === 10 && day >= 29)) return "Advent";
    if ((m === 1 && day >= 18) || m === 2 || (m === 3 && day <= 4)) return "Lent";
    if ((m === 3 && day >= 5) || (m === 4 && day <= 24)) return "Easter";
    return "Ordinary Time";
  };

  const triggerChime = () => {
    try {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.connect(gain); gain.connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 1.3);
    } catch {}
  };

  const formatProgress = (p: number) => {
    const total = 480; // 8 min in seconds
    const elapsed = Math.floor((p / 100) * total);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getSaintDisplayName = () => {
    if (favoriteSaint === "custom") return favoriteSaintCustomText || "Custom Saint";
    const map: Record<string, string> = {
      "s-peter": "Saint Peter", "s-paul": "Saint Paul", "s-mary": "Blessed Virgin Mary",
      "s-john-baptist": "Saint John the Baptist", "s-therese": "Saint Thérèse of Lisieux",
      "s-francis": "Saint Francis", "s-augustine": "Saint Augustine",
      "s-padre-pio": "Saint Padre Pio", "s-ignatius": "Saint Ignatius of Loyola",
      "s-teresa-calcutta": "Saint Teresa of Calcutta",
    };
    return map[favoriteSaint] || "Saint Teresa of Calcutta";
  };

  /* ════════════════════════════════════════════════════════════════════════ */
  /*  API CALLS                                                               */
  /* ════════════════════════════════════════════════════════════════════════ */

  const fetchTodayReflection = async (topic = "") => {
    setIsLoadingReflection(true);
    try {
      const url = topic ? `/api/reflections/today?topic=${encodeURIComponent(topic)}` : "/api/reflections/today";
      const data = await fetch(url).then(r => r.json());
      setTodayReflection(data);
    } catch {
      setTodayReflection({
        id: "offline", date: new Date().toISOString().substring(0, 10),
        title: "Peace Be Still",
        verse: "Cast all your anxiety on him because he cares for you.",
        reference: "1 Peter 5:7",
        reflectionText: "When the demands of daily life become overwhelming, we are invited to enter into inner quiet. God speaks in the silence, not in the storm.",
        morningPrayer: "Lord Jesus, I entrust my day into Your hands. Keep me from distractions and feed my soul. Amen.",
        eveningPrayer: "Eternal Father, I thank You for Your protection tonight. Heal my heart and guide my thoughts. Amen.",
      });
    } finally { setIsLoadingReflection(false); }
  };

  const fetchWallPrayers = async () => {
    if (isOfflineMode) return;
    setIsLoadingWall(true);
    try {
      const data = await fetch("/api/community-wall").then(r => r.json());
      setCommunityPrayers(data);
    } catch {} finally { setIsLoadingWall(false); }
  };

  const fetchAffirmation = async (season: LiturgicalSeason) => {
    setIsGeneratingAffirmation(true);
    try {
      const saint = favoriteSaint === "custom" ? favoriteSaintCustomText : favoriteSaint;
      const data = await fetch("/api/generate-affirmation", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season, favoriteSaint: saint }),
      }).then(r => r.json());
      setAffirmationData(data);
      localStorage.setItem("sanctuary_affirmation_data", JSON.stringify(data));
    } catch {} finally { setIsGeneratingAffirmation(false); }
  };

  const generateDevotional = async () => {
    setIsGeneratingDevotional(true);
    setGeneratedDevotional(null);
    try {
      const data = await fetch("/api/generate-devotional", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood: devotionalMood, intention: devotionalIntention }),
      }).then(r => r.json());
      setGeneratedDevotional({ text: data.text, simulated: data.simulated });
      incrementPrayerStats();
    } catch {
      setGeneratedDevotional({ text: "Unable to connect to the server. Here is a peaceful fallback:\n\n\"Lord, grant me the serenity to accept what I cannot change, courage to change what I can, and wisdom to know the difference.\"" });
    } finally { setIsGeneratingDevotional(false); }
  };

  /* ════════════════════════════════════════════════════════════════════════ */
  /*  ACTIONS / HANDLERS                                                      */
  /* ════════════════════════════════════════════════════════════════════════ */

  const incrementPrayerStats = () => {
    const today = new Date().toISOString().substring(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().substring(0, 10);
    const u = { ...stats, totalPrayersCount: stats.totalPrayersCount + 1 };
    if (stats.lastPrayerDate !== today) {
      u.streak = stats.lastPrayerDate === yesterday ? stats.streak + 1 : 1;
      u.lastPrayerDate = today;
    }
    setStats(u);
    localStorage.setItem("catholic_stats", JSON.stringify(u));
  };

  const saveIntentions = (updated: PersonalIntention[]) => {
    setPersonalIntentions(updated);
    localStorage.setItem("catholic_intentions", JSON.stringify(updated));
  };

  const saveNovenas = (updated: Novena[]) => {
    setActiveNovenas(updated);
    localStorage.setItem("catholic_novenas", JSON.stringify(updated));
  };

  const saveScriptures = (updated: ScriptureReading[]) => {
    setScriptures(updated);
    localStorage.setItem("catholic_scriptures", JSON.stringify(updated));
  };

  const handleAddIntention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntentionTitle.trim()) return;
    const newInt: PersonalIntention = {
      id: "int-" + Date.now(), title: newIntentionTitle.trim(),
      description: newIntentionDesc.trim(), createdAt: new Date().toISOString(),
      answered: false, reminderEnabled: newIntentionReminder,
      reminderTime: newIntentionReminder ? newIntentionTime : undefined,
      sharedToWall: shareNewWithWall, category: newIntentionCategory,
    };
    saveIntentions([newInt, ...personalIntentions]);
    if (shareNewWithWall && !isOfflineMode) {
      try {
        await fetch("/api/community-wall", { method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content: `${newInt.title}: ${newInt.description}`, authorName: "Anonymous", category: "Intentions" }) });
        fetchWallPrayers();
      } catch {}
    }
    setNewIntentionTitle(""); setNewIntentionDesc(""); setNewIntentionCategory("healing"); setShareNewWithWall(false);
    incrementPrayerStats();
  };

  const handleMarkAnswered = (id: string) => {
    const updated = personalIntentions.map(i => i.id === id ? { ...i, answered: !i.answered } : i);
    saveIntentions(updated);
    if (updated.find(i => i.id === id)?.answered) triggerChime();
  };

  const handleDeleteIntention = (id: string) => saveIntentions(personalIntentions.filter(i => i.id !== id));

  const handleAddNote = (id: string) => {
    if (!intentionNoteText.trim()) return;
    saveIntentions(personalIntentions.map(i => i.id === id ? { ...i, notes: intentionNoteText.trim() } : i));
    setIntentionNoteText(""); setSelectedIntentionIdForNotes(null);
  };

  const handleToggleScripture = (id: string) => {
    const updated = scriptures.map(s => s.id === id ? { ...s, completed: !s.completed } : s);
    saveScriptures(updated);
    const count = updated.filter(s => s.completed).length;
    const u = { ...stats, completedScripturesCount: count, lastReadDate: new Date().toISOString().substring(0, 10) };
    setStats(u); localStorage.setItem("catholic_stats", JSON.stringify(u));
    incrementPrayerStats();
  };

  const handleStartNovena = (id: string) => {
    saveNovenas(activeNovenas.map(n => n.id === id ? { ...n, currentDay: 1, completedDays: [] } : n));
    setSelectedNovenaId(id);
  };

  const handleCompleteNovenaDay = (id: string, day: number) => {
    saveNovenas(activeNovenas.map(n => {
      if (n.id !== id) return n;
      const completed = n.completedDays.includes(day) ? n.completedDays : [...n.completedDays, day];
      const nextDay = day === n.currentDay ? Math.min(9, n.currentDay + 1) : n.currentDay;
      return { ...n, completedDays: completed, currentDay: nextDay };
    }));
    incrementPrayerStats(); triggerChime();
  };

  const handleResetNovena = (id: string) =>
    saveNovenas(activeNovenas.map(n => n.id === id ? { ...n, currentDay: 0, completedDays: [] } : n));

  const handlePostToWall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWallContent.trim()) return;
    if (isOfflineMode) {
      setCommunityPrayers(prev => [{ id: "off-" + Date.now(), content: newWallContent.trim(), authorName: newWallAuthor.trim() || "Anonymous", createdAt: new Date().toISOString(), amenCount: 1, category: newWallCategory }, ...prev]);
      setNewWallContent(""); setNewWallAuthor(""); return;
    }
    try {
      await fetch("/api/community-wall", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newWallContent.trim(), authorName: newWallAuthor.trim() || "Anonymous", category: newWallCategory }) });
      setNewWallContent(""); setNewWallAuthor(""); fetchWallPrayers(); incrementPrayerStats();
    } catch {}
  };

  const handleAmen = async (id: string) => {
    setCommunityPrayers(prev => prev.map(p => p.id === id ? { ...p, amenCount: p.amenCount + 1 } : p));
    if (!isOfflineMode) {
      try { await fetch(`/api/community-wall/${id}/amen`, { method: "POST" }); triggerChime(); } catch {}
    }
    incrementPrayerStats();
  };

  const filteredPrayers = TRADITIONAL_PRAYERS.filter(p =>
    p.title.toLowerCase().includes(searchPrayerQuery.toLowerCase()) ||
    p.text.toLowerCase().includes(searchPrayerQuery.toLowerCase())
  );

  /* ════════════════════════════════════════════════════════════════════════ */
  /*  EARLY RETURNS                                                           */
  /* ════════════════════════════════════════════════════════════════════════ */

  if (!splashDone) {
    return <SplashScreen onComplete={() => { sessionStorage.setItem("splashShown", "true"); setSplashDone(true); }} />;
  }

  /* ════════════════════════════════════════════════════════════════════════ */
  /*  FOCUS MODE SCREEN                                                       */
  /* ════════════════════════════════════════════════════════════════════════ */
  if (isFocusMode) {
    return (
      <div className="focus-overlay">
        <div className="focus-glow-1" />
        <div className="focus-glow-2" />

        {/* Focus header */}
        <div className="relative z-10 flex items-center justify-between px-4 py-3 border-b border-[#1e1a10] bg-black/40 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1e1405] border border-[#3d2808] rounded-lg flex items-center justify-center">
              <CrossIcon className="w-4 h-4 text-[#c9922a]" />
            </div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#c9922a]">Sanctuary Focus</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setIsCathedralSoundActive(!isCathedralSoundActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold border cursor-pointer ${isCathedralSoundActive ? "bg-[#c9922a]/20 border-[#c9922a]/40 text-[#c9922a]" : "bg-black/30 border-[#1e1a10] text-[#4a3318]"}`}>
              {isCathedralSoundActive ? <Volume2 className="w-3 h-3" /> : <VolumeX className="w-3 h-3" />}
              <span>Chants</span>
            </button>
            <button onClick={() => setIsFocusMode(false)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#c9922a]/10 border border-[#3d2808] text-[#c9922a] text-[10px] font-bold cursor-pointer">
              Exit [Esc]
            </button>
          </div>
        </div>

        {/* Focus content */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 bg-[#1e1405] border border-[#3d2808] rounded-full flex items-center justify-center mb-6">
            <CrossIcon className="w-7 h-7 text-[#c9922a]" />
          </div>
          {isScriptureOverlayActive ? (
            <AnimatePresence mode="wait">
              {isVerseVisible && (
                <motion.div key={currentVerseIdx} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 1.4, ease: "easeInOut" }}
                  className="max-w-sm">
                  <p className="verse-text text-[#c9b888] text-lg leading-relaxed mb-3">
                    "{ENCOURAGING_VERSES[currentVerseIdx].text}"
                  </p>
                  <p className="text-[11px] font-bold text-[#c9922a] tracking-widest uppercase">
                    — {ENCOURAGING_VERSES[currentVerseIdx].reference}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            <div className="max-w-sm">
              <p className="text-[#6b5a30] text-sm leading-relaxed">Enter quiet. Be still and know that He is God.</p>
              <p className="text-[11px] font-bold text-[#4a3318] tracking-widest uppercase mt-3">— Psalm 46:10</p>
            </div>
          )}
          <button onClick={() => setIsScriptureOverlayActive(!isScriptureOverlayActive)}
            className="mt-8 flex items-center gap-2 px-4 py-2 rounded-full border border-[#2a1e08] text-[11px] font-bold text-[#8a6a30] cursor-pointer">
            <BookOpen className="w-3.5 h-3.5" />
            {isScriptureOverlayActive ? "Hide Scripture" : "Show Scripture"}
          </button>
        </div>
      </div>
    );
  }

  /* ════════════════════════════════════════════════════════════════════════ */
  /*  MAIN RENDER                                                             */
  /* ════════════════════════════════════════════════════════════════════════ */
  return (
    <div className="hallow-app">
      {/* Auth gate */}
      {!user && <AuthOverlay onSuccess={(u) => setUser(u)} />}

      {/* Main scrollable content */}
      <main className="hallow-content" key={mainTab}>

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  TODAY TAB                                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {mainTab === "today" && (
          <div className="tab-panel">

            {/* Hero */}
            <div className="hallow-hero">
              <div className="hallow-hero-tag">
                <Sun className="w-3.5 h-3.5" />
                {(() => {
                  const h = new Date().getHours();
                  return h < 12 ? "Good Morning" : h < 17 ? "Good Afternoon" : "Good Evening";
                })()}
              </div>
              <div className="text-[11px] text-[#6b5a30] mb-2 font-medium">
                {new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · {getAutoLiturgicalSeason()}
              </div>
              <div className="hallow-hero-title">
                {isLoadingReflection ? "Loading today's prayer..." : todayReflection?.title || "Sunday of the Resurrection"}
              </div>
              <div className="hallow-hero-sub">
                Begin your day with scripture, prayer, and quiet time with God.
              </div>
              <div className="flex gap-3 items-center">
                <button className="hallow-play-btn" onClick={() => { setIsPlaying(true); setMainTab("pray"); setPraySubTab("rosary"); triggerChime(); }}>
                  <Play className="w-4 h-4 fill-current" />
                 {new Date().getHours() < 12 ? "Begin Morning Prayer" : new Date().getHours() < 17 ? "Begin Afternoon Prayer" : "Begin Evening Prayer"}
                </button>
                <button className="hallow-play-btn ghost" onClick={() => setIsFocusMode(true)}>
                  Focus Mode
                </button>
              </div>
              <div className="flex gap-4 mt-4 pt-4 border-t border-[#1e1a10]">
                <div className="flex items-center gap-1.5 text-[10px] text-[#5a4018]">
                  <BookOpen className="w-3.5 h-3.5 text-[#8a6a30]" /> Scripture
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#5a4018]">
                  <Music className="w-3.5 h-3.5 text-[#8a6a30]" /> Gregorian Chant
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-[#5a4018]">
                  <UserCheck className="w-3.5 h-3.5 text-[#8a6a30]" /> {communityPrayers.length}+ praying
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="streak-bar mx-4 mb-4">
              <div className="text-2xl">🕯</div>
              <div>
                <div className="text-[15px] font-bold text-[#f5ead8]">{stats.streak} Day Streak</div>
                <div className="text-[10px] text-[#5a4018] mt-0.5">Keep your covenant flame burning</div>
              </div>
              <div className="streak-dots ml-auto">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className={`streak-dot ${i < stats.streak - 1 ? "done" : i === stats.streak - 1 ? "today" : ""}`} />
                ))}
              </div>
            </div>

            {/* Today's scripture card */}
            <div className="mx-4 mb-4">
              <div className="hallow-card warm">
                <div className="hallow-card-label"><BookOpen className="w-3 h-3" /> Today's Scripture</div>
                {isLoadingReflection ? (
                  <SkeletonCard rows={3} showTitle={false} />
                ) : (
                  <>
                    <blockquote className="verse-text border-l-2 border-[#c9922a] pl-3 mb-2">
                      "{todayReflection?.verse}"
                    </blockquote>
                    <cite className="text-[10px] font-bold text-[#c9922a] tracking-widest uppercase not-italic">
                      — {todayReflection?.reference}
                    </cite>
                    <p className="prayer-text text-[11px] mt-3 text-[#6b5a30] line-clamp-3">
                      {todayReflection?.reflectionText}
                    </p>
                    <button className="mt-3 text-[10px] font-bold text-[#c9922a] tracking-wide flex items-center gap-1 cursor-pointer bg-none border-none"
                      onClick={() => { setMainTab("bible"); setBibleSubTab("reflections"); }}>
                      Read full reflection <ChevronRight className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Continue Praying */}
            <div className="section-hdr">
              <div className="section-hdr-title">Continue Praying</div>
              <div className="section-hdr-see" onClick={() => setMainTab("pray")}>See all</div>
            </div>
            <div className="hallow-scroll-row mb-4">
              {[
                { title: "Holy Rosary", sub: "Joyful Mysteries", dot: "#c9922a", time: "20 min", tab: "rosary" as const },
                { title: "Novena to Saint Jude", sub: `Day ${activeNovenas[0]?.currentDay || 1} of 9`, dot: "#e05050", time: "5 min", tab: "novenas" as const },
                { title: "Lectio Divina", sub: todayReflection?.reference || "Luke 24:5", dot: "#5090e0", time: "10 min", tab: "rosary" as const },
                { title: "Ignatian Examen", sub: "Evening reflection", dot: "#50b870", time: "7 min", tab: "rosary" as const },
                { title: "Divine Mercy Chaplet", sub: "3 PM prayer", dot: "#9060d0", time: "15 min", tab: "rosary" as const },
              ].map((item, i) => (
                <div key={i} className="mini-card" onClick={() => { setPraySubTab(item.tab); setMainTab("pray"); triggerChime(); }}>
                  <div className="mini-card-dot" style={{ background: item.dot, boxShadow: `0 0 6px ${item.dot}50` }} />
                  <div className="mini-card-title">{item.title}</div>
                  <div className="mini-card-sub">{item.sub}</div>
                  <div className="mini-card-time"><Moon className="w-2.5 h-2.5" /> {item.time}</div>
                </div>
              ))}
            </div>

            {/* Saint of the day */}
            <div className="section-hdr">
              <div className="section-hdr-title">Your Patron Saint</div>
              <div className="section-hdr-see" onClick={() => { setMainTab("more"); setMoreSubTab("saints"); }}>Explore</div>
            </div>
            <div className="mx-4 mb-4">
              <div className="hallow-card flex items-center gap-3 cursor-pointer" onClick={() => { setMainTab("more"); setMoreSubTab("saints"); }}>
                <div className="w-12 h-12 bg-[#1e1405] border border-[#3d2808] rounded-full flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-[#c9922a]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-bold text-[#ddc98a]">{getSaintDisplayName()}</div>
                  <div className="text-[10px] text-[#4a3318] mt-0.5">{affirmationData?.saintName ? "Patron Intercessor" : "Your chosen patron"}</div>
                  {affirmationData?.quote && (
                    <div className="text-[10.5px] italic text-[#6b5a30] mt-1.5 line-clamp-1">"{affirmationData.quote}"</div>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-[#2a1e08] flex-shrink-0" />
              </div>
            </div>

            {/* Sleep stories */}
            <div className="section-hdr">
              <div className="section-hdr-title">Sleep Stories</div>
              <div className="section-hdr-see" onClick={() => setMainTab("sleep")}>See all</div>
            </div>
            <div className="hallow-scroll-row mb-4">
              {[
                { title: "The Road to Emmaus", sub: "Night prayer · Narrated", dot: "#7060b0" },
                { title: "Taizé Chant", sub: "Calm · Sleep sounds", dot: "#408070" },
                { title: "Psalm 23", sub: "Guided meditation", dot: "#b06030" },
                { title: "The Nativity", sub: "Christmas reflection", dot: "#5090e0" },
              ].map((item, i) => (
                <div key={i} className="mini-card" onClick={() => setMainTab("sleep")}>
                  <div className="mini-card-dot" style={{ background: item.dot }} />
                  <div className="mini-card-title">{item.title}</div>
                  <div className="mini-card-sub">{item.sub}</div>
                  <div className="mini-card-time"><Moon className="w-2.5 h-2.5" /> Sleep</div>
                </div>
              ))}
            </div>

            {/* Community wall preview */}
            <div className="section-hdr">
              <div className="section-hdr-title">Community Wall</div>
              <div className="section-hdr-see" onClick={() => { setMainTab("pray"); setPraySubTab("wall"); }}>See all</div>
            </div>
            {communityPrayers.slice(0, 2).map(prayer => (
              <div key={prayer.id} className="wall-item">
                <div className="wall-item-meta">
                  <span className="wall-cat-pill" style={{ background: prayer.category === "Healing" ? "#1a0808" : prayer.category === "Thanksgiving" ? "#12100a" : "#0a0f1a", color: prayer.category === "Healing" ? "#f87171" : prayer.category === "Thanksgiving" ? "#c9922a" : "#93c5fd", border: `1px solid ${prayer.category === "Healing" ? "#7f1d1d" : prayer.category === "Thanksgiving" ? "#3d2808" : "#1e3a8a"}` }}>
                    {prayer.category}
                  </span>
                  <span className="text-[9px] text-[#2a1e08]">
                    {new Date(prayer.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                </div>
                <p className="prayer-text text-[11px] text-[#9e8060] leading-relaxed">"{prayer.content}"</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1e1a10]">
                  <span className="text-[10px] text-[#3d3020] font-medium">{prayer.authorName}</span>
                  <button className="wall-amen-btn" onClick={() => handleAmen(prayer.id)}>
                    🕯 Amen ({prayer.amenCount})
                  </button>
                </div>
              </div>
            ))}
            <div className="h-4" />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  PRAY TAB                                                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {mainTab === "pray" && (
          <div className="tab-panel">
            {/* Sub-tab nav */}
            <div className="subtab-bar">
              {(["rosary", "novenas", "intentions", "wall", "confession"] as const).map(t => (
                <div key={t} className={`subtab-item ${praySubTab === t ? "active" : ""}`} onClick={() => { setPraySubTab(t); triggerChime(); }}>
                  {t === "rosary" ? "Rosary" : t === "novenas" ? "Novenas" : t === "intentions" ? "Intentions" : t === "wall" ? "Community" : "Confession"}
                </div>
              ))}
            </div>

            <div key={praySubTab} className="tab-panel">
{/* ROSARY */}
{praySubTab === "rosary" && (
  <div className="px-4 pt-4">
    <AudioRosary onRosaryComplete={incrementPrayerStats} isTabActive={mainTab === "pray" && praySubTab === "rosary"} setActiveTab={() => {}} isFocusMode={isFocusMode} setIsFocusMode={setIsFocusMode} />
  </div>
)}

              {/* NOVENAS */}
              {praySubTab === "novenas" && (
                <div className="page-gap">
                  <div className="text-[11px] text-[#5a4018] leading-relaxed px-0 pb-2">
                    A novena is nine consecutive days of prayer, mirroring the apostles in the Upper Room before Pentecost.
                  </div>

                  {selectedNovenaId ? (() => {
                    const nov = activeNovenas.find(n => n.id === selectedNovenaId);
                    if (!nov) return null;
                    const done = nov.completedDays.length === 9;
                    const dayData = nov.prayersByDay[nov.currentDay - 1] || nov.prayersByDay[0];
                    const isDayDone = nov.completedDays.includes(nov.currentDay);
                    return (
                      <div className="hallow-card warm">
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-[#2a1e08]">
                          <div>
                            <div className="text-[9px] font-bold tracking-widest uppercase text-[#c9922a]">Active Novena</div>
                            <div className="text-[14px] font-bold text-[#f5ead8] mt-0.5">{nov.title}</div>
                          </div>
                          <button onClick={() => setSelectedNovenaId(null)} className="text-[10px] text-[#6b5a30] underline cursor-pointer bg-none border-none">Back</button>
                        </div>
                        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                          {nov.prayersByDay.map(d => (
                            <button key={d.day} className={`novena-day ${nov.completedDays.includes(d.day) ? "done" : nov.currentDay === d.day ? "active" : "empty"}`}
                              onClick={() => saveNovenas(activeNovenas.map(n => n.id === nov.id ? { ...n, currentDay: d.day } : n))}>
                              {d.day}
                            </button>
                          ))}
                        </div>
                        {done ? (
                          <div className="text-center py-4">
                            <div className="text-3xl mb-2">✝</div>
                            <div className="text-[13px] font-bold text-[#f5ead8] mb-1">Novena Complete!</div>
                            <div className="text-[10px] text-[#6b5a30] mb-3">Nine days of prayer completed. May God grant your intention.</div>
                            <button onClick={() => handleResetNovena(nov.id)} className="hallow-play-btn ghost text-[11px] px-4 py-2 cursor-pointer">Restart</button>
                          </div>
                        ) : (
                          <>
                            <div className="text-[9px] font-bold tracking-widest uppercase text-[#c9922a] mb-2">Day {nov.currentDay}</div>
                            <p className="prayer-text text-[12px] text-[#c9b888] mb-4">"{dayData?.prayer}"</p>
                            <button onClick={() => handleCompleteNovenaDay(nov.id, nov.currentDay)} disabled={isDayDone}
                              className={`hallow-play-btn w-full justify-center text-[12px] cursor-pointer ${isDayDone ? "opacity-50" : ""}`}>
                              {isDayDone ? "✓ Day Complete" : "Mark Day Complete"}
                            </button>
                          </>
                        )}
                      </div>
                    );
                  })() : (
                    activeNovenas.map(nov => (
                      <div key={nov.id} className="hallow-card">
                        <div className="text-[9px] font-bold tracking-widest uppercase text-[#4a3318] mb-1">{nov.targetSaint}</div>
                        <div className="text-[13px] font-bold text-[#ddc98a] mb-1">{nov.title}</div>
                        <div className="text-[10px] text-[#4a3318] mb-3">{nov.description}</div>
                        <div className="flex items-center justify-between">
                          <div className="text-[10px] font-bold text-[#8a6a30]">{nov.completedDays.length}/9 days</div>
                          <button onClick={() => nov.currentDay === 0 ? handleStartNovena(nov.id) : setSelectedNovenaId(nov.id)}
                            className="hallow-play-btn text-[11px] px-4 py-2 cursor-pointer">
                            {nov.currentDay === 0 ? "Begin" : "Resume"}
                          </button>
                        </div>
                        {nov.currentDay > 0 && (
                          <div className="mt-3 h-1.5 bg-[#1e1a10] rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-[#8a5a15] to-[#c9922a] rounded-full transition-all" style={{ width: `${(nov.completedDays.length / 9) * 100}%` }} />
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* INTENTIONS */}
              {praySubTab === "intentions" && (
                <div className="page-gap">
                  {/* Add form */}
                  <div className="hallow-card warm">
                    <div className="hallow-card-label"><Flame className="w-3 h-3" /> Light a Prayer Candle</div>
                    <form onSubmit={handleAddIntention} className="flex flex-col gap-3">
                      <input type="text" value={newIntentionTitle} onChange={e => setNewIntentionTitle(e.target.value)}
                        placeholder="Your intention title..." required
                        className="bg-[#0c0a07] border border-[#2a1e08] rounded-lg p-2.5 text-[12px] text-[#f5ead8] placeholder:text-[#2a1e08] focus:outline-none focus:border-[#c9922a]" />
                      <div className="relative">
                        <input type="text" value={newIntentionDesc} onChange={e => setNewIntentionDesc(e.target.value)}
                          placeholder="Brief description..."
                          className="bg-[#0c0a07] border border-[#2a1e08] rounded-lg p-2.5 pr-10 text-[12px] text-[#f5ead8] placeholder:text-[#2a1e08] focus:outline-none focus:border-[#c9922a] w-full" />
                        <SpeechToTextButton onTranscript={t => setNewIntentionDesc(p => p ? p + " " + t : t)} className="absolute right-2 top-1/2 -translate-y-1/2" />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {INTENTION_CATEGORIES.map(cat => (
                          <button key={cat.id} type="button" onClick={() => setNewIntentionCategory(cat.id)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold cursor-pointer border transition-all ${newIntentionCategory === cat.id ? "border-[#c9922a] bg-[#c9922a]/10 text-[#c9922a]" : "border-[#1e1a10] text-[#4a3318]"}`}>
                            <span className="w-2 h-2 rounded-full" style={{ background: cat.hex }} />
                            {cat.name.split(" ")[0]}
                          </button>
                        ))}
                      </div>
                      <button type="submit" className="hallow-play-btn w-full justify-center text-[12px] cursor-pointer">
                        <Flame className="w-4 h-4" /> Light Candle
                      </button>
                    </form>
                  </div>

                  {/* Votive altar */}
                  {personalIntentions.filter(i => !i.answered).length > 0 && (
                    <div className="hallow-card">
                      <div className="hallow-card-label"><Flame className="w-3 h-3" /> Sanctuary Altar</div>
                      <div className="flex flex-wrap gap-6 justify-center py-4 bg-[#0c0a07] rounded-xl border border-[#1e1a10] mb-3">
                        {personalIntentions.filter(i => !i.answered).map(item => {
                          const cat = getCategoryConfig(item.category);
                          return (
                            <div key={item.id} className="votive-candle" onClick={() => setVotiveDetailId(votiveDetailId === item.id ? null : item.id)}>
                              <div className="votive-glass" style={{ borderTopColor: cat.hex, borderColor: `${cat.hex}30` }}>
                                <div className="votive-flame">
                                  <Flame className="w-4 h-4 candle-flicker" style={{ color: cat.hex }} />
                                </div>
                                <span className="text-[8px] font-bold text-[#3d3020] z-10">{item.title.substring(0, 2).toUpperCase()}</span>
                              </div>
                              <div className="text-center max-w-[70px]">
                                <div className="text-[9px] font-bold text-[#8a6a30] line-clamp-1">{item.title}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {votiveDetailId && (() => {
                        const item = personalIntentions.find(i => i.id === votiveDetailId);
                        if (!item) return null;
                        const cat = getCategoryConfig(item.category);
                        return (
                          <div className="bg-[#0e0b05] border border-[#2a1e08] rounded-xl p-3 relative">
                            <button onClick={() => setVotiveDetailId(null)} className="absolute top-2 right-2 text-[#3d3020] cursor-pointer bg-none border-none"><X className="w-4 h-4" /></button>
                            <div className="text-[12px] font-bold text-[#ddc98a] mb-1">{item.title}</div>
                            <div className="text-[10px] text-[#4a3318] mb-3">{item.description}</div>
                            <div className="flex gap-2">
                              <button onClick={() => { handleMarkAnswered(item.id); setVotiveDetailId(null); }} className="hallow-play-btn text-[11px] px-3 py-1.5 cursor-pointer"><Check className="w-3.5 h-3.5" /> Answered</button>
                              <button onClick={() => handleDeleteIntention(item.id)} className="hallow-play-btn ghost text-[11px] px-3 py-1.5 cursor-pointer"><Trash className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        );
                      })()}
                    </div>
                  )}

                  {/* Active intentions list */}
                  {personalIntentions.filter(i => !i.answered).map(item => {
                    const cat = getCategoryConfig(item.category);
                    return (
                      <div key={item.id} className="hallow-card">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.hex, boxShadow: `0 0 5px ${cat.hex}60` }} />
                            <div className="text-[12.5px] font-bold text-[#ddc98a]">{item.title}</div>
                          </div>
                          <div className="flex gap-1.5">
                            <button onClick={() => handleMarkAnswered(item.id)} className="p-1.5 bg-[#1e1405] rounded-lg border border-[#2a1e08] cursor-pointer"><Check className="w-3.5 h-3.5 text-[#c9922a]" /></button>
                            <button onClick={() => handleDeleteIntention(item.id)} className="p-1.5 bg-[#1a0808] rounded-lg border border-[#3d1010] cursor-pointer"><Trash className="w-3.5 h-3.5 text-[#e05050]" /></button>
                          </div>
                        </div>
                        {item.description && <div className="text-[10.5px] text-[#4a3318] mb-2">{item.description}</div>}
                        {item.notes && <div className="text-[10px] italic text-[#5a4018] bg-[#0c0a07] p-2 rounded-lg border border-[#1e1a10]">"{item.notes}"</div>}
                        {selectedIntentionIdForNotes === item.id ? (
                          <div className="flex gap-2 mt-2">
                            <input type="text" value={intentionNoteText} onChange={e => setIntentionNoteText(e.target.value)}
                              placeholder="Add a note..." className="flex-1 bg-[#0c0a07] border border-[#2a1e08] rounded-lg px-2.5 py-1.5 text-[11px] text-[#f5ead8] focus:outline-none" />
                            <button onClick={() => handleAddNote(item.id)} className="hallow-play-btn text-[10px] px-3 py-1.5 cursor-pointer">Save</button>
                          </div>
                        ) : (
                          <button onClick={() => setSelectedIntentionIdForNotes(item.id)} className="mt-2 text-[10px] text-[#4a3318] underline cursor-pointer bg-none border-none">+ Add note</button>
                        )}
                      </div>
                    );
                  })}

                  {/* Answered section */}
                  {personalIntentions.filter(i => i.answered).length > 0 && (
                    <div className="hallow-card warm">
                      <div className="hallow-card-label"><Sparkles className="w-3 h-3" /> Altar of Gratitude</div>
                      {personalIntentions.filter(i => i.answered).map(item => (
                        <div key={item.id} className="flex items-center gap-3 py-2.5 border-b border-[#1e1a10] last:border-0">
                          <span className="text-lg">🕯</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-[11px] font-bold text-[#8a6a30] line-through">{item.title}</div>
                            {item.notes && <div className="text-[9.5px] text-[#4a3318] mt-0.5">"{item.notes}"</div>}
                          </div>
                          <button onClick={() => handleMarkAnswered(item.id)} className="text-[9px] text-[#3d3020] underline cursor-pointer bg-none border-none flex-shrink-0">Reopen</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* COMMUNITY WALL */}
              {praySubTab === "wall" && (
                <div className="page-gap">
                  <div className="hallow-card warm">
                    <div className="hallow-card-label"><UserCheck className="w-3 h-3" /> Share a Prayer</div>
                    <form onSubmit={handlePostToWall} className="flex flex-col gap-3">
                      <div className="relative">
                        <textarea value={newWallContent} onChange={e => setNewWallContent(e.target.value)} rows={3}
                          placeholder="Share your prayer request with the community..." required
                          className="bg-[#0c0a07] border border-[#2a1e08] rounded-lg p-2.5 pr-10 text-[12px] text-[#f5ead8] placeholder:text-[#2a1e08] focus:outline-none focus:border-[#c9922a] w-full resize-none" />
                        <SpeechToTextButton onTranscript={t => setNewWallContent(p => p ? p + " " + t : t)} className="absolute right-2 bottom-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={newWallAuthor} onChange={e => setNewWallAuthor(e.target.value)} placeholder="Your name (optional)"
                          className="bg-[#0c0a07] border border-[#1e1a10] rounded-lg p-2 text-[11px] text-[#f5ead8] placeholder:text-[#2a1e08] focus:outline-none" />
                        <select value={newWallCategory} onChange={e => setNewWallCategory(e.target.value as any)}
                          className="bg-[#0c0a07] border border-[#1e1a10] rounded-lg p-2 text-[11px] text-[#8a6a30] focus:outline-none">
                          {["Healing","Family","Thanksgiving","Strength","Hope","Other"].map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <button type="submit" className="hallow-play-btn w-full justify-center text-[12px] cursor-pointer">
                        <Send className="w-4 h-4" /> Publish to Wall
                      </button>
                    </form>
                  </div>

                  {isLoadingWall ? <SkeletonCard rows={3} /> : communityPrayers.map(prayer => (
                    <div key={prayer.id} className="wall-item">
                      <div className="wall-item-meta">
                        <span className="wall-cat-pill" style={{ background: prayer.category === "Healing" ? "#1a0808" : prayer.category === "Thanksgiving" ? "#12100a" : "#0a0f1a", color: prayer.category === "Healing" ? "#f87171" : prayer.category === "Thanksgiving" ? "#c9922a" : "#93c5fd", border: `1px solid ${prayer.category === "Healing" ? "#7f1d1d" : prayer.category === "Thanksgiving" ? "#3d2808" : "#1e3a8a"}` }}>
                          {prayer.category}
                        </span>
                        <span className="text-[9px] text-[#2a1e08]">
                          {new Date(prayer.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                      </div>
                      <p className="prayer-text text-[11.5px] text-[#9e8060] leading-relaxed">"{prayer.content}"</p>
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#1e1a10]">
                        <span className="text-[10px] text-[#3d3020]">— {prayer.authorName}</span>
                        <button className="wall-amen-btn" onClick={() => handleAmen(prayer.id)}>
                          🕯 Amen ({prayer.amenCount})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* CONFESSION */}
              {praySubTab === "confession" && (
                <div className="px-4 pt-4">
                  <ConfessionPrepTab triggerSound={triggerChime} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  BIBLE TAB                                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {mainTab === "bible" && (
          <div className="tab-panel">
            <div className="subtab-bar">
              {(["reflections", "calendar", "flashcards"] as const).map(t => (
                <div key={t} className={`subtab-item ${bibleSubTab === t ? "active" : ""}`} onClick={() => { setBibleSubTab(t); triggerChime(); }}>
                  {t === "reflections" ? "Reflection" : t === "calendar" ? "Liturgy Calendar" : "Flashcards"}
                </div>
              ))}
            </div>

            <div key={bibleSubTab} className="tab-panel">

              {/* REFLECTIONS */}
              {bibleSubTab === "reflections" && (
                <div className="page-gap">
                  {/* Devotional generator */}
                  <div className="hallow-card warm">
                    <div className="hallow-card-label"><Sparkles className="w-3 h-3" /> Personalized Devotional</div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <select value={devotionalMood} onChange={e => setDevotionalMood(e.target.value)}
                        className="bg-[#0c0a07] border border-[#1e1a10] rounded-lg p-2 text-[11px] text-[#8a6a30] focus:outline-none">
                        {[["trusting","Trusting & Hopeful"],["weary","Weary & Burdened"],["grieving","Grieving Loss"],["thankful","Filled with Gratitude"],["discerning","Seeking Discernment"]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                      </select>
                      <div className="relative">
                        <input type="text" value={devotionalIntention} onChange={e => setDevotionalIntention(e.target.value)} placeholder="Your intention..."
                          className="bg-[#0c0a07] border border-[#1e1a10] rounded-lg p-2 pr-8 text-[11px] text-[#f5ead8] placeholder:text-[#2a1e08] focus:outline-none w-full" />
                        <SpeechToTextButton onTranscript={t => setDevotionalIntention(p => p ? p + " " + t : t)} className="absolute right-1 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>
                    <button onClick={generateDevotional} disabled={isGeneratingDevotional} className="hallow-play-btn w-full justify-center text-[12px] cursor-pointer disabled:opacity-40">
                      <Sparkles className="w-4 h-4" /> {isGeneratingDevotional ? "Generating..." : "Generate Devotional"}
                    </button>
                    {generatedDevotional && (
                      <div className="mt-4 pt-4 border-t border-[#1e1a10]">
                        <p className="prayer-text text-[11.5px] text-[#c9b888] whitespace-pre-wrap">{generatedDevotional.text}</p>
                      </div>
                    )}
                  </div>

                  {/* Today's reflection */}
                  <div className="hallow-card">
                    <div className="hallow-card-label"><BookOpen className="w-3 h-3" /> Today's Reflection</div>
                    {isLoadingReflection ? <SkeletonCard rows={4} /> : (
                      <>
                        <div className="text-[16px] font-bold text-[#f5ead8] mb-3">{todayReflection?.title}</div>
                        <blockquote className="verse-text border-l-2 border-[#c9922a] pl-3 mb-2">"{todayReflection?.verse}"</blockquote>
                        <cite className="text-[9.5px] font-bold text-[#c9922a] tracking-widest uppercase not-italic block mb-3">— {todayReflection?.reference}</cite>
                        <div className="prayer-text text-[11.5px] text-[#8a7050] space-y-2">
                          {todayReflection?.reflectionText.split("\n\n").map((p, i) => <p key={i}>{p}</p>)}
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-[#1e1a10]">
                          <div className="bg-[#0e0b05] border border-[#1e1a10] rounded-xl p-3">
                            <div className="text-[8.5px] font-bold tracking-widest uppercase text-[#50b870] mb-2">☀ Morning Prayer</div>
                            <p className="prayer-text text-[10.5px] text-[#6b5a30]">{todayReflection?.morningPrayer}</p>
                          </div>
                          <div className="bg-[#0e0b05] border border-[#1e1a10] rounded-xl p-3">
                            <div className="text-[8.5px] font-bold tracking-widest uppercase text-[#9060d0] mb-2">🌙 Evening Prayer</div>
                            <p className="prayer-text text-[10.5px] text-[#6b5a30]">{todayReflection?.eveningPrayer}</p>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="mt-4 pt-3 border-t border-[#1e1a10]">
                      <div className="text-[10px] text-[#4a3318] mb-2">Focus on a specific trial or saint:</div>
                      <div className="flex gap-2">
                        <input type="text" value={reflectionFocus} onChange={e => setReflectionFocus(e.target.value)} placeholder="e.g. Grief, Forgiveness..."
                          className="flex-1 bg-[#0c0a07] border border-[#1e1a10] rounded-lg px-3 py-2 text-[11px] text-[#f5ead8] placeholder:text-[#2a1e08] focus:outline-none" />
                        <button onClick={() => fetchTodayReflection(reflectionFocus)} className="hallow-play-btn text-[11px] px-4 py-2 cursor-pointer">Refocus</button>
                      </div>
                    </div>
                  </div>

                  {/* Scripture challenge */}
                  <div className="hallow-card">
                    <div className="hallow-card-label"><BookMarked className="w-3 h-3" /> 15-Day Scripture Challenge</div>
                    <div className="flex items-center justify-between text-[10px] text-[#6b5a30] mb-2">
                      <span>{scriptures.filter(s => s.completed).length}/{scriptures.length} days complete</span>
                      <span>{Math.round((scriptures.filter(s => s.completed).length / Math.max(scriptures.length, 1)) * 100)}%</span>
                    </div>
                    <div className="h-2 bg-[#1e1a10] rounded-full overflow-hidden mb-4">
                      <div className="h-full bg-gradient-to-r from-[#8a5a15] to-[#c9922a] rounded-full transition-all" style={{ width: `${(scriptures.filter(s => s.completed).length / Math.max(scriptures.length, 1)) * 100}%` }} />
                    </div>
                    {scriptures[selectedScriptureIdx] && (() => {
                      const s = scriptures[selectedScriptureIdx];
                      return (
                        <div className="bg-[#0e0b05] border border-[#1e1a10] rounded-xl p-3 mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-bold tracking-widest uppercase text-[#c9922a]">Day {s.day}</span>
                            <input type="checkbox" checked={s.completed} onChange={() => handleToggleScripture(s.id)} className="cursor-pointer accent-amber-600" />
                          </div>
                          <div className="text-[12px] font-bold text-[#ddc98a] mb-1">{s.chapter}:{s.verses}</div>
                          <p className="prayer-text text-[11px] text-[#6b5a30] italic line-clamp-2">"{s.text}"</p>
                        </div>
                      );
                    })()}
                    <div className="grid grid-cols-5 gap-1.5">
                      {scriptures.map((s, i) => (
                        <button key={s.id} onClick={() => setSelectedScriptureIdx(i)}
                          className={`p-1.5 text-[9.5px] font-bold rounded-lg cursor-pointer transition-all border ${i === selectedScriptureIdx ? "bg-[#c9922a] text-[#1a0f00] border-[#c9922a]" : s.completed ? "bg-[#1e1405] text-[#8a6a30] border-[#2a1e08]" : "bg-[#131008] text-[#2a1e08] border-[#1e1a10]"}`}>
                          {s.day}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* CALENDAR */}
              {bibleSubTab === "calendar" && (
                <div className="page-gap">
                  <div className="hallow-card warm">
                    <div className="hallow-card-label"><Calendar className="w-3 h-3" /> {getAutoLiturgicalSeason()} Season</div>
                    <div className="flex gap-2 mb-2">
                      {["violet","green","white","red","rose"].map(c => (
                        <div key={c} className="w-5 h-5 rounded-full border border-[#1e1a10]" style={{ background: c === "violet" ? "#7c3aed" : c === "green" ? "#059669" : c === "white" ? "#d6d3d1" : c === "red" ? "#dc2626" : "#ec4899" }} />
                      ))}
                    </div>
                  </div>
                  {FEAST_DAYS.map(feast => {
                    const [m, d] = feast.date.split("-");
                    const dateObj = new Date(2026, Number(m) - 1, Number(d));
                    return (
                      <div key={feast.id} className="hallow-card">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: feast.color === "rose" ? "#ec4899" : feast.color === "violet" ? "#8b5cf6" : feast.color === "red" ? "#ef4444" : feast.color === "green" ? "#10b981" : "#d6d3d1" }} />
                            <span className="text-[9px] font-bold tracking-widest uppercase text-[#c9922a]">{feast.feastLevel}</span>
                          </div>
                          <span className="text-[9.5px] text-[#3d3020]">{dateObj.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                        </div>
                        <div className="text-[13px] font-bold text-[#ddc98a] mb-1">{feast.title}</div>
                        <div className="text-[10.5px] text-[#4a3318]">{feast.description}</div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* FLASHCARDS */}
              {bibleSubTab === "flashcards" && (
                <div className="px-4 pt-4">
                  <BibleFlashcardsTab triggerSound={triggerChime} />
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  SLEEP TAB                                                      */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {mainTab === "sleep" && (
          <div className="tab-panel">
            <div className="hallow-hero">
              <div className="hallow-hero-tag"><Moon className="w-3.5 h-3.5" /> Sleep & Rest</div>
              <div className="hallow-hero-title">Rest in His Peace</div>
              <div className="hallow-hero-sub">Scripture stories, night prayers, and Gregorian chant to carry you to restful sleep.</div>
              <button className="hallow-play-btn" onClick={() => { setIsCathedralSoundActive(true); triggerChime(); }}>
                <Volume2 className="w-4 h-4" /> Start Cathedral Chants
              </button>
            </div>
            <div className="px-4 pt-2">
              <SleepStoriesTab />
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/*  MORE TAB                                                       */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {mainTab === "more" && (
          <div className="tab-panel">
            <div className="subtab-bar">
              {(["profile", "saints", "routines", "trending"] as const).map(t => (
                <div key={t} className={`subtab-item ${moreSubTab === t ? "active" : ""}`} onClick={() => { setMoreSubTab(t); triggerChime(); }}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </div>
              ))}
            </div>

            <div key={moreSubTab} className="tab-panel">

              {/* PROFILE */}
              {moreSubTab === "profile" && (
                <div className="page-gap">
                  {/* Profile card */}
                  <div className="hallow-card warm">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="profile-avatar">{profileName.charAt(0)}</div>
                      <div className="flex-1">
                        <div className="text-[15px] font-bold text-[#f5ead8]">{profileName}</div>
                        <div className="text-[10px] text-[#4a3318]">Faithful Pilgrim · {getAutoLiturgicalSeason()}</div>
                      </div>
                      <button onClick={() => { setTempProfileName(profileName); setTempFavoriteSaint(favoriteSaint); setTempFavoriteSaintCustomText(favoriteSaintCustomText); setTempFontSize(appFontSize); setIsEditProfileOpen(true); }}
                        className="p-2 bg-[#1e1405] border border-[#2a1e08] rounded-lg cursor-pointer">
                        <Edit className="w-4 h-4 text-[#c9922a]" />
                      </button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 pt-4 border-t border-[#2a1e08]">
                      {[["Streak", stats.streak + " days"], ["Prayers", String(stats.totalPrayersCount)], ["Scripture", `${stats.completedScripturesCount}/15`]].map(([l, v]) => (
                        <div key={l} className="text-center">
                          <div className="text-[17px] font-bold text-[#c9922a]">{v}</div>
                          <div className="text-[9px] text-[#3d3020] mt-0.5 font-semibold uppercase tracking-wide">{l}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Patron saint */}
                  <div className="hallow-card" onClick={() => setIsBioOpen(true)}>
                    <div className="hallow-card-label"><Award className="w-3 h-3" /> Patron Saint</div>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#1e1405] border border-[#3d2808] rounded-full flex items-center justify-center">
                        <Award className="w-5 h-5 text-[#c9922a]" />
                      </div>
                      <div className="flex-1">
                        <div className="text-[12.5px] font-bold text-[#ddc98a]">{getSaintDisplayName()}</div>
                        <div className="text-[10px] text-[#4a3318]">Your chosen intercessor</div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-[#2a1e08]" />
                    </div>
                    {affirmationData && (
                      <div className="mt-3 pt-3 border-t border-[#1e1a10]">
                        <p className="verse-text text-[11px] text-[#6b5a30] line-clamp-2">"{affirmationData.quote}"</p>
                      </div>
                    )}
                  </div>

                  {/* Settings */}
                  <div className="hallow-card">
                    <div className="hallow-card-label"><Sliders className="w-3 h-3" /> Settings</div>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#1e1a10]">
                      <span className="text-[12px] text-[#a09060]">Notifications</span>
                      <button onClick={() => setNotificationsEnabled(!notificationsEnabled)} className={`w-10 h-5.5 rounded-full transition-all cursor-pointer border-0 relative ${notificationsEnabled ? "bg-[#c9922a]" : "bg-[#1e1a10]"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${notificationsEnabled ? "left-5" : "left-0.5"}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2.5 border-b border-[#1e1a10]">
                      <span className="text-[12px] text-[#a09060]">Offline Mode</span>
                      <button onClick={() => setIsOfflineMode(!isOfflineMode)} className={`w-10 h-5.5 rounded-full transition-all cursor-pointer border-0 relative ${isOfflineMode ? "bg-[#c9922a]" : "bg-[#1e1a10]"}`}>
                        <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${isOfflineMode ? "left-5" : "left-0.5"}`} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between py-2.5">
                      <span className="text-[12px] text-[#a09060]">Font Size</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#4a3318]">A</span>
                        <input type="range" min="13" max="22" value={appFontSize} onChange={e => setAppFontSize(Number(e.target.value))} className="w-20 accent-amber-600" />
                        <span className="text-[13px] text-[#a09060] font-bold">A</span>
                      </div>
                    </div>
                  </div>

                  {/* Traditional prayers */}
                  <div className="hallow-card">
                    <div className="hallow-card-label"><BookOpen className="w-3 h-3" /> Traditional Prayers</div>
                    <input type="text" value={searchPrayerQuery} onChange={e => setSearchPrayerQuery(e.target.value)} placeholder="Search prayers..."
                      className="w-full bg-[#0c0a07] border border-[#1e1a10] rounded-lg px-3 py-2 text-[11px] text-[#f5ead8] placeholder:text-[#2a1e08] focus:outline-none mb-3" />
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
                      {filteredPrayers.map(p => (
                        <div key={p.id} onClick={() => alert(`[${p.title}]\n\n${p.text}`)}
                          className="flex items-center justify-between p-2.5 bg-[#0e0b05] border border-[#1e1a10] rounded-lg cursor-pointer hover:border-[#2a1e08]">
                          <span className="text-[11.5px] font-semibold text-[#ddc98a]">{p.title}</span>
                          <span className="text-[9px] bg-[#131008] border border-[#1e1a10] rounded px-2 py-0.5 text-[#4a3318]">{p.category}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {user && (
                    <button onClick={() => { localStorage.removeItem("sanctuary_user"); setUser(null); }}
                      className="w-full py-3 bg-[#1a0808] border border-[#3d1010] rounded-xl text-[12px] font-bold text-[#e05050] cursor-pointer">
                      Sign Out
                    </button>
                  )}
                </div>
              )}

              {/* SAINTS */}
              {moreSubTab === "saints" && (
                <div className="px-4 pt-4">
                  <SaintsCatalogTab personalIntentions={personalIntentions}
                    onAddIntentionNote={(id, note) => saveIntentions(personalIntentions.map(i => i.id === id ? { ...i, notes: (i.notes ? i.notes + "\n" : "") + note } : i))}
                    searchQuery={saintsSearchQuery} onSearchQueryChange={setSaintsSearchQuery} />
                </div>
              )}

              {/* ROUTINES */}
              {moreSubTab === "routines" && (
                <div className="px-4 pt-4">
                  <RoutinesTab onAddStatsPrayer={incrementPrayerStats} onNavigateToStories={() => setMainTab("sleep")} />
                </div>
              )}

              {/* TRENDING */}
              {moreSubTab === "trending" && (
                <div className="px-4 pt-4">
                  <TrendingTab onAddStatsPrayer={incrementPrayerStats} />
                </div>
              )}
            </div>
          </div>
        )}

      </main>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  BOTTOM NAVIGATION                                                  */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <nav className="hallow-bottom-nav">
        {([
          { id: "today", label: "Today",   Icon: Home },
          { id: "pray",  label: "Pray",    Icon: Compass },
          { id: "bible", label: "Bible",   Icon: BookOpen },
          { id: "sleep", label: "Sleep",   Icon: Moon },
          { id: "more",  label: "More",    Icon: User },
        ] as const).map(({ id, label, Icon }) => (
          <div key={id} className={`bnav-item ${mainTab === id ? "active" : ""}`} onClick={() => { setMainTab(id); triggerChime(); }}>
            <Icon style={{ width: 22, height: 22 }} />
            <span>{label}</span>
          </div>
        ))}
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/*  EDIT PROFILE MODAL                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 backdrop-blur-sm p-0" onClick={() => setIsEditProfileOpen(false)}>
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 30 }}
            className="w-full max-w-[480px] bg-[#131008] rounded-t-2xl border-t border-[#2a1e08] p-6"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="text-[14px] font-bold text-[#f5ead8]">Edit Profile</div>
              <button onClick={() => setIsEditProfileOpen(false)} className="p-1.5 text-[#4a3318] cursor-pointer bg-none border-none"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <div className="text-[9.5px] font-bold tracking-widest uppercase text-[#4a3318] mb-1.5">Pilgrim Name</div>
                <input type="text" value={tempProfileName} onChange={e => setTempProfileName(e.target.value)}
                  className="w-full bg-[#0c0a07] border border-[#2a1e08] rounded-xl px-3 py-2.5 text-[13px] text-[#f5ead8] focus:outline-none focus:border-[#c9922a]" />
              </div>
              <div>
                <div className="text-[9.5px] font-bold tracking-widest uppercase text-[#4a3318] mb-1.5">Patron Saint</div>
                <select value={tempFavoriteSaint} onChange={e => setTempFavoriteSaint(e.target.value)}
                  className="w-full bg-[#0c0a07] border border-[#2a1e08] rounded-xl px-3 py-2.5 text-[13px] text-[#a09060] focus:outline-none">
                  {[["s-teresa-calcutta","Saint Teresa of Calcutta"],["s-peter","Saint Peter"],["s-paul","Saint Paul"],["s-mary","Blessed Virgin Mary"],["s-john-baptist","Saint John the Baptist"],["s-therese","Saint Thérèse of Lisieux"],["s-francis","Saint Francis"],["s-augustine","Saint Augustine"],["s-padre-pio","Saint Padre Pio"],["s-ignatius","Saint Ignatius"],["custom","Custom Saint..."]].map(([v,l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              {tempFavoriteSaint === "custom" && (
                <input type="text" value={tempFavoriteSaintCustomText} onChange={e => setTempFavoriteSaintCustomText(e.target.value)}
                  placeholder="Enter saint name..." className="w-full bg-[#0c0a07] border border-[#2a1e08] rounded-xl px-3 py-2.5 text-[13px] text-[#f5ead8] focus:outline-none" />
              )}
              <button onClick={() => { setProfileName(tempProfileName); setFavoriteSaint(tempFavoriteSaint); setFavoriteSaintCustomText(tempFavoriteSaintCustomText); setAppFontSize(tempFontSize); setIsEditProfileOpen(false); fetchAffirmation(selectedAffirmationSeason); triggerChime(); }}
                className="hallow-play-btn w-full justify-center text-[13px] cursor-pointer mt-1">
                Save Changes
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
