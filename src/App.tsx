/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Flame, BookOpen, Heart, Compass, Calendar, Moon, Sun, Bell, 
  Send, Plus, Trash, Check, Sparkles, RefreshCw, Info, HelpCircle, 
  CheckCircle, ChevronRight, BookMarked, UserCheck, Eye, ShieldAlert, WifiOff, Wifi, Award
} from "lucide-react";
import { AudioRosary } from "./components/AudioRosary";
import { FEAST_DAYS, TRADITIONAL_PRAYERS, NOVENAS, SCRIPTURE_READINGS, TraditionalPrayer } from "./data/liturgy";
import { PersonalIntention, CommunityPrayer, Novena, ScriptureReading, UserStats, DailyReflection, LiturgicalSeason } from "./types";
import { AuthOverlay } from "./components/AuthOverlay";
import { RoutinesTab } from "./components/RoutinesTab";
import { TrendingTab } from "./components/TrendingTab";
import { SleepStoriesTab } from "./components/SleepStoriesTab";
import BibleFlashcardsTab from "./components/BibleFlashcardsTab";

const CrossIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 2v20M7 8h10" />
  </svg>
);

export const INTENTION_CATEGORIES = [
  { id: "penance", name: "Penance & Repentance", color: "violet", badge: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200/30", glow: "from-violet-500/20 to-violet-950/20 shadow-violet-500/30 text-violet-600 dark:text-violet-400 hover:shadow-violet-500/50 ring-violet-500/40", hex: "#8B5CF6", description: "Violet: Preparedness, sacrifice, conversion of heart" },
  { id: "thanksgiving", name: "Thanksgiving & Joy", color: "gold", badge: "bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-200/30", glow: "from-amber-400/20 to-amber-950/20 shadow-amber-500/30 text-amber-600 dark:text-amber-400 hover:shadow-amber-500/50 ring-amber-500/40", hex: "#F59E0B", description: "Gold: Praise, deep joy of answered prayer, resurrection celebration" },
  { id: "hope", name: "Hope & Discernment", color: "rose", badge: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-200/30", glow: "from-rose-500/20 to-rose-950/20 shadow-rose-500/30 text-rose-600 dark:text-rose-400 hover:shadow-rose-500/50 ring-rose-500/40", hex: "#F43F5E", description: "Rose: Vocation determination, waiting in hopeful confidence" },
  { id: "healing", name: "Healing & Growth", color: "green", badge: "bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-200/30", glow: "from-emerald-500/20 to-emerald-950/20 shadow-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:shadow-emerald-500/50 ring-emerald-500/40", hex: "#10B981", description: "Green: Physical relief, mental peace, steady spiritual life growth" },
  { id: "sacrifice", name: "Sacrifice & Strength", color: "red", badge: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-200/30", glow: "from-red-500/20 to-red-950/20 shadow-red-500/30 text-red-600 dark:text-red-400 hover:shadow-red-500/50 ring-red-500/40", hex: "#EF4444", description: "Red: Facing martyrdom/heavy trials, physical courage, evoking the Holy Spirit" },
  { id: "purity", name: "Purity & Grace", color: "white", badge: "bg-stone-500/10 text-stone-750 dark:text-stone-300 border border-stone-200/30", glow: "from-stone-300/20 to-stone-900/20 shadow-stone-400/30 text-stone-500 dark:text-stone-200 hover:shadow-stone-400/50 ring-stone-400/40", hex: "#D1D5DB", description: "White: Soul purity, baptism renewal, family protection, angelic assistance" },
  { id: "blue", name: "Peace & Surrender", color: "blue", badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-200/30", glow: "from-blue-500/20 to-blue-950/20 shadow-blue-500/30 text-blue-600 dark:text-blue-400 hover:shadow-blue-500/50 ring-blue-500/40", hex: "#3B82F6", description: "Blue: Absolute surrender to God's providence, peace under trial, Marian devotion" },
];

export const getCategoryConfig = (categoryId?: string) => {
  const config = INTENTION_CATEGORIES.find(c => c.id === categoryId);
  if (config) return config;
  return INTENTION_CATEGORIES.find(c => c.id === "healing") || INTENTION_CATEGORIES[3];
};

export default function App() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<"reflections" | "rosary" | "calendar" | "novenas" | "intentions" | "wall" | "routines" | "trending" | "sleep_stories" | "design_studio" | "flashcards">("reflections");
  const [navStyle, setNavStyle] = useState<"floating_pill" | "monastic_sidebar" | "cathedral_rail">(() => {
    const saved = localStorage.getItem("sanctuary_nav_style");
    return (saved as any) || "cathedral_rail";
  });
  const [user, setUser] = useState<{ name: string; email?: string; isGuest: boolean } | null>(() => {
    const saved = localStorage.getItem("sanctuary_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  const [reflectionFocus, setReflectionFocus] = useState<string>("");
  const [isLoadingReflection, setIsLoadingReflection] = useState<boolean>(false);
  const [todayReflection, setTodayReflection] = useState<DailyReflection | null>(null);
  
  // Seasonal Saintly Affirmation states
  const [selectedAffirmationSeason, setSelectedAffirmationSeason] = useState<LiturgicalSeason>("Ordinary Time");
  const [affirmationData, setAffirmationData] = useState<{
    quote: string;
    saintName: string;
    affirmation: string;
    contemplation: string;
    liturgicalSeason: LiturgicalSeason;
    simulated?: boolean;
    error?: string;
  } | null>(null);
  const [isGeneratingAffirmation, setIsGeneratingAffirmation] = useState<boolean>(false);

  // Custom devotional generator states
  const [devotionalMood, setDevotionalMood] = useState<string>("trusting");
  const [devotionalIntention, setDevotionalIntention] = useState<string>("");
  const [generatedDevotional, setGeneratedDevotional] = useState<{ text: string; verse?: string; reference?: string; simulated?: boolean } | null>(null);
  const [isGeneratingDevotional, setIsGeneratingDevotional] = useState<boolean>(false);

  // Intentions states
  const [personalIntentions, setPersonalIntentions] = useState<PersonalIntention[]>([]);
  const [newIntentionTitle, setNewIntentionTitle] = useState<string>("");
  const [newIntentionDesc, setNewIntentionDesc] = useState<string>("");
  const [newIntentionCategory, setNewIntentionCategory] = useState<string>("healing");
  const [newIntentionTime, setNewIntentionTime] = useState<string>("08:00");
  const [newIntentionReminder, setNewIntentionReminder] = useState<boolean>(true);
  const [shareNewWithWall, setShareNewWithWall] = useState<boolean>(false);
  const [selectedIntentionIdForNotes, setSelectedIntentionIdForNotes] = useState<string | null>(null);
  const [intentionNoteText, setIntentionNoteText] = useState<string>("");
  const [votiveDetailId, setVotiveDetailId] = useState<string | null>(null);

  // Novenas states
  const [activeNovenas, setActiveNovenas] = useState<Novena[]>([]);
  const [selectedNovenaId, setSelectedNovenaId] = useState<string | null>(null);

  // Scripture challenge states
  const [scriptures, setScriptures] = useState<ScriptureReading[]>([]);
  const [selectedScriptureIdx, setSelectedScriptureIdx] = useState<number>(0);

  // Community Wall states
  const [communityPrayers, setCommunityPrayers] = useState<CommunityPrayer[]>([]);
  const [newWallContent, setNewWallContent] = useState<string>("");
  const [newWallAuthor, setNewWallAuthor] = useState<string>("");
  const [newWallCategory, setNewWallCategory] = useState<"Healing" | "Family" | "Thanksgiving" | "Strength" | "Hope" | "Other">("Healing");
  const [isLoadingWall, setIsLoadingWall] = useState<boolean>(false);

  // User stats (streak / counts)
  const [stats, setStats] = useState<UserStats>({
    streak: 3,
    lastPrayerDate: new Date(Date.now() - 3600000 * 24).toISOString().substring(0, 10), // yesterday
    totalPrayersCount: 14,
    completedScripturesCount: 2
  });

  // Settings & notifications simulation states
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(true);
  const [simulatedNotifications, setSimulatedNotifications] = useState<{ id: string; msg: string; time: string }[]>([]);
  
  // Traditional prayer modal for general searching
  const [searchPrayerQuery, setSearchPrayerQuery] = useState<string>("");

  // --- LOCAL PERSISTENCE LOADS ---
  useEffect(() => {
    // dark mode setting
    const storedDark = localStorage.getItem("catholic_dark_mode");
    if (storedDark !== null) {
      setIsDarkMode(storedDark === "true");
    } else {
      setIsDarkMode(true);
    }

    // load scriptual challenges progress
    const storedScriptures = localStorage.getItem("catholic_scriptures");
    if (storedScriptures) {
      setScriptures(JSON.parse(storedScriptures));
    } else {
      setScriptures([...SCRIPTURE_READINGS]);
    }

    // load personal intentions
    const storedIntentions = localStorage.getItem("catholic_intentions");
    if (storedIntentions) {
      setPersonalIntentions(JSON.parse(storedIntentions));
    } else {
      const initialIntentions: PersonalIntention[] = [
        {
          id: "int-1",
          title: "For grandad's arthritis relief",
          description: "Praying for strength to deal with chronic pain and smooth doctors appointment visits.",
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          answered: false,
          reminderEnabled: true,
          reminderTime: "08:15",
          sharedToWall: false,
          notes: "Felt better on Thursday morning.",
          category: "healing"
        },
        {
          id: "int-2",
          title: "Finding peace with my career pivot",
          description: "Asking for clarity during discernment of whether to change departments next month.",
          createdAt: new Date().toISOString(),
          answered: true,
          reminderEnabled: false,
          sharedToWall: false,
          notes: "Offered mass on Sunday. Received job offer today! Completely answered.",
          category: "blue"
        }
      ];
      setPersonalIntentions(initialIntentions);
      localStorage.setItem("catholic_intentions", JSON.stringify(initialIntentions));
    }

    // load novenas tracker
    const storedNovenas = localStorage.getItem("catholic_novenas");
    if (storedNovenas) {
      setActiveNovenas(JSON.parse(storedNovenas));
    } else {
      setActiveNovenas([...NOVENAS]);
    }

    // load user stats
    const storedStats = localStorage.getItem("catholic_stats");
    if (storedStats) {
      setStats(JSON.parse(storedStats));
    } else {
      const initStats = {
        streak: 4,
        lastPrayerDate: new Date(Date.now() - 3600000 * 24).toISOString().substring(0, 10),
        totalPrayersCount: 22,
        completedScripturesCount: 2
      };
      setStats(initStats);
      localStorage.setItem("catholic_stats", JSON.stringify(initStats));
    }
  }, []);

  // Sync state changes to LocalStorage
  const saveIntentionsToStorage = (updated: PersonalIntention[]) => {
    setPersonalIntentions(updated);
    localStorage.setItem("catholic_intentions", JSON.stringify(updated));
  };

  const saveNovenasToStorage = (updated: Novena[]) => {
    setActiveNovenas(updated);
    localStorage.setItem("catholic_novenas", JSON.stringify(updated));
  };

  const saveScripturesToStorage = (updated: ScriptureReading[]) => {
    setScriptures(updated);
    localStorage.setItem("catholic_scriptures", JSON.stringify(updated));
  };

  const saveStatsToStorage = (updated: UserStats) => {
    setStats(updated);
    localStorage.setItem("catholic_stats", JSON.stringify(updated));
  };

  // --- API LOADS (REFLECTIONS & WALL) ---
  const fetchTodayReflection = async (focusedTopic: string = "") => {
    setIsLoadingReflection(true);
    try {
      let url = "/api/reflections/today";
      if (focusedTopic) {
        url += `?topic=${encodeURIComponent(focusedTopic)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setTodayReflection(data);
    } catch (e) {
      console.error("Error fetching reflection:", e);
      // Fallback
      setTodayReflection({
        id: "offline-fallback",
        date: new Date().toISOString().substring(0, 10),
        title: "Peace Be Still",
        verse: "Cast all your anxiety on him because he cares for you.",
        reference: "1 Peter 5:7",
        reflectionText: "When the demands of daily life become overwhelming, we are invited to enter into inner quiet. God speaks in the silence, not in the storm. Spend five minutes in deep adoration and quiet reflection now.",
        morningPrayer: "Lord Jesus, I entrust my day into Your hands. Keep me from distractions and feed my soul in Holy Communion.",
        eveningPrayer: "Eternal Father, I thank You of Your protection tonight. Heal my heart and guide my thoughts as I rest. Amen."
      });
    } finally {
      setIsLoadingReflection(false);
    }
  };

  const fetchWallPrayers = async () => {
    if (isOfflineMode) return;
    setIsLoadingWall(true);
    try {
      const response = await fetch("/api/community-wall");
      const data = await response.json();
      setCommunityPrayers(data);
    } catch (error) {
      console.error("Error loading community wall prayers:", error);
    } finally {
      setIsLoadingWall(false);
    }
  };

  const getAutoLiturgicalSeason = (): LiturgicalSeason => {
    const date = new Date();
    const month = date.getMonth(); // 0 is Jan, 11 is Dec
    const day = date.getDate();

    if ((month === 11 && day >= 25) || (month === 0 && day <= 11)) {
      return 'Christmas';
    }
    if (month === 11 || (month === 10 && day >= 29)) {
      return 'Advent';
    }
    // Lent in 2026: Feb 18 to April 4
    if ((month === 1 && day >= 18) || month === 2 || (month === 3 && day <= 4)) {
      return 'Lent';
    }
    // Easter in 2026: April 5 to May 24
    if ((month === 3 && day >= 5) || (month === 4 && day <= 24)) {
      return 'Easter';
    }
    return 'Ordinary Time';
  };

  const fetchAffirmation = async (season: LiturgicalSeason) => {
    setIsGeneratingAffirmation(true);
    try {
      const response = await fetch("/api/generate-affirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season }),
      });
      const data = await response.json();
      setAffirmationData(data);
    } catch (err) {
      console.error("Error generating seasonal affirmation:", err);
      setAffirmationData({
        quote: "Do ordinary things with extraordinary love.",
        saintName: "Saint Teresa of Calcutta",
        affirmation: "I will seek God in the small, seemingly mundane moments of this ordinary day, transforming my routine tasks into acts of deep prayer and love.",
        contemplation: "God does not ask of us great deeds, but rather great love in the midst of our normal responsibilities. Let the green of this liturgical season remind you of steady, quiet spiritual growth.",
        liturgicalSeason: season,
        simulated: true
      });
    } finally {
      setIsGeneratingAffirmation(false);
    }
  };

  useEffect(() => {
    const currentSeason = getAutoLiturgicalSeason();
    setSelectedAffirmationSeason(currentSeason);
    fetchAffirmation(currentSeason);
  }, []);

  useEffect(() => {
    fetchTodayReflection();
    fetchWallPrayers();
  }, [isOfflineMode]);

  // Push notifications simulation runner
  useEffect(() => {
    if (!notificationsEnabled) return;

    // Simulate morning verse notifications popping in on first mount after 4 seconds
    const timer1 = setTimeout(() => {
      triggerNotificationSound();
      setSimulatedNotifications(prev => [
        {
          id: String(Date.now()),
          msg: "🌅 Morning Devotional: 'But root your soul near streams of living water...' Read today's Reflection!",
          time: "Just now"
        },
        ...prev
      ]);
    }, 5500);

    const timer2 = setTimeout(() => {
      triggerNotificationSound();
      setSimulatedNotifications(prev => [
        {
          id: String(Date.now() + 1),
          msg: "🕯️ Faith Keepers: Your streak candle is glowing. Keep up your Day 4 habit! Complete today's liturgy.",
          time: "2 minutes ago"
        },
        ...prev
      ]);
    }, 18000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [notificationsEnabled]);

  const triggerNotificationSound = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtxClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5 chime
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch (e) {}
  };

  // --- ACTIONS ---

  // Generate customized devotional response (Gemini Proxy)
  const generateDevotional = async () => {
    setIsGeneratingDevotional(true);
    setGeneratedDevotional(null);
    try {
      const response = await fetch("/api/generate-devotional", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mood: devotionalMood,
          intention: devotionalIntention,
          type: "devotional"
        })
      });
      const data = await response.json();
      setGeneratedDevotional({
        text: data.text,
        simulated: data.simulated
      });
      incrementPrayerStats();
    } catch (e) {
      console.error(e);
      setGeneratedDevotional({
        text: `Unable to establish a spiritual link with the server. Please check your network and API configurations.\n\nHere is a peaceful fallback prayer:\n\n"Eternal Lord, grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference. St. Mary, pray for us."`
      });
    } finally {
      setIsGeneratingDevotional(false);
    }
  };

  // Handles updating streak when a prayer occurs
  const incrementPrayerStats = () => {
    const todayStr = new Date().toISOString().substring(0, 10);
    const updatedStats = { ...stats };
    
    updatedStats.totalPrayersCount += 1;
    
    if (stats.lastPrayerDate !== todayStr) {
      // If last prayer was yesterday, increment streak
      const yesterdayStr = new Date(Date.now() - 3600000 * 24).toISOString().substring(0, 10);
      if (stats.lastPrayerDate === yesterdayStr) {
        updatedStats.streak += 1;
      } else if (stats.lastPrayerDate !== todayStr) {
        updatedStats.streak = 1; // broken streak renewed
      }
      updatedStats.lastPrayerDate = todayStr;
    }
    saveStatsToStorage(updatedStats);
  };

  // Submitting intentions
  const handleAddIntention = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newIntentionTitle.trim()) return;

    const newInt: PersonalIntention = {
      id: "int-" + Date.now(),
      title: newIntentionTitle.trim(),
      description: newIntentionDesc.trim(),
      createdAt: new Date().toISOString(),
      answered: false,
      reminderEnabled: newIntentionReminder,
      reminderTime: newIntentionReminder ? newIntentionTime : undefined,
      sharedToWall: shareNewWithWall,
      category: newIntentionCategory
    };

    const updated = [newInt, ...personalIntentions];
    saveIntentionsToStorage(updated);

    // If shared to community wall, trigger server post too
    if (shareNewWithWall && !isOfflineMode) {
      try {
        await fetch("/api/community-wall", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: `${newInt.title}: ${newInt.description}`,
            authorName: "Anonymously Shared",
            category: "Intentions"
          })
        });
        fetchWallPrayers();
      } catch (err) {
        console.error(err);
      }
    }

    // Reset fields
    setNewIntentionTitle("");
    setNewIntentionDesc("");
    setNewIntentionCategory("healing");
    setShareNewWithWall(false);
    incrementPrayerStats();
  };

  const handleMarkAnswered = (id: string) => {
    const updated = personalIntentions.map(item => {
      if (item.id === id) {
        return { ...item, answered: !item.answered };
      }
      return item;
    });
    saveIntentionsToStorage(updated);
    if (updated.find(item => item.id === id)?.answered) {
      triggerNotificationSound(); // sound of gratitude chime
    }
  };

  const handleDeleteIntention = (id: string) => {
    const updated = personalIntentions.filter(item => item.id !== id);
    saveIntentionsToStorage(updated);
  };

  const handleAddIntentionNote = (id: string) => {
    if (!intentionNoteText.trim()) return;
    const updated = personalIntentions.map(item => {
      if (item.id === id) {
        return { ...item, notes: intentionNoteText.trim() };
      }
      return item;
    });
    saveIntentionsToStorage(updated);
    setIntentionNoteText("");
    setSelectedIntentionIdForNotes(null);
  };

  // Scripture challenge checklist toggler
  const handleToggleScripture = (id: string) => {
    let completedState = false;
    const updated = scriptures.map(s => {
      if (s.id === id) {
        completedState = !s.completed;
        return { ...s, completed: completedState };
      }
      return s;
    });
    saveScripturesToStorage(updated);

    const completedCount = updated.filter(s => s.completed).length;
    const todayStr = new Date().toISOString().substring(0, 10);
    
    // Update stats
    const updatedStats = {
      ...stats,
      completedScripturesCount: completedCount,
      lastReadDate: completedState ? todayStr : stats.lastReadDate
    };
    saveStatsToStorage(updatedStats);
    incrementPrayerStats();
  };

  // Novena interactions
  const handleStartNovena = (id: string) => {
    const updated = activeNovenas.map(nov => {
      if (nov.id === id) {
        return { ...nov, currentDay: 1, completedDays: [] };
      }
      return nov;
    });
    saveNovenasToStorage(updated);
    setSelectedNovenaId(id);
  };

  const handleCompleteNovenaDay = (id: string, dayNum: number) => {
    const updated = activeNovenas.map(nov => {
      if (nov.id === id) {
        const currentCompleted = [...nov.completedDays];
        if (!currentCompleted.includes(dayNum)) {
          currentCompleted.push(dayNum);
        }
        
        let nextDay = nov.currentDay;
        if (dayNum === nov.currentDay) {
          nextDay = Math.min(9, nov.currentDay + 1);
        }

        return {
          ...nov,
          completedDays: currentCompleted,
          currentDay: nextDay
        };
      }
      return nov;
    });
    
    saveNovenasToStorage(updated);
    incrementPrayerStats();
    triggerNotificationSound(); // heavenly chime sound
  };

  const handleResetNovena = (id: string) => {
    const updated = activeNovenas.map(nov => {
      if (nov.id === id) {
        return { ...nov, currentDay: 0, completedDays: [] };
      }
      return nov;
    });
    saveNovenasToStorage(updated);
  };

  // Submit to community wall
  const handlePostToWall = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWallContent.trim()) return;

    try {
      if (isOfflineMode) {
        // Mock offline submit
        const offlineItem: CommunityPrayer = {
          id: "off-" + Date.now(),
          content: newWallContent.trim(),
          authorName: newWallAuthor.trim() || "Anonymous",
          createdAt: new Date().toISOString(),
          amenCount: 1,
          category: newWallCategory
        };
        setCommunityPrayers(prev => [offlineItem, ...prev]);
        setNewWallContent("");
        setNewWallAuthor("");
        alert("Saved locally! Your request will sync when you disable Offline Mode.");
        return;
      }

      await fetch("/api/community-wall", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newWallContent.trim(),
          authorName: newWallAuthor.trim() || "Anonymous",
          category: newWallCategory
        })
      });

      setNewWallContent("");
      setNewWallAuthor("");
      fetchWallPrayers();
      incrementPrayerStats();
    } catch (err) {
      console.error(err);
    }
  };

  // Tapping Amen for others (Incremental support)
  const handleIncreaseAmen = async (id: string) => {
    // Optimistic UI updates
    setCommunityPrayers(prev => prev.map(p => {
      if (p.id === id) return { ...p, amenCount: p.amenCount + 1 };
      return p;
    }));

    if (isOfflineMode) return;

    try {
      await fetch(`/api/community-wall/${id}/amen`, {
        method: "POST"
      });
      incrementPrayerStats();
      triggerNotificationSound(); // gentle bell
    } catch (err) {
      console.error(err);
    }
  };

  // Search filter for traditional prayers library
  const filteredTraditionalPrayers = TRADITIONAL_PRAYERS.filter(p => 
    p.title.toLowerCase().includes(searchPrayerQuery.toLowerCase()) || 
    p.text.toLowerCase().includes(searchPrayerQuery.toLowerCase())
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? "bg-stone-950 text-stone-100 hallow-stars" : "bg-[#f9f7f3] text-stone-900"} font-sans transition-colors duration-300 flex flex-col relative overflow-hidden`}>
      {isDarkMode && (
        <>
          <div className="absolute top-20 left-10 w-[500px] h-[500px] rounded-full aurora-glow-1 pointer-events-none z-0" />
          <div className="absolute bottom-40 right-10 w-[600px] h-[600px] rounded-full aurora-glow-2 pointer-events-none z-0" />
        </>
      )}
      
      {!user && <AuthOverlay onSuccess={(loggedInUser) => setUser(loggedInUser)} />}
      
      {/* 1. TOP HEADER / APPMARGINS */}
      <header className="border-b border-stone-200 dark:border-stone-850 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-sm bg-white dark:bg-stone-950/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-amber-600 dark:bg-amber-500 text-white dark:text-stone-950 p-2.5 rounded-xl shadow-md cursor-pointer hover:rotate-12 transition-transform">
            <CrossIcon className="h-5.5 w-5.5" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-heading font-bold text-stone-950 dark:text-stone-50 tracking-wider flex items-center gap-2">
              LAUDATE SOLMNI
            </h1>
            <span className="text-[11px] font-mono tracking-widest text-amber-700 dark:text-amber-400 font-bold uppercase">
              Catholic Companion & Liturgical Guide
            </span>
          </div>
        </div>

        {/* Global Control Station */}
        <div className="flex items-center gap-2 md:gap-3.5">
          {user && (
            <div className="flex items-center gap-2 border-r border-stone-200 dark:border-stone-850 pr-3.5 mr-0.5 hidden sm:flex">
              <span className="text-xs font-sans text-stone-600 dark:text-stone-300 font-medium">
                Welcome, <strong className="text-amber-700 dark:text-amber-400 font-semibold">{user.name}</strong>
                {user.isGuest && <span className="text-[10px] text-stone-400 font-mono ml-1 italic">(Guest)</span>}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem("sanctuary_user");
                  setUser(null);
                  triggerNotificationSound();
                }}
                className="text-[10px] font-mono text-rose-600 hover:text-white dark:hover:text-stone-950 hover:bg-rose-650 bg-rose-500/10 dark:bg-rose-500/15 hover:bg-rose-600 px-2 py-1 rounded-lg cursor-pointer transition-colors"
                title="Sign out of your pilgrim portal"
              >
                Sign Out
              </button>
            </div>
          )}

          {/* Offline Mode Indicator */}
          <button
            onClick={() => {
              setIsOfflineMode(!isOfflineMode);
              triggerNotificationSound();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition-colors cursor-pointer border ${
              isOfflineMode 
                ? "bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200 dark:border-red-900/50" 
                : "bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-200 dark:border-emerald-900/50"
            }`}
            title="Toggle Offline Mode integration fallback state"
          >
            {isOfflineMode ? (
              <>
                <WifiOff className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                <span className="hidden sm:inline">Offline Mode</span>
              </>
            ) : (
              <>
                <Wifi className="h-3.5 w-3.5 text-emerald-500" />
                <span className="hidden sm:inline">Cloud Connected</span>
              </>
            )}
          </button>

          {/* Dark Mode toggle */}
          <button
            onClick={() => {
              const nextMode = !isDarkMode;
              setIsDarkMode(nextMode);
              localStorage.setItem("catholic_dark_mode", String(nextMode));
              triggerNotificationSound();
            }}
            className="p-2 border border-stone-200 dark:border-stone-800 rounded-lg text-stone-600 dark:text-stone-300 bg-stone-100/50 dark:bg-stone-900 shadow-inner cursor-pointer"
          >
            {isDarkMode ? <Sun className="h-4.5 w-4.5 text-yellow-400" /> : <Moon className="h-4.5 w-4.5" />}
          </button>

          {/* Notifications status switch */}
          <button
            onClick={() => {
              setNotificationsEnabled(!notificationsEnabled);
              triggerNotificationSound();
            }}
            className={`p-2 border rounded-lg cursor-pointer ${
              notificationsEnabled 
                ? "bg-amber-100 dark:bg-amber-950/30 border-amber-300 text-amber-800 dark:text-amber-400" 
                : "bg-stone-100 dark:bg-stone-900 border-stone-200 dark:border-stone-800 text-stone-400"
            }`}
            title="Toggle simulated Push Notifications alerts"
          >
            <Bell className={`h-4.5 w-4.5 ${notificationsEnabled ? "animate-swing" : ""}`} />
          </button>
        </div>
      </header>

      {/* 2. CORE LAYOUT WRAPPER (DYNAMIC PORTAL LAYOUT SKELETON) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        
        {/* STYLE 2: MONASTIC LEFT DESKTOP SIDEBAR */}
        {navStyle === "monastic_sidebar" && (
          <aside className="hidden lg:flex lg:col-span-3 flex-col gap-5 sticky top-22 self-start pr-2 z-10 animate-fadeIn">
            <div className="bg-white dark:bg-[#12101d] border border-stone-200 dark:border-stone-850/80 rounded-2xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/[0.03] to-transparent pointer-events-none" />
              
              {/* Sacred Monastery Sigil */}
              <div className="flex items-center gap-3 pb-4 mb-4 border-b border-stone-200 dark:border-stone-850/80">
                <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 p-2 rounded-xl text-amber-500 border border-amber-500/20 shadow-inner">
                  <CrossIcon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading font-semibold text-stone-900 dark:text-stone-105 tracking-wider text-xs uppercase">
                    VOTIVE CLOISTER
                  </h4>
                  <span className="text-[9px] font-mono tracking-widest text-[#d4af37] dark:text-amber-400 uppercase block">
                    Monastic Office
                  </span>
                </div>
              </div>

              {/* Navigation List */}
              <div className="flex flex-col gap-1.5">
                {[
                  { id: "reflections", label: "Readings", icon: BookMarked },
                  { id: "rosary", label: "Rosary Companion", icon: Compass },
                  { id: "calendar", label: "Liturgy", icon: Calendar },
                  { id: "novenas", label: "Novenas", icon: Sparkles },
                  { id: "routines", label: "Routines", icon: Award },
                  { id: "trending", label: "Trending", icon: Flame },
                  { id: "sleep_stories", label: "Sleep Stories", icon: Moon },
                  { id: "intentions", label: "Intentions", icon: Heart },
                  { id: "wall", label: "Community", icon: UserCheck },
                  { id: "flashcards", label: "Bible Flashcards", icon: BookOpen },
                ].map(tab => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        triggerNotificationSound();
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-mono font-semibold tracking-wide transition-all cursor-pointer text-left ${
                        isActive 
                          ? "bg-gradient-to-r from-amber-500/10 to-amber-600/[0.02] dark:from-amber-500/10 dark:to-transparent text-[#e5c353] dark:text-amber-400 border border-amber-500/20 shadow-xs" 
                          : "text-stone-550 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-105 hover:bg-stone-50 dark:hover:bg-white/[0.02]"
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <TabIcon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#d4af37] dark:text-amber-450 stroke-[2]" : "text-stone-400 dark:text-stone-500 stroke-[1.5]"}`} />
                        <span>{tab.label}</span>
                      </span>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 dark:bg-amber-450 shadow-lg shadow-amber-550/50 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* Quick Liturgical Design Note */}
            <div className="bg-gradient-to-br from-amber-500/[0.03] to-transparent border border-amber-500/5 rounded-2xl p-4 text-[10px] text-stone-500 dark:text-stone-400 font-sans leading-relaxed">
              <span className="font-heading uppercase tracking-widest text-[#d4af37] dark:text-amber-450 font-semibold block mb-1">
                Monastic Tip
              </span>
              Use the <strong className="text-stone-700 dark:text-stone-300">Layout Studio</strong> above to toggle styles.
            </div>
          </aside>
        )}

        {/* STYLE 3: CATHEDRAL LEFT DESKTOP NAV RAIL */}
        {navStyle === "cathedral_rail" && (
          <aside className="hidden lg:flex lg:col-span-1 flex-col items-center gap-5 sticky top-22 self-start py-5 px-1 bg-white dark:bg-[#12101d] border border-stone-200 dark:border-stone-850/80 rounded-2xl shadow-xl animate-fadeIn">
            <div className="bg-gradient-to-br from-amber-500/15 to-transparent p-2 rounded-xl text-amber-500 border border-amber-500/20 mb-1 shadow-inner">
              <Compass className="h-4.5 w-4.5 animate-pulse" />
            </div>
            
            <div className="flex flex-col gap-3 items-center w-full">
              {[
                { id: "reflections", shortLabel: "READ", icon: BookMarked, tooltip: "Daily Readings" },
                { id: "rosary", shortLabel: "ROSA", icon: Compass, tooltip: "Rosary Companion" },
                { id: "calendar", shortLabel: "LITG", icon: Calendar, tooltip: "Liturgy Calendar" },
                { id: "novenas", shortLabel: "NOVE", icon: Sparkles, tooltip: "Holy Novenas" },
                { id: "routines", shortLabel: "RTNS", icon: Award, tooltip: "Prayer Routines" },
                { id: "trending", shortLabel: "TRND", icon: Flame, tooltip: "Trending List" },
                { id: "sleep_stories", shortLabel: "REPS", icon: Moon, tooltip: "Sleep Stories" },
                { id: "intentions", shortLabel: "INTN", icon: Heart, tooltip: "Your Intentions" },
                { id: "wall", shortLabel: "COMM", icon: UserCheck, tooltip: "Community Feed" },
                { id: "flashcards", shortLabel: "MEMO", icon: BookOpen, tooltip: "Bible Flashcards" },
              ].map(tab => {
                const TabIcon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    title={tab.tooltip}
                    onClick={() => {
                      setActiveTab(tab.id as any);
                      triggerNotificationSound();
                    }}
                    className={`flex flex-col items-center justify-center rounded-xl transition-all duration-200 cursor-pointer w-12 h-12 relative group ${
                      isActive 
                        ? "bg-stone-900 text-[#d4af37] dark:bg-amber-500 dark:text-stone-950 shadow-md font-bold" 
                        : "text-stone-450 hover:text-stone-850 dark:text-stone-400 dark:hover:text-[#d4af37] hover:bg-stone-100 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    <TabIcon className="h-5 w-5" />
                    <span className="text-[7.5px] font-mono tracking-widest mt-1 scale-[0.85] block truncate text-center w-full">
                      {tab.shortLabel}
                    </span>
                    {isActive && (
                      <div className="absolute right-0 top-3 bottom-3 w-0.5 bg-amber-500 rounded-full" />
                    )}
                  </button>
                );
              })}
            </div>
          </aside>
        )}
        
        {/* ACTIVE VIEW COLUMN (Col span 6 vs 7 vs 8 depending on selected style) */}
        <div className={`${
          navStyle === "monastic_sidebar" 
            ? "lg:col-span-6" 
            : navStyle === "cathedral_rail" 
            ? "lg:col-span-7"
            : "lg:col-span-8"
        } flex flex-col gap-6`}>
          
          {/* OFFLINE CAPTIVITY WARNING BANNER */}
          {isOfflineMode && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-300/30 dark:border-amber-900/50 rounded-xl p-3 px-4 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
              <span className="flex items-center gap-2">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-600" />
                Working Offline. Personal intentions, novena steps, and scripture reading challenge save safely to local storage instantly.
              </span>
            </div>
          )}
                {/* THE LUXURY LAYOUT DESIGN STUDIO SELECTOR */}
          <div className="bg-white dark:bg-[#12101e] border border-amber-500/10 dark:border-stone-850/80 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-br from-amber-500/[0.05] to-transparent blur-3xl pointer-events-none" />
            <div className="flex items-start md:items-center gap-3 relative z-10">
              <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 p-2.5 rounded-xl text-amber-500 dark:text-amber-450 border border-amber-500/25 shadow-inner">
                <Sparkles className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#d4af37] dark:text-amber-400 font-bold uppercase block mb-0.5">
                  LAUDATE DESIGN STUDIO
                </span>
                <p className="text-xs text-stone-550 dark:text-stone-400 font-sans leading-relaxed">
                  Toggle the navigation architecture of your digital sanctuary
                </p>
              </div>
            </div>

            {/* Selector Segmented Control */}
            <div className="flex items-center gap-1.5 bg-stone-50 dark:bg-stone-950/80 p-1.5 rounded-xl border border-stone-200/80 dark:border-stone-900 z-10 shrink-0 self-start md:self-auto shadow-inner">
              {[
                { id: "floating_pill", name: "Arch Pill Dock" },
                { id: "monastic_sidebar", name: "Monastic Sidebar" },
                { id: "cathedral_rail", name: "Cathedral Rail" },
              ].map(opt => {
                const isSelected = navStyle === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setNavStyle(opt.id as any);
                      localStorage.setItem("sanctuary_nav_style", opt.id);
                      triggerNotificationSound();
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase tracking-wider cursor-pointer transition-all duration-250 ${
                      isSelected 
                        ? "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 dark:from-amber-400 dark:to-amber-500 dark:text-stone-950 shadow-md font-bold scale-[1.02]" 
                        : "text-stone-500 dark:text-stone-450 hover:text-stone-800 dark:hover:text-stone-105 hover:bg-stone-200/30 dark:hover:bg-white/[0.03]"
                    }`}
                  >
                    {opt.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* DYNAMIC NAVIGATION RENDERING */}
          {navStyle === "floating_pill" && (
            <div className="bg-stone-50/50 dark:bg-stone-950/40 p-1 rounded-2xl border border-stone-200/60 dark:border-stone-850/80 shadow-md">
              <nav className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 px-1">
                {[
                  { id: "reflections", label: "Readings", icon: BookMarked },
                  { id: "rosary", label: "Rosary Companion", icon: Compass },
                  { id: "calendar", label: "Liturgy", icon: Calendar },
                  { id: "novenas", label: "Novenas", icon: Sparkles },
                  { id: "routines", label: "Routines", icon: Award },
                  { id: "trending", label: "Trending", icon: Flame },
                  { id: "sleep_stories", label: "Sleep Stories", icon: Moon },
                  { id: "intentions", label: "Intentions", icon: Heart },
                  { id: "wall", label: "Community", icon: UserCheck },
                  { id: "flashcards", label: "Bible Flashcards", icon: BookOpen },
                ].map(tab => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        triggerNotificationSound();
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-semibold tracking-wide transition-all cursor-pointer flex-shrink-0 relative ${
                        isActive 
                          ? "bg-stone-900 text-[#d4af37] dark:bg-amber-500 dark:text-stone-950 font-bold shadow-lg shadow-amber-500/5 transform -translate-y-0.5" 
                          : "text-stone-500 hover:text-stone-850 dark:text-stone-400 dark:hover:text-stone-105 hover:bg-stone-200/50 dark:hover:bg-stone-900/40"
                      }`}
                    >
                      <TabIcon className="h-4 w-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {navStyle === "cathedral_rail" && (
            <div className="bg-transparent border-b border-stone-200 dark:border-stone-850/80 pb-1 lg:hidden">
              <nav className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1">
                {[
                  { id: "reflections", label: "READINGS", icon: BookMarked },
                  { id: "rosary", label: "ROSARY", icon: Compass },
                  { id: "calendar", label: "LITURGY", icon: Calendar },
                  { id: "novenas", label: "NOVENAS", icon: Sparkles },
                  { id: "routines", label: "ROUTINES", icon: Award },
                  { id: "trending", label: "TRENDING", icon: Flame },
                  { id: "sleep_stories", label: "REPOSE", icon: Moon },
                  { id: "intentions", label: "INTENTIONS", icon: Heart },
                  { id: "wall", label: "COMMUNITY", icon: UserCheck },
                  { id: "flashcards", label: "MEMORIZE", icon: BookOpen },
                ].map(tab => {
                  const TabIcon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        triggerNotificationSound();
                      }}
                      className={`flex flex-col items-center gap-2 px-3 py-2 text-[10px] font-heading tracking-widest transition-all cursor-pointer flex-shrink-0 relative group`}
                    >
                      <TabIcon className={`h-4.5 w-4.5 transition-colors duration-250 ${isActive ? "text-[#d4af37] dark:text-amber-450 stroke-[2.5]" : "text-stone-400 dark:text-stone-500 group-hover:text-[#d4af37]"}`} />
                      <span className={`transition-all duration-250 ${isActive ? "text-[#d4af37] dark:text-amber-450 font-bold" : "text-stone-500 dark:text-stone-400 group-hover:text-stone-850 dark:group-hover:text-stone-250"}`}>
                        {tab.label}
                      </span>
                      {isActive && (
                        <div className="absolute bottom-0 left-1 right-1 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent rounded-full animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          )}

          {/* Fallback Mobile Top Header when in Monastic Sidebar view style */}
          {navStyle === "monastic_sidebar" && (
            <div className="flex flex-col gap-2">
              {/* Desktop breadcrumb */}
              <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#d4af37] dark:text-amber-450 uppercase p-2 border-b border-stone-200/40 dark:border-stone-800/20 select-none animate-fadeIn">
                <span>⛪ CLAUSTRO VIRTUAL</span>
                <span className="opacity-40">/</span>
                <span className="font-bold">{activeTab.toUpperCase()} ACTIVE</span>
              </div>

              {/* Mobile horizontal scrolling rail for Monastic style (because the sidebar column is hidden on mobile!) */}
              <div className="lg:hidden bg-stone-50/50 dark:bg-stone-950/40 p-1 rounded-2xl border border-stone-200/60 dark:border-stone-850/80 shadow-md">
                <nav className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                  {[
                    { id: "reflections", label: "Readings", icon: BookMarked },
                    { id: "rosary", label: "Rosary Companion", icon: Compass },
                    { id: "calendar", label: "Liturgy", icon: Calendar },
                    { id: "novenas", label: "Novenas", icon: Sparkles },
                    { id: "routines", label: "Routines", icon: Award },
                    { id: "trending", label: "Trending", icon: Flame },
                    { id: "sleep_stories", label: "Sleep Stories", icon: Moon },
                    { id: "intentions", label: "Intentions", icon: Heart },
                    { id: "wall", label: "Community", icon: UserCheck },
                    { id: "flashcards", label: "Bible Flashcards", icon: BookOpen },
                  ].map(tab => {
                    const TabIcon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => {
                          setActiveTab(tab.id as any);
                          triggerNotificationSound();
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono font-semibold tracking-wide transition-all cursor-pointer flex-shrink-0 relative ${
                          isActive 
                            ? "bg-stone-900 text-[#d4af37] dark:bg-amber-500 dark:text-stone-950 font-bold" 
                            : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-105"
                        }`}
                      >
                        <TabIcon className="h-3.5 w-3.5" />
                        <span>{tab.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* VIEW CONTROLLER SCREEN */}
          
          {/* TAB 1: DAILY REFLECTIONS & DEVOTIONALS */}
          {activeTab === "reflections" && (
            <div className="space-y-6">
              
              {/* TODAY'S DEVOTION SHEET (Ivory design or twilight slate) */}
              <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all">
                
                {/* Liturgical ribbon tag */}
                <div className="absolute top-0 right-12 w-8 h-12 bg-emerald-600 dark:bg-emerald-700 shadow-sm flex items-center justify-center text-white text-[10px] uppercase font-bold tracking-widest text-vertical" title="Ordinary Time Season Symbol">
                  <span className="font-sans">O</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase bg-amber-50 dark:bg-amber-950/45 text-amber-700 dark:text-amber-400 px-2.5 py-0.5 rounded-full font-bold">
                    Daily Reflection
                  </span>
                  <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500">
                    {todayReflection?.date ? new Date(todayReflection.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : "Today"}
                  </span>
                </div>

                {isLoadingReflection ? (
                  <div className="py-12 text-center text-stone-450 flex flex-col items-center justify-center gap-2 font-mono text-xs">
                    <RefreshCw className="h-6 w-6 animate-spin text-amber-600" />
                    Discernment of daily scriptures in progress...
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl md:text-2xl font-heading font-bold text-stone-900 dark:text-stone-50 mb-3 tracking-wide">
                      {todayReflection?.title}
                    </h3>

                    {/* Holy Verse pullquote */}
                    <div className="my-5 pl-4 border-l-4 border-amber-600 dark:border-amber-550 italic bg-stone-50 dark:bg-stone-900/50 p-4 rounded-r-xl">
                      <p className="text-sm md:text-base text-stone-700 dark:text-stone-300 leading-relaxed font-sans font-light">
                        "{todayReflection?.verse}"
                      </p>
                      <cite className="block text-xs font-mono font-bold text-amber-700 dark:text-amber-400 mt-2 uppercase tracking-wide">
                        — {todayReflection?.reference || "Universal Liturgy"}
                      </cite>
                    </div>

                    <div className="text-sm md:text-base text-stone-800 dark:text-stone-350 leading-relaxed font-sans space-y-3 font-normal max-w-3xl">
                      {todayReflection?.reflectionText.split("\n\n").map((para, i) => (
                        <p key={i}>{para}</p>
                      ))}
                    </div>

                    {/* Morning & Evening prayers */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-5 border-t border-stone-200/60 dark:border-stone-850">
                      <div className="bg-[#fcfbf9] dark:bg-stone-900/60 border border-stone-150 dark:border-stone-800 p-4 rounded-xl">
                        <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-bold tracking-widest block mb-1">
                          🌅 Morning Prayer of Surrender
                        </span>
                        <p className="text-xs text-stone-700 dark:text-stone-400 leading-relaxed italic">
                          {todayReflection?.morningPrayer}
                        </p>
                      </div>
                      <div className="bg-[#fcfbf9] dark:bg-stone-900/60 border border-stone-150 dark:border-stone-800 p-4 rounded-xl">
                        <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 uppercase font-bold tracking-widest block mb-1">
                          🌌 Evening Examen Resolution
                        </span>
                        <p className="text-xs text-stone-700 dark:text-stone-400 leading-relaxed italic">
                          {todayReflection?.eveningPrayer}
                        </p>
                      </div>
                    </div>

                  </div>
                )}

                {/* Focus input to let users update reflection base via Gemini model API */}
                <div className="mt-6 pt-5 border-t border-stone-200/60 dark:border-stone-850">
                  <label className="text-xs font-mono text-stone-500 block mb-2">
                    💡 Seek Reflection for a Specific Trial or Focus? (E.g. Grief, Job hunt, Forgiveness, Saint Francis)
                  </label>
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      className="text-xs border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-2 bg-stone-50 dark:bg-stone-950 flex-1 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      placeholder="Enter a word, trial, or saint name..."
                      value={reflectionFocus}
                      onChange={(e) => setReflectionFocus(e.target.value)}
                    />
                    <button
                      onClick={() => fetchTodayReflection(reflectionFocus)}
                      className="px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-mono font-bold rounded-lg hover:bg-stone-800 cursor-pointer"
                    >
                      Refocus Liturgy
                    </button>
                    {reflectionFocus && (
                      <button
                        onClick={() => {
                          setReflectionFocus("");
                          fetchTodayReflection();
                        }}
                        className="text-xs text-stone-400 hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* SANCTUARY ALTAR & ACTIVE PRAYER LAMPS GRID */}
              <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-stone-100 dark:border-stone-900">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-600 dark:text-amber-400">
                      <Flame className="h-5 w-5 animate-pulse text-amber-500 fill-current" />
                    </div>
                    <div>
                      <h4 className="text-base font-heading font-medium text-stone-900 dark:text-stone-50">
                        Sanctuary Altar of Prayer Lamps
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Your active personal intentions are manifested as custom-glowing votives burning before the Blessed Sacrament.
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-[10px] font-mono text-stone-500 bg-stone-100 dark:bg-stone-900 px-2.5 py-1 rounded-lg">
                    ACTIVE FIRES: {personalIntentions.filter(item => !item.answered).length} LIT
                  </div>
                </div>

                {/* Votives Altar Box */}
                <div className="relative w-full bg-[#fcfbf9]/50 dark:bg-stone-950/20 border border-stone-200/50 dark:border-stone-850/50 rounded-2xl p-6 md:p-8 flex flex-col items-center justify-center overflow-hidden min-h-[220px]">
                  
                  {/* Subtle gothic backdrop window or cross indicator */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 opacity-[0.03] dark:opacity-[0.05] pointer-events-none text-stone-900 dark:text-white select-none">
                    <CrossIcon className="h-40 w-40" />
                  </div>

                  {personalIntentions.filter(item => !item.answered).length === 0 ? (
                    /* EMPTY SANCTUARY PRESENCE */
                    <div className="text-center py-6 max-w-sm mx-auto z-10 animate-fadeIn">
                      <div className="flex justify-center gap-4 mb-4 opacity-35">
                        <div className="w-8 h-12 border border-dashed border-stone-300 dark:border-stone-750 bg-stone-100/10 rounded-t-md rounded-b-sm flex flex-col items-center justify-end pb-1 text-[8px] text-stone-400 font-mono">ordinary</div>
                        <div className="w-8 h-14 border border-dashed border-stone-300 dark:border-stone-750 bg-stone-100/10 rounded-t-md rounded-b-sm flex flex-col items-center justify-end pb-1 text-[8px] text-stone-400 font-mono">discern</div>
                        <div className="w-8 h-12 border border-dashed border-stone-300 dark:border-stone-750 bg-stone-100/10 rounded-t-md rounded-b-sm flex flex-col items-center justify-end pb-1 text-[8px] text-stone-400 font-mono">healing</div>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed font-sans mb-3">
                        The sanctuary stands in quiet expectation. No active prayer lamps are burning at this hour.
                      </p>
                      <button
                        onClick={() => setActiveTab("intentions")}
                        className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 rounded-lg text-xs font-mono text-stone-700 dark:text-stone-350 transition-colors border border-stone-200 dark:border-stone-800 cursor-pointer"
                      >
                        + Light a Personal Votive
                      </button>
                    </div>
                  ) : (
                    /* CORE ACTIVE LAMPS GRID */
                    <div className="w-full space-y-6 z-10">
                      <div className="flex flex-wrap justify-center gap-x-8 gap-y-10 pb-2">
                        {personalIntentions.filter(item => !item.answered).map(item => {
                          const catConfig = getCategoryConfig(item.category);
                          const isSelectedDetail = votiveDetailId === item.id;
                          
                          return (
                            <div 
                              key={item.id}
                              onClick={() => setVotiveDetailId(isSelectedDetail ? null : item.id)}
                              className="group relative flex flex-col items-center cursor-pointer select-none"
                            >
                              {/* Votive Glass Holder */}
                              <div 
                                className={`w-14 h-18 bg-stone-50 dark:bg-stone-900 border-x border-b border-t-2 rounded-t-md rounded-b-lg flex flex-col items-center justify-end pb-2.5 shadow-md relative transition-all duration-300 transform group-hover:scale-108 group-hover:-translate-y-1 ${
                                  isSelectedDetail 
                                    ? "ring-2 ring-amber-500 scale-108 -translate-y-1 shadow-lg border-stone-300" 
                                    : "border-stone-200 dark:border-stone-800 hover:border-stone-300"
                                }`}
                                style={{
                                  borderTopColor: catConfig.hex,
                                  boxShadow: isSelectedDetail ? `0 4px 12px ${catConfig.hex}30` : `0 2px 4px rgba(0,0,0,0.05)`
                                }}
                              >
                                {/* Glowing Flame Assembly */}
                                <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                                  
                                  {/* Pulsing Light Aura Glow */}
                                  <div 
                                    className="absolute -top-1 w-8 h-8 rounded-full opacity-35 blur-xs animate-pulse transition-all duration-300"
                                    style={{ 
                                      backgroundColor: catConfig.hex,
                                      boxShadow: `0 0 14px 6px ${catConfig.hex}`
                                    }}
                                  />
                                  
                                  {/* Micro flicker aura */}
                                  <div 
                                    className="absolute -top-2 w-10 h-10 rounded-full opacity-15 blur-md animate-ping"
                                    style={{ backgroundColor: catConfig.hex }}
                                  />

                                  {/* Actual Flame Graphic */}
                                  <Flame 
                                    className="h-5 w-5 animate-bounce fill-current"
                                    style={{ color: catConfig.hex }}
                                  />
                                </div>

                                {/* Monogram abbreviation of the title on glass vessel */}
                                <span className="text-[10px] font-mono tracking-widest text-stone-400 dark:text-stone-500 font-bold uppercase z-10">
                                  {item.title.trim().substring(0, 2)}
                                </span>
                              </div>

                              {/* Shelf Shadow Base Anchor */}
                              <div className="absolute bottom-[-10px] w-16 h-1.5 bg-black/5 dark:bg-black/30 rounded-full blur-xs pointer-events-none group-hover:scale-110 transition-all duration-300" />

                              {/* Title labels block */}
                              <div className="mt-3 text-center max-w-[100px]">
                                <span className="text-[10px] font-sans font-bold text-stone-800 dark:text-stone-200 line-clamp-1 block">
                                  {item.title}
                                </span>
                                <span 
                                  className="text-[8px] font-mono uppercase tracking-widest block font-extrabold"
                                  style={{ color: catConfig.hex }}
                                >
                                  {catConfig.name.split(" ")[0]}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Interactive Glass Shelf Stand Shadow */}
                      <div className="w-full h-1 bg-linear-to-r from-transparent via-stone-300/60 to-transparent dark:via-stone-750/50 rounded-full shadow-inner" />
                    </div>
                  )}

                  {/* DRAWER/CARD DETAIL PREVIEW FOR CRITICAL DETAILED DEVOTION */}
                  {votiveDetailId && (() => {
                    const detailedInt = personalIntentions.find(item => item.id === votiveDetailId);
                    if (!detailedInt) return null;
                    const catConfig = getCategoryConfig(detailedInt.category);
                    
                    return (
                      <div className="w-full mt-6 bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 rounded-xl p-4 shadow-md text-left relative animate-fadeIn z-20">
                        {/* Close button */}
                        <button 
                          onClick={() => setVotiveDetailId(null)}
                          className="absolute top-3 right-3 p-1 px-2 text-stone-400 hover:text-stone-600 rounded bg-stone-50 dark:bg-stone-800 text-xs font-mono font-bold cursor-pointer"
                        >
                          ✕ Close
                        </button>

                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase tracking-wider font-semibold border ${catConfig.badge}`}>
                            {catConfig.name}
                          </span>
                          <span className="text-[9px] font-mono text-stone-450 dark:text-stone-500">
                            Lit on {new Date(detailedInt.createdAt).toLocaleDateString()}
                          </span>
                        </div>

                        <h5 className="font-heading font-bold text-sm text-stone-950 dark:text-stone-50 flex items-center gap-1.5 mb-1">
                          <span>{detailedInt.title}</span>
                        </h5>
                        
                        <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed font-sans mb-3">
                          {detailedInt.description || "No supplemental details supplied for this pleading."}
                        </p>

                        {detailedInt.notes && (
                          <div className="p-2.5 rounded bg-stone-50 dark:bg-stone-950/40 border border-stone-150 dark:border-stone-850 text-[11px] text-stone-603 dark:text-stone-403 italic mb-3">
                            <strong>Note:</strong> "{detailedInt.notes}"
                          </div>
                        )}

                        <div className="pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 flex-wrap">
                          {/* Inner Action buttons */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => {
                                handleMarkAnswered(detailedInt.id);
                                setVotiveDetailId(null);
                              }}
                              className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-sans text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Check className="h-3 w-3" /> Mark Answered
                            </button>
                            <button
                              onClick={() => {
                                setVotiveDetailId(null);
                                setActiveTab("intentions");
                                setSelectedIntentionIdForNotes(detailedInt.id);
                              }}
                              className="px-2.5 py-1.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-350 font-sans text-[10px] rounded-lg cursor-pointer flex items-center gap-1 border border-stone-200 dark:border-stone-750"
                            >
                              Add Journal Note
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* BRAND NEW: DAILY LITURGICAL SEASON SAINT AFFIRMATION */}
              <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl p-6 shadow-sm relative overflow-hidden transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 pb-4 border-b border-stone-100 dark:border-stone-900">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500/10 p-2.5 rounded-xl text-amber-600 dark:text-amber-400">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-heading font-bold text-stone-900 dark:text-stone-50">
                        Seasonal Saintly Affirmation
                      </h4>
                      <p className="text-xs text-stone-500 dark:text-stone-400">
                        Receive daily wisdom and positive Catholic affirmations inspired by the great saints of the Roman calendar.
                      </p>
                    </div>
                  </div>
                  
                  {/* Season selector */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400">Select Season:</span>
                    <select
                      value={selectedAffirmationSeason}
                      onChange={(e) => {
                        const newSeason = e.target.value as LiturgicalSeason;
                        setSelectedAffirmationSeason(newSeason);
                        fetchAffirmation(newSeason);
                      }}
                      className="text-xs border border-stone-200 dark:border-stone-800 rounded-lg py-1.5 px-3 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500 font-sans"
                    >
                      <option value="Ordinary Time">Ordinary Time</option>
                      <option value="Lent">Lent (Sacrifice & Penance)</option>
                      <option value="Easter">Easter Season (Joy & Victories)</option>
                      <option value="Advent">Advent (Joyful Waiting)</option>
                      <option value="Christmas">Christmas Cycle (Emmanuel)</option>
                    </select>
                  </div>
                </div>

                {isGeneratingAffirmation ? (
                  <div className="py-12 text-center text-stone-400 flex flex-col items-center justify-center gap-2 font-mono text-xs">
                    <RefreshCw className="h-6 w-6 animate-spin text-amber-600" />
                    Interceding with the saints via Gemini model...
                  </div>
                ) : affirmationData ? (
                  <div className="space-y-5 animate-fadeIn">
                    {/* Season Banner */}
                    <div className="bg-stone-50 dark:bg-stone-900/40 border border-stone-200/40 dark:border-stone-800/40 rounded-xl px-4 py-3 flex items-center justify-between text-xs text-stone-700 dark:text-stone-300">
                      <div className="flex items-center gap-2 font-mono">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span>Active Liturgical Season: <strong className="text-amber-700 dark:text-amber-400 font-sans">{affirmationData.liturgicalSeason}</strong></span>
                      </div>
                      <span className="text-[10px] font-mono bg-stone-200/50 dark:bg-stone-800/60 px-2 py-0.5 rounded text-stone-500">
                        {affirmationData.simulated ? "Static Meditational Profile" : "AI Custom Affirmation"}
                      </span>
                    </div>

                    {/* Saint Quote */}
                    <div className="relative p-5 bg-amber-50/15 dark:bg-amber-950/5 border border-amber-500/10 rounded-xl overflow-hidden font-sans">
                      <div className="absolute top-2 right-4 text-amber-500/10 dark:text-amber-500/5 font-serif text-8xl leading-none select-none pointer-events-none">“</div>
                      <blockquote className="text-sm md:text-base text-stone-800 dark:text-stone-200 leading-relaxed font-sans font-light italic max-w-4xl">
                        "{affirmationData.quote}"
                      </blockquote>
                      <cite className="block text-xs font-mono font-bold text-amber-700 dark:text-amber-400 mt-2 uppercase tracking-wide">
                        — {affirmationData.saintName}
                      </cite>
                    </div>

                    {/* Core Affirmation statement */}
                    <div className="border border-stone-200 dark:border-stone-800 rounded-xl p-5 bg-stone-50/40 dark:bg-stone-950">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-700 dark:text-emerald-400 block mb-2 font-bold font-heading">
                        My Saint-Inspired Daily Affirmation:
                      </span>
                      <p className="text-sm font-sans font-medium text-stone-900 dark:text-stone-100 border-l-2 border-emerald-500 pl-3 leading-relaxed">
                        {affirmationData.affirmation}
                      </p>
                    </div>

                    {/* Spiritual Contemplation */}
                    <div className="p-4 rounded-xl bg-orange-50/10 dark:bg-orange-950/5 border border-orange-200/10">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-orange-700 dark:text-orange-400 block mb-2 font-bold font-heading">
                        Spiritual Director Contemplation:
                      </span>
                      <p className="text-xs text-stone-700 dark:text-stone-400 leading-relaxed font-sans">
                        {affirmationData.contemplation}
                      </p>
                    </div>

                    {/* Action controls */}
                    <div className="flex justify-end pt-2">
                      <button
                        onClick={() => fetchAffirmation(selectedAffirmationSeason)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-250 dark:border-stone-700 hover:bg-stone-50 dark:hover:bg-stone-900 rounded-lg text-xs font-mono text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="h-3.5 w-3.5 animate-hover-spin" />
                        Fresh Affirmation
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* DYNAMIC COMPASSIONATE DEVOTIONAL DRAWER (GEMINI INTERACTIVE DEVOTIONAL) */}
              <div className="bg-amber-50/20 dark:bg-amber-950/5 border border-amber-500/10 rounded-2xl p-6 shadow-xs">
                <div className="flex gap-3 mb-4">
                  <div className="bg-amber-500/15 p-2 rounded-lg text-amber-600 dark:text-amber-400 h-10 w-10 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-base font-heading font-medium text-stone-900 dark:text-stone-50">
                      Personalized Contemplative Devotional Generator
                    </h4>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      Input your present spiritual state, and gain a customized Catholic devotional homily with Saintly intercessors.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-400 block mb-1">Your Present Spiritual Mood:</label>
                    <select
                      value={devotionalMood}
                      onChange={(e) => setDevotionalMood(e.target.value)}
                      className="text-xs border border-stone-200 dark:border-stone-800 rounded-lg p-2 bg-white dark:bg-stone-950 w-full text-stone-950 dark:text-stone-100"
                    >
                      <option value="trusting">Trusting & Hopeful</option>
                      <option value="weary">Weary & Burdened</option>
                      <option value="grieving">Grieving Loss</option>
                      <option value="distracted">Distracted / Seeking Discipline</option>
                      <option value="thankful">Filled with thanksgiving</option>
                      <option value="discerning">Discerning a vocation</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-mono uppercase tracking-wider text-stone-400 block mb-1">Your Pressing Intention (Optional):</label>
                    <input
                      type="text"
                      className="text-xs border border-stone-200 dark:border-stone-800 rounded-lg p-2 bg-white dark:bg-stone-950 w-full text-stone-950 dark:text-stone-100"
                      placeholder="My grandfather's chest issue, finding focus..."
                      value={devotionalIntention}
                      onChange={(e) => setDevotionalIntention(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  onClick={generateDevotional}
                  disabled={isGeneratingDevotional}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white p-2.5 rounded-xl cursor-pointer font-heading font-bold tracking-wider text-xs shadow disabled:opacity-40"
                >
                  {isGeneratingDevotional ? "Drawing grace from theological models..." : "Generate Guided Homily"}
                </button>

                {generatedDevotional && (
                  <div className="mt-5 p-5 bg-white dark:bg-stone-950 border border-amber-500/10 rounded-xl max-h-72 overflow-y-auto">
                    <span className="text-[9px] font-mono uppercase tracking-widest text-amber-700 bg-amber-100/40 px-2 py-0.5 rounded block w-max mb-3 font-bold">
                      {generatedDevotional.simulated ? "Static Meditative Prescription" : "Custom Guided Devotional Counsel"}
                    </span>
                    <p className="text-xs text-stone-850 dark:text-stone-200 whitespace-pre-wrap leading-relaxed font-sans italic">
                      {generatedDevotional.text}
                    </p>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 2: INTERACTIVE AUDIO ROSARY */}
          {activeTab === "rosary" && (
            <div className="space-y-4">
              <AudioRosary onRosaryComplete={incrementPrayerStats} />
            </div>
          )}

          {/* TAB 3: LITURGICAL CALENDAR FEAST DAYS */}
          {activeTab === "calendar" && (
            <div className="space-y-6">
              
              {/* Season status block */}
              <div className="bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-500/10 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-600 dark:bg-emerald-500 text-white rounded-xl p-2.5">
                    <Calendar className="h-5.5 w-5.5" />
                  </div>
                  <div>
                    <h4 className="text-base font-heading font-medium text-emerald-950 dark:text-emerald-300">
                      Present Season: Ordinary Time
                    </h4>
                    <p className="text-xs text-stone-600 dark:text-stone-400">
                      The color is Green representing growth, hope, and lifecycle expectation following Pentecost.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {["violet", "green", "white", "red", "rose"].map(color => (
                    <div 
                      key={color} 
                      className={`h-4 w-4 rounded-full border border-stone-200/60`} 
                      style={{
                        backgroundColor: 
                          color === 'violet' ? '#7c3aed' : 
                          color === 'green' ? '#059669' : 
                          color === 'white' ? '#f5f5f4' : 
                          color === 'red' ? '#dc2626' : '#ec4899'
                      }}
                      title={`Liturgical Color Symbol: ${color}`}
                    />
                  ))}
                </div>
              </div>

              {/* Liturgical Feast Days List */}
              <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl p-6">
                <h3 className="text-lg font-heading font-semibold text-stone-950 dark:text-stone-50 mb-4 border-b border-stone-100 dark:border-stone-900 pb-2">
                  Liturgical Calendar & Feast Days (2026)
                </h3>

                <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                  {FEAST_DAYS.map(feast => {
                    const monthDay = feast.date.split("-");
                    const dateObj = new Date(2026, Number(monthDay[0]) - 1, Number(monthDay[1]));
                    return (
                      <div key={feast.id} className="p-4 border border-stone-150 dark:border-stone-850 rounded-xl hover:border-amber-500/25 transition-all">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            {/* Color tag */}
                            <span 
                              className="h-2.5 w-2.5 rounded-full inline-block"
                              style={{
                                backgroundColor: 
                                  feast.color === 'rose' ? '#ec4899' :
                                  feast.color === 'violet' ? '#8b5cf6' :
                                  feast.color === 'red' ? '#ef4444' :
                                  feast.color === 'green' ? '#10b981' : '#d6d3d1'
                              }}
                            />
                            <span className="text-[10px] font-mono tracking-widest text-[#8b5c1a] dark:text-amber-400 font-bold uppercase">
                              {feast.feastLevel}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-stone-400 dark:text-stone-500">
                            {dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>

                        <h4 className="font-heading text-base font-semibold text-stone-950 dark:text-stone-100">
                          {feast.title}
                        </h4>
                        <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 font-sans">
                          {feast.description}
                        </p>
                        {feast.saintBrief && (
                          <div className="mt-3 bg-stone-50 dark:bg-stone-900/60 p-2.5 rounded-lg border-l-2 border-stone-300 dark:border-stone-700 text-xs text-stone-500 dark:text-stone-400">
                            <strong>Saint Wisdom:</strong> {feast.saintBrief}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: NOVENAS CURATED LIBRARY */}
          {activeTab === "novenas" && (
            <div className="space-y-6">
              
              <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl p-6">
                <h3 className="text-lg font-heading font-semibold text-stone-950 dark:text-stone-50 mb-2">
                  Traditional Catholics Novenas Library
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-6 font-sans">
                  A novena is a traditional practice of nine consecutive days of pleading for an intention, mirroring the nine days the apostles prayed in the Upper Room prior to Pentecost.
                </p>

                {/* Selected Novena Detail Panel */}
                {selectedNovenaId ? (
                  (() => {
                    const activeNov = activeNovenas.find(n => n.id === selectedNovenaId);
                    if (!activeNov) return null;
                    const isCompleted = activeNov.completedDays.length === 9;
                    const currentDayData = activeNov.prayersByDay[activeNov.currentDay - 1] || activeNov.prayersByDay[0];
                    const isDayDone = activeNov.completedDays.includes(activeNov.currentDay);

                    return (
                      <div className="border border-amber-500/20 bg-amber-50/5 dark:bg-amber-950/5 rounded-xl p-5 mb-8">
                        <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-stone-850 pb-3 mb-4">
                          <div>
                            <span className="text-[10px] font-mono text-amber-700 uppercase font-bold tracking-widest">Active Spiritual Shield</span>
                            <h4 className="font-heading text-lg font-bold text-stone-950 dark:text-stone-100">{activeNov.title}</h4>
                          </div>
                          <button
                            onClick={() => setSelectedNovenaId(null)}
                            className="text-xs text-stone-400 hover:text-stone-650"
                          >
                            Back to Library
                          </button>
                        </div>

                        {/* Traditional Days Progress */}
                        <div className="flex items-center justify-between gap-1.5 mb-5 overflow-x-auto py-1">
                          {activeNov.prayersByDay.map(day => {
                            const isDone = activeNov.completedDays.includes(day.day);
                            const isActive = activeNov.currentDay === day.day;
                            return (
                              <button
                                key={day.day}
                                onClick={() => {
                                  // Can toggle to view past days, but set current day for prayer
                                  const updated = activeNovenas.map(n => {
                                    if (n.id === activeNov.id) {
                                      return { ...n, currentDay: day.day };
                                    }
                                    return n;
                                  });
                                  saveNovenasToStorage(updated);
                                }}
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all cursor-pointer ${
                                  isDone 
                                    ? "bg-emerald-600 text-white" 
                                    : isActive 
                                      ? "bg-amber-500 text-stone-900 ring-2 ring-amber-200 dark:ring-amber-900 scale-110" 
                                      : "bg-stone-100 dark:bg-stone-900 text-stone-400 hover:bg-stone-200"
                                }`}
                              >
                                {day.day}
                              </button>
                            );
                          })}
                        </div>

                        {isCompleted ? (
                          <div className="text-center py-6">
                            <Award className="h-10 w-10 text-yellow-500 mx-auto mb-2 animate-bounce" />
                            <h5 className="font-heading font-medium text-base text-stone-900 dark:text-stone-100">Novena Fully Completed!</h5>
                            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto leading-relaxed">
                              You have persevered for nine days in communion with the saints! May God grant peace to your intentions.
                            </p>
                            <button
                              onClick={() => handleResetNovena(activeNov.id)}
                              className="mt-4 px-4 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 text-xs font-mono font-medium rounded-lg hover:bg-stone-850 cursor-pointer"
                            >
                              Restart Novena Progress
                            </button>
                          </div>
                        ) : (
                          <div className="bg-white dark:bg-stone-950 rounded-lg p-4 border border-stone-150 dark:border-stone-850">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-400">
                                DAY {activeNov.currentDay} • Active Devotion
                              </span>
                              <span className="text-xs text-stone-500 select-none">
                                Intention focus: {currentDayData.intentionBrief}
                              </span>
                            </div>

                            <p className="text-sm text-stone-850 dark:text-stone-200 italic leading-relaxed whitespace-pre-wrap py-3 border-t border-b border-stone-100 dark:border-stone-900">
                              "{currentDayData.prayer}"
                            </p>

                            <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                              <span className="text-xs text-stone-400">Make sure to recite with a quiet, loving heart.</span>
                              <button
                                onClick={() => handleCompleteNovenaDay(activeNov.id, activeNov.currentDay)}
                                disabled={isDayDone}
                                className={`px-4 py-2 rounded-lg font-heading text-xs font-bold tracking-wider cursor-pointer transition-colors ${
                                  isDayDone 
                                    ? "bg-emerald-100 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300 pointer-events-none" 
                                    : "bg-amber-600 hover:bg-amber-700 text-white shadow"
                                }`}
                              >
                                {isDayDone ? "✓ Day Completed!" : "Mark Day Complete"}
                              </button>
                            </div>
                          </div>
                        )}

                        <div className="mt-4 text-right">
                          <button
                            onClick={() => handleResetNovena(activeNov.id)}
                            className="text-xs text-stone-400 hover:text-red-505"
                          >
                            Reset Novena Days
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeNovenas.map(novena => {
                      const progressCount = novena.completedDays.length;
                      return (
                        <div key={novena.id} className="p-4 border border-stone-200 dark:border-stone-800 rounded-xl hover:border-amber-500/25 transition-all flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block mb-1">
                              Target: {novena.targetSaint}
                            </span>
                            <h4 className="font-heading text-base font-bold text-stone-950 dark:text-stone-100">
                              {novena.title}
                            </h4>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 lines-clamp-2">
                              {novena.description}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-900 flex items-center justify-between">
                            <span className="text-xs font-mono text-amber-700 dark:text-amber-400">
                              Progress: {progressCount} / 9 days complete
                            </span>
                            <button
                              onClick={() => {
                                if (novena.currentDay === 0) {
                                  handleStartNovena(novena.id);
                                } else {
                                  setSelectedNovenaId(novena.id);
                                }
                              }}
                              className="px-3.5 py-1.5 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-950 font-heading tracking-wide text-[10px] font-bold rounded-lg hover:scale-105 transition-transform cursor-pointer"
                            >
                              {novena.currentDay === 0 ? "Begin Novena" : "Resume Novena"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 5: PERSONAL PRAYER INTENTIONS */}
          {activeTab === "intentions" && (
            <div className="space-y-6">
              
              {/* New Intention Creation Form */}
              <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl p-6">
                <h3 className="text-lg font-heading font-semibold text-stone-950 dark:text-stone-50 mb-3 block">
                  Add Personal Prayer Intention
                </h3>
                
                <form onSubmit={handleAddIntention} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-mono text-stone-500 block mb-1">Intention / Pleading Title:</label>
                      <input 
                        type="text"
                        value={newIntentionTitle}
                        onChange={(e) => setNewIntentionTitle(e.target.value)}
                        className="text-xs border border-stone-200 dark:border-stone-800 rounded-lg p-2.5 bg-stone-50 dark:bg-stone-950 w-full text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="E.g., Grandad's safe cardiac surgery..."
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-stone-500 block mb-1">Brief Description / Intention Context:</label>
                      <input 
                        type="text"
                        value={newIntentionDesc}
                        onChange={(e) => setNewIntentionDesc(e.target.value)}
                        className="text-xs border border-stone-200 dark:border-stone-850 rounded-lg p-2.5 bg-stone-50 dark:bg-stone-950 w-full text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                        placeholder="E.g., Give courage to doctors and help my family be calm..."
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-stone-500 block mb-1">Symbolic Color & Category:</label>
                      <select 
                        value={newIntentionCategory}
                        onChange={(e) => setNewIntentionCategory(e.target.value)}
                        className="text-xs border border-stone-200 dark:border-stone-850 rounded-lg p-2.5 bg-stone-50 dark:bg-stone-950 w-full text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      >
                        {INTENTION_CATEGORIES.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name} ({cat.color.toUpperCase()})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Symbolic category quick-select & explanation bar */}
                  <div className="p-3 bg-stone-50 dark:bg-stone-900/55 rounded-xl border border-stone-150 dark:border-stone-850">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-stone-400 block mb-2">
                       Liturgical Votive Color Symbolism (Select to assign):
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                      {INTENTION_CATEGORIES.map(cat => (
                        <div 
                          key={cat.id} 
                          onClick={() => setNewIntentionCategory(cat.id)}
                          className={`p-2 rounded-lg border text-center cursor-pointer transition-all ${
                            newIntentionCategory === cat.id 
                              ? "bg-amber-50/20 dark:bg-amber-950/10 border-amber-500/60 scale-102" 
                              : "border-transparent opacity-80 hover:opacity-100 hover:bg-stone-100/50 dark:hover:bg-stone-800/40"
                          }`}
                          title={cat.description}
                        >
                          <div 
                            className="w-3.5 h-3.5 rounded-full mx-auto mb-1 shadow-sm transition-all animate-pulse"
                            style={{ 
                              backgroundColor: cat.hex,
                              boxShadow: `0 0 8px ${cat.hex}80` 
                            }}
                          />
                          <span className="text-[9px] font-sans block text-stone-650 dark:text-stone-350 truncate font-semibold">
                            {cat.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-stone-100 dark:border-stone-900">
                    <div className="flex flex-wrap items-center gap-4">
                      {/* Reminder config */}
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="newIntentionReminder"
                          checked={newIntentionReminder}
                          onChange={(e) => setNewIntentionReminder(e.target.checked)}
                          className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <label htmlFor="newIntentionReminder" className="text-xs text-stone-500 cursor-pointer">Daily Reminder:</label>
                        {newIntentionReminder && (
                          <input 
                            type="time" 
                            value={newIntentionTime}
                            onChange={(e) => setNewIntentionTime(e.target.value)}
                            className="text-xs border border-stone-200 dark:border-stone-800 bg-stone-50 px-1 py-0.5 rounded text-stone-905"
                          />
                        )}
                      </div>

                      {/* Share Option */}
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id="shareNewWithWall"
                          checked={shareNewWithWall}
                          onChange={(e) => setShareNewWithWall(e.target.checked)}
                          className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                        />
                        <label htmlFor="shareNewWithWall" className="text-xs text-stone-500 cursor-pointer text-amber-700 font-semibold" title="Post this anonymously to the global support list">
                          Post Anonymously to Community Wall
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-heading font-bold tracking-wider text-xs rounded-xl shadow cursor-pointer self-end"
                    >
                      Light Prayer Candle
                    </button>
                  </div>
                </form>
              </div>

              {/* ACTIVE INTENTIONS LIST */}
              <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl p-6">
                <h3 className="text-lg font-heading font-semibold text-stone-950 dark:text-stone-50 mb-4 pb-2 border-b border-stone-100 dark:border-stone-900">
                  Active Prayer Intentions & Examen Log
                </h3>

                {personalIntentions.filter(item => !item.answered).length === 0 ? (
                  <div className="text-center py-8 text-xs text-stone-500">
                    <CheckCircle className="h-5 w-5 mx-auto mb-2 text-stone-450" />
                    All intentions answered or archived! Light a new prayer candle above.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                    {personalIntentions.filter(item => !item.answered).map(item => (
                      <div key={item.id} className="p-4 border border-stone-150 dark:border-stone-850 rounded-xl hover:border-amber-500/25 transition-all">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {(() => {
                                const catConfig = getCategoryConfig(item.category);
                                return (
                                  <div 
                                    className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0 animate-pulse"
                                    style={{ 
                                      backgroundColor: catConfig.hex,
                                      boxShadow: `0 0 6px ${catConfig.hex}` 
                                    }}
                                    title={catConfig.name}
                                  />
                                );
                              })()}
                              <h4 className="font-heading font-bold text-base text-stone-950 dark:text-stone-100">
                                {item.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {(() => {
                                const catConfig = getCategoryConfig(item.category);
                                return (
                                  <span className={`text-[9px] px-2 py-0.5 rounded-md font-mono uppercase tracking-wider font-semibold border ${catConfig.badge}`}>
                                    {catConfig.name}
                                  </span>
                                );
                              })()}
                            </div>
                            <p className="text-xs text-stone-500 dark:text-stone-400 font-sans mt-0.5">
                              {item.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Answered Toggle */}
                            <button
                              onClick={() => handleMarkAnswered(item.id)}
                              className="px-2.5 py-1 bg-stone-100 dark:bg-stone-900 hover:bg-amber-100 text-stone-605 dark:text-stone-405 text-[10px] font-bold rounded-lg cursor-pointer flex items-center gap-1 border border-stone-200 dark:border-stone-800"
                              title="Declare answered prayer gratitude"
                            >
                              <Check className="h-3 w-3 text-stone-400" /> Answered
                            </button>
                            <button
                              onClick={() => handleDeleteIntention(item.id)}
                              className="p-1 text-stone-400 hover:text-red-500"
                            >
                              <Trash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* Reminder Badge */}
                        <div className="flex items-center gap-3 mt-1.5">
                          {item.reminderEnabled ? (
                            <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                              <Bell className="h-2.5 w-2.5" /> Daily Alert {item.reminderTime || "08:00 AM"}
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono text-stone-400 bg-stone-150 dark:bg-stone-900/60 px-2 py-0.5 rounded flex items-center gap-1 uppercase">
                              No Alert
                            </span>
                          )}

                          <span className="text-[10px] text-stone-400">
                            Candle lit {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {/* Journal Notes Subsection */}
                        {item.notes ? (
                          <div className="mt-3 bg-stone-50 dark:bg-stone-900/40 p-2 rounded text-xs text-stone-605 dark:text-stone-405 flex items-start gap-1 justify-between">
                            <span className="italic block flex-1">"Note: {item.notes}"</span>
                            <button 
                              onClick={() => {
                                setSelectedIntentionIdForNotes(item.id);
                                setIntentionNoteText(item.notes || "");
                              }}
                              className="text-[10px] text-amber-600 hover:underline cursor-pointer"
                            >
                              Edit
                            </button>
                          </div>
                        ) : (
                          <div className="mt-2.5">
                            {selectedIntentionIdForNotes === item.id ? (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  className="text-xs border border-stone-200 bg-stone-50 px-2 py-1 flex-1 rounded text-stone-950"
                                  placeholder="E.g., Visited Saint Judes chapel on Tuesday, feeling peaceful..."
                                  value={intentionNoteText}
                                  onChange={(e) => setIntentionNoteText(e.target.value)}
                                />
                                <button
                                  onClick={() => handleAddIntentionNote(item.id)}
                                  className="text-xs bg-stone-900 text-white px-3 py-1 rounded"
                                >
                                  Save Note
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedIntentionIdForNotes(item.id)}
                                className="text-[11px] font-mono text-stone-450 hover:text-stone-750 hover:underline cursor-pointer flex items-center gap-1"
                              >
                                + Write Private Journal Note
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ANSWERED / GRATITUDE ALTAR (Uplifting focus) */}
              <div className="bg-[#fcfaf4] dark:bg-stone-950 border border-amber-500/10 rounded-2xl p-6 shadow-xs relative overflow-hidden">
                <span className="absolute -right-6 -bottom-6 text-amber-550 opacity-10">
                  <Flame className="h-32 w-32 fill-current" />
                </span>
                
                <h3 className="text-lg font-heading font-semibold text-amber-800 dark:text-amber-400 mb-2 flex items-center gap-1.5">
                  <Flame className="h-5 w-5 fill-current animate-pulse text-amber-550" />
                  The Altar of Gratitude
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-4 font-sans">
                  "Give thanks in all circumstances; for this is the will of God in Christ Jesus for you." (1 Thessalonians 5:18). Celebrate God's interventions on your path of faith.
                </p>

                {personalIntentions.filter(item => item.answered).length === 0 ? (
                  <div className="py-6 text-center text-xs text-stone-400 border border-dashed border-stone-200 dark:border-stone-850 rounded-xl">
                    No answered prayers recorded yet. When a pleading is resolved, mark it Answered to light an everlasting flame here!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-56 overflow-y-auto">
                    {personalIntentions.filter(item => item.answered).map(item => (
                      <div key={item.id} className="bg-white dark:bg-stone-900 border border-amber-500/15 p-3 rounded-xl transition-all relative">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              {(() => {
                                const catConfig = getCategoryConfig(item.category);
                                return (
                                  <div 
                                    className="w-2 h-2 rounded-full inline-block flex-shrink-0 animate-pulse"
                                    style={{ 
                                      backgroundColor: catConfig.hex,
                                      boxShadow: `0 0 5px ${catConfig.hex}` 
                                    }}
                                    title={catConfig.name}
                                  />
                                );
                              })()}
                              <h4 className="font-heading font-bold text-sm text-stone-950 dark:text-stone-100 line-through decoration-amber-500/40">
                                {item.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {(() => {
                                const catConfig = getCategoryConfig(item.category);
                                return (
                                  <span className={`text-[8px] px-1.5 py-0.2 rounded font-mono uppercase tracking-wider font-semibold border ${catConfig.badge}`}>
                                    {catConfig.name}
                                  </span>
                                );
                              })()}
                            </div>
                            <p className="text-[11px] text-stone-500 dark:text-stone-400 italic">
                              "{item.description}"
                            </p>
                          </div>
                          
                          {/* Candle emoji visualizes answered prayer flame */}
                          <div className="text-amber-500 flex-shrink-0 animate-bounce" title="Your prayer flame is lit on the altar of gratitude">
                            🕯️
                          </div>
                        </div>

                        {item.notes && (
                          <div className="mt-2 text-[11px] bg-amber-500/5 p-1.5 rounded text-stone-600 dark:text-stone-450">
                            <strong>Intervention:</strong> {item.notes}
                          </div>
                        )}

                        <div className="mt-2 flex items-center justify-between text-[10px]">
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider block">
                            ✓ Answered & Thanked
                          </span>
                          <button
                            onClick={() => handleMarkAnswered(item.id)}
                            className="text-[9px] text-stone-400 hover:underline"
                          >
                            Reopen Intent
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 6: ANONYMOUS COMMUNITY PRAYER WALL */}
          {activeTab === "wall" && (
            <div className="space-y-6">
              
              {/* Community post submission */}
              <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl p-6">
                <h3 className="text-lg font-heading font-semibold text-stone-950 dark:text-stone-50 mb-1">
                  Submit to the Global Community Prayer Wall
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">
                  Share your burdens anonymously or with your initials. Our global prayer team covenants to tap 'Amen' and lift you up in mass.
                </p>

                <form onSubmit={handlePostToWall} className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-stone-500 block mb-1">Your Prayer Pleading / Intercession request:</label>
                    <textarea
                      value={newWallContent}
                      onChange={(e) => setNewWallContent(e.target.value)}
                      rows={3}
                      max-length={250}
                      className="text-xs border border-stone-200 dark:border-stone-800 rounded-lg p-2.5 bg-stone-50 dark:bg-stone-950 w-full text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-amber-500"
                      placeholder="Pray for us. We are currently searching for job peace... (Limit 250 characters)"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-mono text-stone-500 block mb-1">Your Name / Initials:</label>
                      <input 
                        type="text"
                        value={newWallAuthor}
                        onChange={(e) => setNewWallAuthor(e.target.value)}
                        className="text-xs border border-stone-200 dark:border-stone-800 rounded-lg p-2 bg-stone-50 dark:bg-stone-950 w-full text-stone-900"
                        placeholder="E.g., M. K. or leave Anonymous"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-mono text-stone-500 block mb-1">Intention Category:</label>
                      <select
                        value={newWallCategory}
                        onChange={(e) => setNewWallCategory(e.target.value as any)}
                        className="text-xs border border-stone-200 dark:border-stone-850 rounded-lg p-2 bg-stone-50 dark:bg-stone-955 w-full text-stone-900"
                      >
                        <option value="Healing">Healing / Sickness</option>
                        <option value="Family">Family Harmony</option>
                        <option value="Thanksgiving">Thanksgiving Offerings</option>
                        <option value="Strength">Strength / Guidance</option>
                        <option value="Hope">Hope / Impossible Cases</option>
                        <option value="Other">Other / General Devotion</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-right">
                    <button
                      type="submit"
                      className="px-5 py-2 bg-stone-950 dark:bg-stone-100 text-white dark:text-stone-950 font-heading font-medium tracking-wider text-xs rounded-lg hover:bg-stone-850 cursor-pointer shadow"
                    >
                      Publish to Community Wall
                    </button>
                  </div>
                </form>
              </div>

              {/* LIST OF SHARED COMMUNITY INTENTIONS */}
              <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl p-6">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-900 pb-3 mb-4">
                  <div>
                    <h3 className="text-lg font-heading font-semibold text-stone-950 dark:text-stone-50">
                      The Communion of Prayers Wall
                    </h3>
                    <p className="text-[11px] text-stone-450">
                      Spiritual communion. Stand united with other faithful souls across the globe.
                    </p>
                  </div>

                  {!isOfflineMode && (
                    <button
                      onClick={fetchWallPrayers}
                      disabled={isLoadingWall}
                      className="text-stone-500 hover:text-stone-800 dark:hover:text-stone-100 pointer cursor-pointer"
                      title="Reload community prayers from sever"
                    >
                      <RefreshCw className={`h-4.5 w-4.5 ${isLoadingWall ? "animate-spin text-amber-500" : ""}`} />
                    </button>
                  )}
                </div>

                {isLoadingWall ? (
                  <div className="py-12 text-center text-xs font-mono text-stone-450">
                    Entering Eucharistic prayer room ... gathering community intentions...
                  </div>
                ) : communityPrayers.length === 0 ? (
                  <div className="text-center py-10 text-xs text-stone-500 italic">
                    The prayer wall is currently silent. Be the first to share an offering above!
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                    {communityPrayers.map(item => (
                      <div key={item.id} className="p-4 bg-stone-50/50 dark:bg-stone-900/40 border border-stone-200/55 dark:border-stone-850 rounded-xl hover:border-amber-500/25 transition-all">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <span className="text-[9px] font-mono font-bold tracking-widest text-[#9b6c20] bg-amber-100/40 px-2 py-0.5 rounded-full uppercase">
                            {item.category || "Healing"}
                          </span>
                          <span className="text-[10px] font-mono text-stone-450 dark:text-stone-500">
                            {new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <p className="text-xs md:text-sm text-stone-800 dark:text-stone-200 font-sans leading-relaxed italic">
                          "{item.content}"
                        </p>

                        <div className="mt-3.5 pt-3 border-t border-stone-100 dark:border-stone-900/60 flex items-center justify-between">
                          <span className="text-[11px] font-mono text-stone-500 dark:text-stone-500">
                            Offered by: <strong>{item.authorName}</strong>
                          </span>

                          <button
                            onClick={() => handleIncreaseAmen(item.id)}
                            className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 hover:bg-amber-50 hover:border-amber-300 dark:hover:bg-amber-950/20 px-3 py-1.5 rounded-xl cursor-pointer transition-transform hover:scale-105 select-none flex items-center gap-1.5 text-xs text-stone-750 dark:text-stone-300 font-semibold"
                            title="Pray alongside this faithful person"
                          >
                            🕯️ <span className="text-stone-450 font-bold font-mono">Amen ({item.amenCount})</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* TAB 7: INTUITIVE LITURGICAL ROUTINES */}
          {activeTab === "routines" && (
            <RoutinesTab 
              onAddStatsPrayer={incrementPrayerStats} 
              onNavigateToStories={() => setActiveTab("sleep_stories")} 
            />
          )}

          {/* TAB 8: GLOBAL TRENDING DEVOTIONS */}
          {activeTab === "trending" && (
            <TrendingTab 
              onAddStatsPrayer={incrementPrayerStats} 
            />
          )}

          {/* TAB 9: SLEEP BIBLE STORIES */}
          {activeTab === "sleep_stories" && (
            <SleepStoriesTab />
          )}

          {/* TAB 10: BIBLE SCRIPTURE FLASHCARDS */}
          {activeTab === "flashcards" && (
            <BibleFlashcardsTab triggerSound={triggerNotificationSound} />
          )}

        </div>

        {/* RIGHT COLUMN: USER GROWTH TRACKER & GENERAL STATS SIDEBAR (Sizing responsive to navigation style) */}
        <div className={`${navStyle === "monastic_sidebar" ? "lg:col-span-3" : "lg:col-span-4"} flex flex-col gap-6`}>
          
          {/* STREAK & SACRED CANDLE VISUALIZATION */}
          <div className="bg-[#fcfaf4] dark:bg-stone-950 border border-amber-500/10 rounded-2xl p-6 shadow-xs relative text-center">
            <h4 className="text-xs font-mono uppercase tracking-widest text-stone-500 block mb-2 font-bold select-none">
              Habit Streak & Prayer Light
            </h4>

            {/* Glowing Flame Animation wrapper */}
            <div className="my-6 relative inline-block">
              {/* Flame background glow */}
              <div 
                className={`absolute left-1/2 -translate-x-1/2 -top-1.5 ${
                  stats.streak > 5 ? "w-16 h-16 bg-blue-500/15" : "w-12 h-12 bg-amber-500/15"
                } rounded-full blur-xl`}
              />
              
              {/* Animated flame graphic */}
              <div className="flex flex-col items-center">
                <span className="text-5xl select-none filter drop-shadow animate-bounce cursor-pointer" title="Click to test streak resolution scale">
                  {stats.streak > 5 ? "🔥" : "🕯️"}
                </span>
                
                {/* Visual streak number overlay */}
                <span className="text-xl font-heading font-bold text-stone-900 dark:text-stone-50 mt-3 block">
                  {stats.streak} DAYS COVENANT
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-605 dark:text-stone-405 leading-relaxed font-sans max-w-xs mx-auto">
              Your prayer lamp is burning brightly! Repeat mass prayers, complete scripture passages, or recite the audio rosary daily to fuel your streak flame.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-stone-200/50 dark:border-stone-850">
              <div className="text-center">
                <span className="text-xs text-stone-400 font-mono block">Liturgies Read</span>
                <span className="text-base font-mono font-bold text-emerald-600 dark:text-emerald-400">{stats.completedScripturesCount} / 15</span>
              </div>
              <div className="text-center">
                <span className="text-xs text-stone-400 font-mono block">Devotions Offered</span>
                <span className="text-base font-mono font-bold text-amber-600 dark:text-amber-400">{stats.totalPrayersCount}</span>
              </div>
            </div>
          </div>

          {/* SCRIPTURE 15-DAY CHALLENGE PROGRESS */}
          <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl p-5 shadow-xs">
            <h4 className="text-sm font-heading font-semibold text-stone-950 dark:text-stone-50 mb-1 flex items-center gap-1.5">
              <BookOpen className="h-4.5 w-4.5 text-amber-600" />
              15-Day Daily Scripture Pathway
            </h4>
            <p className="text-[11px] text-stone-450 dark:text-stone-450 block mb-3 leading-relaxed">
              Accept the challange of reading standard theological selections, ticking off chapters as completed.
            </p>

            {/* Progress bar */}
            {(() => {
              const activeS = scriptures;
              const total = activeS.length || 15;
              const completed = activeS.filter(s => s.completed).length;
              const percent = Math.round((completed / total) * 100);
              return (
                <div className="mb-4">
                  <div className="flex items-center justify-between text-xs font-mono text-stone-500 mb-1.5">
                    <span>PROGRESS: {percent}% DONE</span>
                    <span>{completed}/{total} DAYS</span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-900 rounded-full h-2 overflow-hidden shadow-inner">
                    <div 
                      className="bg-emerald-600 dark:bg-emerald-500 h-full rounded-full transition-all duration-500" 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })()}

            {/* Collapsed selected scripture box */}
            <div className="bg-stone-50 dark:bg-stone-900/60 border border-stone-200/70 dark:border-stone-850 p-4 rounded-xl mb-3">
              {scriptures[selectedScriptureIdx] ? (
                (() => {
                  const dayItem = scriptures[selectedScriptureIdx];
                  return (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-mono text-stone-400 uppercase">
                          DAY {dayItem.day} SCRIPTURE
                        </span>
                        
                        <input
                          type="checkbox"
                          checked={dayItem.completed}
                          onChange={() => handleToggleScripture(dayItem.id)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                        />
                      </div>

                      <h5 className="font-sans font-bold text-xs text-stone-950 dark:text-stone-100">
                        {dayItem.chapter}:{dayItem.verses}
                      </h5>

                      <p className="text-[11px] text-stone-701 dark:text-stone-401 line-clamp-3 italic mt-1 leading-normal">
                        "{dayItem.text}"
                      </p>

                      <p className="text-[10px] text-amber-700 dark:text-amber-400 italic font-mono mt-2 pt-1 border-t border-stone-200/50 dark:border-stone-850/50">
                        <strong>Brief Homily:</strong> {dayItem.reflection}
                      </p>

                    </div>
                  );
                })()
              ) : null}
            </div>

            {/* Quick selectors Day 1-15 */}
            <div className="grid grid-cols-5 gap-1.5">
              {scriptures.map((s, index) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedScriptureIdx(index)}
                  className={`p-1 text-[10px] font-mono font-bold rounded-md transition-all cursor-pointer ${
                    selectedScriptureIdx === index 
                      ? "bg-amber-600 text-white ring-1 ring-amber-204" 
                      : s.completed 
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400" 
                        : "bg-stone-100 dark:bg-stone-900 text-stone-500 hover:bg-stone-200"
                  }`}
                >
                  D{s.day}
                </button>
              ))}
            </div>

          </div>

          {/* TRADITIONAL PRAYER SEARCH & DEVOTIONAL SHEETS COLLAPSIBLE */}
          <div className="bg-white dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl p-5 shadow-xs">
            <h4 className="text-sm font-heading font-semibold text-stone-950 dark:text-stone-50 mb-1 flex items-center gap-1.5 block">
              Traditional Catholic Prayers Finder
            </h4>
            <p className="text-[11px] text-stone-450 block mb-3 font-sans">
              Locate ancient devotions like the Salve Regina, Anima Christi, or Saint Michael protection pleading.
            </p>

            <input 
              type="text"
              value={searchPrayerQuery}
              onChange={(e) => setSearchPrayerQuery(e.target.value)}
              className="text-xs border border-stone-200 dark:border-stone-850 bg-stone-50 dark:bg-stone-952 p-2 rounded-lg w-full mb-3 text-stone-900"
              placeholder="Search Pater Noster, Creed, Marian devotions..."
            />

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {filteredTraditionalPrayers.map(p => (
                <div 
                  key={p.id}
                  onClick={() => alert(`[${p.title}]\n\n${p.text}`)}
                  className="p-2 border border-stone-100 dark:border-stone-900 rounded-lg hover:bg-stone-100/50 dark:hover:bg-stone-900/40 transition-all cursor-pointer text-xs flex items-center justify-between"
                  title="Click to view prayer full text"
                >
                  <span className="font-heading font-medium text-stone-850 dark:text-stone-300">
                    {p.title}
                  </span>
                  <span className="text-[9px] font-mono bg-stone-200/50 dark:bg-stone-900 px-2.5 py-0.5 rounded text-stone-450">
                    {p.category}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SIMULATED MORNING VERSES & LITURGY NOTIFICATION LOG */}
          {notificationsEnabled && (
            <div className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-850 rounded-2xl p-5 shadow-xs">
              <h4 className="text-sm font-heading font-semibold text-stone-950 dark:text-stone-50 mb-1 flex items-center gap-1.5">
                <Bell className="h-4 w-4 text-amber-600 animate-pulse" />
                Push Notification Devotional Stream
              </h4>
              <p className="text-[11px] text-stone-500 mb-3">
                Simulating live morning devotions and personal examination reminders sent to your lock screen.
              </p>

              {simulatedNotifications.length === 0 ? (
                <div className="text-center py-6 text-[10px] text-stone-450 italic">
                  Waiting for daily devotional triggers. Popups deliver randomly or on intervals.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {simulatedNotifications.map(n => (
                    <div key={n.id} className="p-3 bg-amber-500/5 dark:bg-amber-950/20 border-l-2 border-amber-500 rounded-lg text-[11px] leading-relaxed relative font-sans">
                      <p className="text-stone-750 dark:text-stone-300 pr-4 italic">
                        {n.msg}
                      </p>
                      <span className="text-[9px] font-mono text-stone-400 block mt-1">
                        Triggered: {n.time}
                      </span>
                      <button 
                        onClick={() => setSimulatedNotifications(prev => prev.filter(item => item.id !== n.id))}
                        className="absolute right-1.5 top-1 text-[10px] text-stone-450 hover:text-stone-700"
                        title="Dismiss alert notification panel"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      triggerNotificationSound();
                      setSimulatedNotifications(prev => [
                        {
                          id: String(Date.now()),
                          msg: "🔔 Liturgical Alert: Epiphany Feast preparation approaches. Mark your novena day done to secure your covenant!",
                          time: "Just now"
                        },
                        ...prev
                      ]);
                    }}
                    className="w-full border border-dashed border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-550/10 text-[10px] font-bold p-1.5 rounded-lg font-mono cursor-pointer"
                  >
                    + Trigger Another Simulated Notification Alert
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

      </main>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-stone-200 dark:border-stone-850 py-6 px-4 md:px-8 text-center bg-white dark:bg-stone-950">
        <p className="text-xs text-stone-450 leading-relaxed font-sans font-light">
          "Praise the Lord, all you nations! Extol him, all you peoples! For great is his steadfast love toward us." — Psalm 117
        </p>
        <p className="text-[11px] text-stone-400 font-mono mt-1 font-semibold uppercase tracking-widest">
          Soli Deo Gloria • Made Securely with Express & Gemini AI
        </p>
      </footer>

    </div>
  );
}
