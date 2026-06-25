import React, { useState, useEffect } from "react";
import { 
  BookOpen, 
  RotateCw, 
  CheckCircle, 
  AlertCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Bookmark, 
  HelpCircle, 
  Trophy, 
  Play, 
  Sparkles, 
  ListFilter,
  Check,
  RefreshCw,
  Award,
  Search
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

// Types
export interface Flashcard {
  id: string;
  verse: string;
  reference: string;
  category: "Comfort" | "Strength" | "Faith" | "Love" | "Wisdom";
  devotional: string;
  testment: "Old Testament" | "New Testament";
  book: string;
}

interface BibleFlashcardsTabProps {
  triggerSound?: () => void;
}

const CARDS_DATABASE: Flashcard[] = [
  {
    id: "fc_1",
    verse: "The Lord is my shepherd; I shall not want.",
    reference: "Psalm 23:1",
    category: "Comfort",
    devotional: "Trust in the ultimate protection and providence of the Good Shepherd, who guides us through green pastures and dark valleys alike.",
    testment: "Old Testament",
    book: "Psalms"
  },
  {
    id: "fc_2",
    verse: "Peace I leave with you; my peace I give to you. Not as the world gives do I give to you. Let not your hearts be troubled, neither let them be afraid.",
    reference: "John 14:27",
    category: "Comfort",
    devotional: "The peace offered by Christ is deep and eternal, independent of worldly currents and anxieties. Lean into His grace.",
    testment: "New Testament",
    book: "John"
  },
  {
    id: "fc_3",
    verse: "Come to me, all who labor and are heavy laden, and I will give you rest.",
    reference: "Matthew 11:28",
    category: "Comfort",
    devotional: "Take up the gentle yoke of Christ when burden weights you down. True, pure restorative rest lies in His comforting sanctuary.",
    testment: "New Testament",
    book: "Matthew"
  },
  {
    id: "fc_4",
    verse: "Fear not, for I am with you; be not dismayed, for I am your God; I will strengthen you, I will help you, I will uphold you with my righteous right hand.",
    reference: "Isaiah 41:10",
    category: "Comfort",
    devotional: "God does not promise an absence of struggle, but guarantees His absolute, unwavering presence to support and maintain us.",
    testment: "Old Testament",
    book: "Isaiah"
  },
  {
    id: "fc_5",
    verse: "I can do all things through him who strengthens me.",
    reference: "Philippians 4:13",
    category: "Strength",
    devotional: "This strength is not self-derived muscle, but a spiritual fortitude provided by Christ that allows us to endure any circumstance with joyful confidence.",
    testment: "New Testament",
    book: "Philippians"
  },
  {
    id: "fc_6",
    verse: "Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.",
    reference: "Joshua 1:9",
    category: "Strength",
    devotional: "Courage is not the absence of fear, but the supreme conviction that God stands alongside us on every battleground of life.",
    testment: "Old Testament",
    book: "Joshua"
  },
  {
    id: "fc_7",
    verse: "The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid?",
    reference: "Psalm 27:1",
    category: "Strength",
    devotional: "With God serving as both our defensive shield and guiding light, external dangers and looming fears lose their power over our soul.",
    testment: "Old Testament",
    book: "Psalms"
  },
  {
    id: "fc_8",
    verse: "What then shall we say to these things? If God is for us, who can be against us?",
    reference: "Romans 8:31",
    category: "Strength",
    devotional: "An absolute defense. No worldly power, cosmic uncertainty, or immediate danger can conquer the soul that resides safely in God's love.",
    testment: "New Testament",
    book: "Romans"
  },
  {
    id: "fc_9",
    verse: "Now faith is the assurance of things hoped for, the conviction of things not seen.",
    reference: "Hebrews 11:1",
    category: "Faith",
    devotional: "Faith sees beyond physical sight. It anchors our finite lives to the infinite, unchanging promises of God.",
    testment: "New Testament",
    book: "Hebrews"
  },
  {
    id: "fc_10",
    verse: "Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.",
    reference: "Proverbs 3:5-6",
    category: "Faith",
    devotional: "Surrender your human logic and limited perspective to God's providence. He coordinates paths with flawless ultimate wisdom.",
    testment: "Old Testament",
    book: "Proverbs"
  },
  {
    id: "fc_11",
    verse: "And we know that for those who love God all things work together for good, for those who are called according to his purpose.",
    reference: "Romans 8:28",
    category: "Faith",
    devotional: "God takes every broken thread of our lives and weaves them into a divine tapestry of ultimate grace, redemption, and purpose.",
    testment: "New Testament",
    book: "Romans"
  },
  {
    id: "fc_12",
    verse: "Love is patient and kind; love does not envy or boast; it is not arrogant or rude. It does not insist on its own way; it is not irritable or resentful.",
    reference: "1 Corinthians 13:4-5",
    category: "Love",
    devotional: "Paul's magnificent definition of Charity. This is the very nature of Jesus Christ, which we are continuously invited to mimic.",
    testment: "New Testament",
    book: "1 Corinthians"
  },
  {
    id: "fc_13",
    verse: "For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.",
    reference: "John 3:16",
    category: "Love",
    devotional: "The pinnacle of divine charity. God empty Himself of His own glory out of love for His creation, opening the portal to eternity.",
    testment: "New Testament",
    book: "John"
  },
  {
    id: "fc_14",
    verse: "We love because he first loved us.",
    reference: "1 John 4:19",
    category: "Love",
    devotional: "Our ability to show true, sacrificial love is a direct reflection and response to the infinite stream of love God pours into us.",
    testment: "New Testament",
    book: "1 John"
  },
  {
    id: "fc_15",
    verse: "But you, O Lord, are a God merciful and gracious, slow to anger and abounding in steadfast love and faithfulness.",
    reference: "Psalm 86:15",
    category: "Love",
    devotional: "Even when we falter, God's essential character is mercy. He remains slow to anger and overflowingly faithful to His covenant.",
    testment: "Old Testament",
    book: "Psalms"
  },
  {
    id: "fc_16",
    verse: "If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him.",
    reference: "James 1:5",
    category: "Wisdom",
    devotional: "Wisdom is key. Do not hesitate to kneel and pray for direction, for God's wisdom is an abundant treasure given freely without judgment.",
    testment: "New Testament",
    book: "James"
  },
  {
    id: "fc_17",
    verse: "Your word is a lamp to my feet and a light to my path.",
    reference: "Psalm 119:105",
    category: "Wisdom",
    devotional: "Scripture serves as our light in dark environments, displaying exactly where to step next when the greater horizon feels obscure.",
    testment: "Old Testament",
    book: "Psalms"
  },
  {
    id: "fc_18",
    verse: "The fear of the Lord is the beginning of wisdom, and the knowledge of the Holy One is insight.",
    reference: "Proverbs 9:10",
    category: "Wisdom",
    devotional: "The 'fear of the Lord' is holy awe and deep reverence. Recognizing God's sovereign greatness aligns our perspective with reality.",
    testment: "Old Testament",
    book: "Proverbs"
  },
  {
    id: "fc_19",
    verse: "Do not be anxious about anything, but in everything by prayer and supplication with thanksgiving let your requests be made known to God.",
    reference: "Philippians 4:6",
    category: "Comfort",
    devotional: "Transform anxious thoughts into dynamic prayers of gratitude. The peace which transcends all standard human intellect will guard your heart.",
    testment: "New Testament",
    book: "Philippians"
  },
  {
    id: "fc_20",
    verse: "The Lord is near to the brokenhearted and saves the crushed in spirit.",
    reference: "Psalm 34:18",
    category: "Comfort",
    devotional: "When grief threatens to break your heart is exactly when Christ holds you closest. His salvation is tailored specifically for the weary.",
    testment: "Old Testament",
    book: "Psalms"
  }
];

export default function BibleFlashcardsTab({ triggerSound }: BibleFlashcardsTabProps) {
  // Mode: study (standard card-flip) or quiz (multiple-choice)
  const [activeMode, setActiveMode] = useState<"study" | "quiz">("study");
  
  // Category Filtering
  const [selectedCategory, setSelectedCategory] = useState<"All" | "Comfort" | "Strength" | "Faith" | "Love" | "Wisdom">("All");
  
  // Card customization
  const [showVerseFirst, setShowVerseFirst] = useState<boolean>(true);
  
  // Progress states / Mastered IDs list
  const [masteredIds, setMasteredIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("bible_flashcards_mastered");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Active Index based on current filtered list
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [flipped, setFlipped] = useState<boolean>(false);
  
  // Filtered Cards List
  const filteredCards = selectedCategory === "All" 
    ? CARDS_DATABASE 
    : CARDS_DATABASE.filter(c => c.category === selectedCategory);
  
  const currentCard = filteredCards[currentIndex] || filteredCards[0];

  // Self-evaluation & persistent progress tracking
  useEffect(() => {
    localStorage.setItem("bible_flashcards_mastered", JSON.stringify(masteredIds));
  }, [masteredIds]);

  // Handle local sounds safely
  const playSoundEffect = (type: "flip" | "success" | "fail") => {
    try {
      if (triggerSound) {
        triggerSound();
      }
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === "flip") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(320, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(450, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.18);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.2);
      } else if (type === "success") {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.08); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.16); // G5
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === "fail") {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.linearRampToValueAtTime(150, audioCtx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.3);
      }
    } catch (e) {
      // AudioContext fallback
    }
  };

  // Switch navigation handlers
  const handlePrev = () => {
    setFlipped(false);
    playSoundEffect("flip");
    setCurrentIndex((prev) => (prev === 0 ? filteredCards.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setFlipped(false);
    playSoundEffect("flip");
    setCurrentIndex((prev) => (prev === filteredCards.length - 1 ? 0 : prev + 1));
  };

  const toggleMastered = (cardId: string) => {
    playSoundEffect("success");
    setMasteredIds(prev => {
      if (prev.includes(cardId)) {
        return prev.filter(id => id !== cardId);
      } else {
        return [...prev, cardId];
      }
    });
  };

  const handleShuffle = () => {
    playSoundEffect("flip");
    setFlipped(false);
    // Move to a random card
    if (filteredCards.length > 1) {
      let r = currentIndex;
      while (r === currentIndex) {
        r = Math.floor(Math.random() * filteredCards.length);
      }
      setCurrentIndex(r);
    }
  };

  // Reset category filters
  const onCategoryChange = (cat: typeof selectedCategory) => {
    setSelectedCategory(cat);
    setCurrentIndex(0);
    setFlipped(false);
    playSoundEffect("flip");
  };

  // --- QUIZ MODE STATE ---
  const [quizQuestion, setQuizQuestion] = useState<Flashcard | null>(null);
  const [quizOptions, setQuizOptions] = useState<string[]>([]);
  const [selectedQuizOption, setSelectedQuizOption] = useState<string | null>(null);
  const [hasAnsweredQuiz, setHasAnsweredQuiz] = useState<boolean>(false);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizTotal, setQuizTotal] = useState<number>(0);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);
  const [quizBookFilter, setQuizBookFilter] = useState<string>("All");

  const generateQuizQuestion = () => {
    setSelectedQuizOption(null);
    setHasAnsweredQuiz(false);
    
    // Choose random card
    const randomIndex = Math.floor(Math.random() * CARDS_DATABASE.length);
    const correctCard = CARDS_DATABASE[randomIndex];
    
    // Pick 3 incorrect options
    const otherCards = CARDS_DATABASE.filter(c => c.id !== correctCard.id);
    const shuffledOthers = [...otherCards].sort(() => 0.5 - Math.random());
    const distractors = shuffledOthers.slice(0, 3).map(c => c.reference);
    
    const combinedOptions = [...distractors, correctCard.reference].sort(() => 0.5 - Math.random());
    
    setQuizQuestion(correctCard);
    setQuizOptions(combinedOptions);
  };

  // Seed first quiz question on enter
  useEffect(() => {
    if (activeMode === "quiz" && !quizQuestion) {
      generateQuizQuestion();
    }
  }, [activeMode]);

  const submitQuizAnswer = (option: string) => {
    if (hasAnsweredQuiz || !quizQuestion) return;
    
    setSelectedQuizOption(option);
    setHasAnsweredQuiz(true);
    setQuizTotal(prev => prev + 1);
    
    const correct = option === quizQuestion.reference;
    setIsAnswerCorrect(correct);
    
    if (correct) {
      setQuizScore(prev => prev + 1);
      playSoundEffect("success");
    } else {
      playSoundEffect("fail");
    }
  };

  // Mastery percentage
  const totalCards = CARDS_DATABASE.length;
  const masteredCount = masteredIds.length;
  const masteryPercentage = Math.round((masteredCount / totalCards) * 100) || 0;

  return (
    <div className="flex flex-col gap-6 animate-fadeIn text-stone-800 dark:text-stone-100">
      
      {/* 1. HEADER SECTION & NAVIGATION SEGMENT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-850 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1 px-2.5 bg-amber-500/10 text-[#d4af37] dark:text-amber-400 font-mono text-[9px] tracking-widest font-bold uppercase rounded-full border border-amber-500/20 shadow-xs">
              MEMENTO VERBUM
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-heading font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            Scripture Flashcards
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 font-sans mt-0.5">
            Memorize the Word of God through elegant repetition, spatial feedback, and interactive quizzes.
          </p>
        </div>

        {/* View Toggle (Study vs Quiz) */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-stone-900/60 p-1 rounded-xl border border-stone-200/60 dark:border-stone-850 shadow-inner max-w-fit self-start md:self-auto">
          <button
            onClick={() => {
              setActiveMode("study");
              playSoundEffect("flip");
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold tracking-wider rounded-lg cursor-pointer transition-all ${
              activeMode === "study"
                ? "bg-amber-600 dark:bg-amber-550 text-white dark:text-stone-950 shadow-xs"
                : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-105"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            STUDY CARDS
          </button>
          <button
            onClick={() => {
              setActiveMode("quiz");
              playSoundEffect("flip");
              generateQuizQuestion();
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold tracking-wider rounded-lg cursor-pointer transition-all ${
              activeMode === "quiz"
                ? "bg-amber-600 dark:bg-amber-550 text-white dark:text-stone-950 shadow-xs"
                : "text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-105"
            }`}
          >
            <Trophy className="h-3.5 w-3.5" />
            QUIZ MODE
          </button>
        </div>
      </div>

      {/* 2. MASTERY BAR COMPONENT */}
      <div className="bg-gradient-to-r from-[#fdfbf7] md:from-[#fcf9f0] to-[#f7f3e8] dark:from-[#12101e] dark:to-[#171428] border border-amber-500/10 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-gradient-to-bl from-amber-500/[0.04] to-transparent pointer-events-none blur-2xl" />
        <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
          <div className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center bg-white dark:bg-stone-950 rounded-full border border-amber-500/20 shadow-inner">
            <Award className="h-6 w-6 text-[#d4af37]" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-xs tracking-wider uppercase text-stone-900 dark:text-stone-100 mb-0.5">
              SCRIPTURE MASTERY
            </h3>
            <p className="text-[11px] text-stone-550 dark:text-stone-400 leading-relaxed max-w-sm">
              You marked <strong className="text-stone-800 dark:text-stone-200">{masteredCount}</strong> of <strong className="text-stone-800 dark:text-stone-200">{totalCards}</strong> standard bible verses as memorized. Keep practicing!
            </p>
          </div>
        </div>

        {/* Dynamic mastery bar */}
        <div className="flex flex-col gap-1.5 w-full md:w-56 shrink-0 z-10">
          <div className="flex items-center justify-between text-[10px] font-mono font-bold text-stone-600 dark:text-stone-400">
            <span>Progress</span>
            <span className="text-[#d4af37]">{masteryPercentage}%</span>
          </div>
          <div className="h-2 w-full bg-stone-200 dark:bg-stone-850 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${masteryPercentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* --- RENDER CARD DECK / STUDY MODE --- */}
      {activeMode === "study" && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          
          {/* LEFT: Filters and Options (Col span 4) */}
          <div className="md:col-span-4 flex flex-col gap-4">
            
            {/* Category Filter Group */}
            <div className="bg-white dark:bg-[#12101d] border border-stone-200 dark:border-stone-850 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-stone-100 dark:border-stone-850">
                <span className="text-[10px] font-mono tracking-widest text-[#d4af37] font-bold uppercase flex items-center gap-2">
                  <ListFilter className="h-3.5 w-3.5" />
                  Filter Category
                </span>
                <span className="text-[10px] font-mono text-stone-400 bg-stone-150/40 dark:bg-stone-900 px-2 py-0.5 rounded-md">
                  {filteredCards.length} Cards
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {[
                  { id: "All", label: "All Verses" },
                  { id: "Comfort", label: "Comfort & Peace" },
                  { id: "Strength", label: "Strength & Courage" },
                  { id: "Faith", label: "Faith & Trust" },
                  { id: "Love", label: "Love & Mercy" },
                  { id: "Wisdom", label: "Wisdom & Guidance" }
                ].map(cat => {
                  const isSelected = selectedCategory === cat.id;
                  const count = cat.id === "All" 
                    ? CARDS_DATABASE.length 
                    : CARDS_DATABASE.filter(c => c.category === cat.id).length;
                    
                  return (
                    <button
                      key={cat.id}
                      onClick={() => onCategoryChange(cat.id as any)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/10 dark:bg-amber-500/5 text-[#d4af37] border border-amber-500/20 shadow-2xs"
                          : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-100/50 dark:hover:bg-white/[0.01] border border-transparent"
                      }`}
                    >
                      <span>{cat.label}</span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md ${
                        isSelected 
                          ? "bg-amber-500/20 text-[#d4af37]" 
                          : "bg-stone-100 dark:bg-stone-900 text-stone-400"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pivot configuration */}
            <div className="bg-white dark:bg-[#12101d] border border-stone-200 dark:border-stone-850 rounded-2xl p-5 shadow-xs">
              <span className="text-[10px] font-mono tracking-widest text-[#d4af37] font-bold uppercase block mb-3.5">
                Test Focus
              </span>

              <div className="flex flex-col gap-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="faceFocus"
                    checked={showVerseFirst}
                    onChange={() => {
                      setShowVerseFirst(true);
                      setFlipped(false);
                      playSoundEffect("flip");
                    }}
                    className="accent-amber-500 scale-110"
                  />
                  <div>
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200 block">Verse on Front</span>
                    <span className="text-[10px] text-stone-400 font-sans">Read full scripture quotes, recall references on back.</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer border-t border-stone-100 dark:border-stone-850/60 pt-3">
                  <input
                    type="radio"
                    name="faceFocus"
                    checked={!showVerseFirst}
                    onChange={() => {
                      setShowVerseFirst(false);
                      setFlipped(false);
                      playSoundEffect("flip");
                    }}
                    className="accent-amber-500 scale-110"
                  />
                  <div>
                    <span className="text-xs font-medium text-stone-800 dark:text-stone-200 block">Reference on Front</span>
                    <span className="text-[10px] text-stone-400 font-sans">See book and chapter verse coordinates, quote scripture passages.</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Quick reminder help */}
            <div className="bg-amber-500/[0.02] border border-amber-500/10 p-4 rounded-xl text-[10.5px] leading-relaxed text-stone-500 dark:text-stone-400 font-sans">
              <strong className="text-stone-700 dark:text-stone-300 font-semibold block mb-0.5">⛪ MEMORIZATION PRINCIPLE:</strong>
              Spaced repetition of short chapters acts directly on focus. Give each verse 10 seconds of active gaze before flipping!
            </div>
          </div>

          {/* RIGHT: Actual Flashcard Box (Col span 8) */}
          <div className="md:col-span-8 flex flex-col gap-5">
            
            {/* The 3D Interactive Card Container */}
            {filteredCards.length > 0 ? (
              <div className="flex flex-col gap-5">
                <div 
                  className="w-full h-[340px] md:h-[380px] cursor-pointer relative"
                  style={{ perspective: "1000px" }}
                  onClick={() => {
                    setFlipped(!flipped);
                    playSoundEffect("flip");
                  }}
                >
                  <motion.div 
                    className="relative w-full h-full"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateY: flipped ? 180 : 0 }}
                    transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
                  >
                    
                    {/* FRONT OF THE CARD */}
                    <div 
                      className="absolute inset-0 w-full h-full bg-white dark:bg-[#12101e] border-2 border-stone-200/80 dark:border-stone-850 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between overflow-hidden"
                      style={{ 
                        backfaceVisibility: "hidden", 
                        WebkitBackfaceVisibility: "hidden",
                        zIndex: flipped ? 0 : 10
                      }}
                    >
                      {/* Artistic backgrounds */}
                      <div className="absolute top-0 right-0 w-36 h-36 border-b border-l border-amber-500/[0.03] dark:border-amber-500/[0.02] rounded-bl-full pointer-events-none" />
                      <div className="absolute bottom-0 left-0 w-36 h-36 border-t border-r border-amber-500/[0.03] dark:border-amber-500/[0.02] rounded-tr-full pointer-events-none" />
                      
                      {/* Top Header */}
                      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-850 pb-3 relative z-10">
                        <div className="flex items-center gap-2">
                          <span className="p-1 px-2.5 bg-stone-100 dark:bg-stone-900 border border-stone-200/50 dark:border-stone-800 text-[9px] font-mono text-stone-500 dark:text-stone-400 tracking-widest font-bold rounded-md uppercase">
                            {currentCard.category.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-stone-400">
                          {currentIndex + 1} / {filteredCards.length}
                        </span>
                      </div>

                      {/* Core Content */}
                      <div className="py-6 flex flex-col items-center justify-center text-center flex-1 max-w-xl mx-auto relative z-10 px-2">
                        {showVerseFirst ? (
                          <blockquote className="text-lg md:text-xl font-serif text-stone-800 dark:text-stone-100 leading-relaxed tracking-wide italic select-all">
                            "{currentCard.verse}"
                          </blockquote>
                        ) : (
                          <div className="flex flex-col items-center gap-3">
                            <span className="p-3 bg-amber-500/10 text-[#d4af37] rounded-2xl border border-amber-500/25 mb-1 animate-pulse">
                              <BookOpen className="h-7 w-7" />
                            </span>
                            <h3 className="text-2xl font-heading font-semibold text-[#d4af37] dark:text-amber-400 tracking-wider">
                              {currentCard.reference}
                            </h3>
                            <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase">
                              {currentCard.testment} • {currentCard.book}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer */}
                      <div className="flex items-center justify-between border-t border-stone-100 dark:border-stone-850 pt-3.5 relative z-10 text-[10px] font-mono tracking-widest uppercase text-[#d4af37] font-semibold">
                        <span className="flex items-center gap-1">
                          <RotateCw className="h-3.5 w-3.5 text-stone-400 mr-1 animate-spin-slow" />
                          TAP TO REVEAL
                        </span>
                        <span className="text-stone-400">
                          {currentCard.testment}
                        </span>
                      </div>
                    </div>

                    {/* BACK OF THE CARD */}
                    <div 
                      className="absolute inset-0 w-full h-full bg-[#faf8f4] dark:bg-[#151225] border-2 border-[#d4af37]/30 dark:border-[#d4af37]/20 rounded-3xl p-6 md:p-8 shadow-xl flex flex-col justify-between overflow-hidden"
                      style={{ 
                        transform: "rotateY(180deg)",
                        backfaceVisibility: "hidden", 
                        WebkitBackfaceVisibility: "hidden",
                        zIndex: flipped ? 10 : 0
                      }}
                    >
                      {/* Sacred watermarks */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.015] dark:opacity-[0.03] select-none pointer-events-none">
                        <BookOpen className="h-56 w-56 text-[#d4af37]" />
                      </div>
                      
                      {/* Top Header */}
                      <div className="flex items-center justify-between border-b border-stone-200/50 dark:border-stone-850 pb-3 relative z-10">
                        <span className="px-2.5 py-1 bg-[#d4af37]/10 dark:bg-amber-400/5 text-[#d4af37] text-[9px] font-mono tracking-wider font-bold rounded-md">
                          ANSWER REVEALED
                        </span>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-400">
                          <span>{currentCard.book}</span>
                        </div>
                      </div>

                      {/* Core Content */}
                      <div className="py-6 flex flex-col items-center justify-center text-center flex-1 max-w-xl mx-auto relative z-10 px-2">
                        {!showVerseFirst ? (
                          <div className="flex flex-col gap-3">
                            <blockquote className="text-base md:text-lg font-serif text-stone-800 dark:text-stone-105 leading-relaxed tracking-wide italic">
                              "{currentCard.verse}"
                            </blockquote>
                            <div className="h-px w-20 bg-amber-500/20 mx-auto my-1" />
                            <h4 className="text-xs font-semibold text-[#d4af37] dark:text-amber-450 tracking-wider font-heading uppercase">
                              {currentCard.reference}
                            </h4>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 text-center">
                            <h3 className="text-2xl font-heading font-semibold text-[#d4af37] dark:text-amber-400 tracking-wider">
                              {currentCard.reference}
                            </h3>
                            <span className="text-[10px] font-mono text-stone-400 tracking-widest uppercase mb-4 block">
                              {currentCard.testment}
                            </span>
                            <div className="p-4 bg-white/70 dark:bg-stone-950/70 border border-stone-200/50 dark:border-stone-850/80 rounded-2xl text-left max-w-md shadow-xs">
                              <span className="text-[9px] font-mono tracking-wider text-[#d4af37] dark:text-amber-450 uppercase font-bold block mb-1">
                                Devotional Contemplation
                              </span>
                              <p className="text-[10.5px] leading-relaxed text-stone-650 dark:text-stone-300 font-sans">
                                {currentCard.devotional}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer */}
                      <div className="flex items-center justify-between border-t border-stone-200/50 dark:border-stone-850 pt-3.5 relative z-10 text-[10px] font-mono tracking-widest uppercase text-[#d4af37] font-semibold">
                        <span className="flex items-center gap-1">
                          <RotateCw className="h-3.5 w-3.5 text-[#d4af37]/60 mr-1 animate-spin-slow" />
                          TAP TO RE-FLIP
                        </span>
                        <span className="text-stone-400">
                          {currentCard.category} Set
                        </span>
                      </div>
                    </div>

                  </motion.div>
                </div>

                {/* Study Deck Navigation controls */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Left-Right Steppers */}
                  <div className="flex items-center gap-2 bg-white dark:bg-[#12101e] border border-stone-200 dark:border-stone-850 p-1 rounded-xl shadow-xs">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                      }}
                      className="p-2.5 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-105 hover:bg-stone-50 dark:hover:bg-white/[0.02] cursor-pointer"
                      title="Previous Card"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-xs font-mono font-bold text-stone-600 dark:text-stone-400 px-4 min-w-[70px] text-center select-none border-x border-stone-105 dark:border-stone-850/80">
                      {currentIndex + 1} / {filteredCards.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                      }}
                      className="p-2.5 rounded-lg text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-105 hover:bg-stone-50 dark:hover:bg-white/[0.02] cursor-pointer"
                      title="Next Card"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>

                  {/* Shuffle and Check Mastered Action Buttons */}
                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShuffle();
                      }}
                      className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-stone-250 dark:border-stone-850 bg-white dark:bg-stone-950 text-xs font-mono font-bold text-stone-650 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 hover:bg-stone-50 dark:hover:bg-white/[0.01] cursor-pointer h-10 shadow-3xs"
                    >
                      <RefreshCw className="h-3.5 w-3.5 fill-transparent" />
                      SHUFFLE DECK
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMastered(currentCard.id);
                      }}
                      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold cursor-pointer h-10 transition-all ${
                        masteredIds.includes(currentCard.id)
                          ? "bg-emerald-500/10 border border-emerald-500/35 text-emerald-600 dark:text-emerald-450 shadow-inner"
                          : "bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 dark:from-amber-400 dark:to-amber-500 dark:text-stone-950 font-bold shadow-xs hover:scale-[1.01]"
                      }`}
                    >
                      {masteredIds.includes(currentCard.id) ? (
                        <>
                          <Check className="h-4 w-4 stroke-[3]" />
                          MASTERED!
                        </>
                      ) : (
                        <>
                          <Bookmark className="h-4 w-4" />
                          MARK LOGIC LEARNED
                        </>
                      )}
                    </button>
                  </div>

                </div>

              </div>
            ) : (
              <div className="bg-white dark:bg-[#12101d] border border-stone-250/60 dark:border-stone-850 p-10 rounded-2xl text-center shadow-xs">
                <AlertCircle className="h-10 w-10 text-stone-400 dark:text-stone-500 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-stone-700 dark:text-stone-300 uppercase font-mono mb-1">
                  No Bible Cards Available
                </h4>
                <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
                  No cards matched that particular theological filter. Expand your selection to load all categories.
                </p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* --- RENDER MULTIPLE CHOICE QUIZ --- */}
      {activeMode === "quiz" && quizQuestion && (
        <div className="max-w-2xl mx-auto w-full bg-white dark:bg-[#12101d] border border-stone-200 dark:border-stone-850 rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 animate-fadeIn relative">
          
          {/* Sacred design watermark lines */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-250 to-amber-500" />
          
          {/* Score header widgets */}
          <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-150/60 dark:border-stone-850/80">
            <div className="flex items-center gap-2">
              <span className="p-1 px-2.5 bg-amber-500/10 text-[#d4af37] rounded-md font-mono text-[9px] font-bold tracking-wider">
                CARD GAME
              </span>
              <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                Test your knowledge of the Word
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">SCORE</span>
                <span className="font-mono font-bold text-[#d4af37] text-sm">
                  {quizScore} <span className="text-stone-400 text-xs">/ {quizTotal}</span>
                </span>
              </div>
              <button
                onClick={() => {
                  setQuizScore(0);
                  setQuizTotal(0);
                  generateQuizQuestion();
                }}
                title="Reset Quiz Score"
                className="p-1.5 hover:bg-stone-105 dark:hover:bg-stone-900 rounded-lg text-stone-400 hover:text-[#d4af37] transition-colors cursor-pointer"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Question Segment */}
          <div className="text-center py-4 mb-6 px-4 bg-stone-50 dark:bg-stone-950/60 rounded-2xl border border-stone-200/55 dark:border-stone-850">
            <span className="text-[10px] font-mono tracking-widest text-stone-400 uppercase font-semibold block mb-3">
              Identify the source coordinates of this holy passage:
            </span>
            <blockquote className="text-lg font-serif italic text-stone-800 dark:text-stone-50 leading-relaxed max-w-lg mx-auto">
              "{quizQuestion.verse}"
            </blockquote>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            {quizOptions.map((opt, idx) => {
              const isSelected = selectedQuizOption === opt;
              const isCorrectOpt = opt === quizQuestion.reference;
              
              // Styling helper logic
              let optionStyle = "border-stone-200 dark:border-stone-850 hover:bg-stone-50 dark:hover:bg-white/[0.01] hover:border-amber-500/30";
              if (hasAnsweredQuiz) {
                if (isCorrectOpt) {
                  optionStyle = "bg-emerald-500/10 border-emerald-500/50 text-emerald-600 dark:text-emerald-450 font-bold";
                } else if (isSelected) {
                  optionStyle = "bg-rose-500/10 border-rose-500/40 text-rose-600 dark:text-rose-450";
                } else {
                  optionStyle = "opacity-50 border-stone-200/60 dark:border-stone-900/60";
                }
              } else if (isSelected) {
                optionStyle = "border-amber-500 bg-amber-500/5 text-[#d4af37]";
              }

              return (
                <button
                  key={idx}
                  disabled={hasAnsweredQuiz}
                  onClick={() => submitQuizAnswer(opt)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border text-xs font-mono font-bold tracking-wider text-left transition-all cursor-pointer select-none ${optionStyle}`}
                >
                  <span className="flex items-center gap-3">
                    <span className="text-[10px] text-stone-400 dark:text-stone-500">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <span>{opt}</span>
                  </span>
                  {hasAnsweredQuiz && (
                    <span>
                      {isCorrectOpt && <CheckCircle className="h-4.5 w-4.5 text-emerald-500" />}
                      {!isCorrectOpt && isSelected && <AlertCircle className="h-4.5 w-4.5 text-rose-550" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Post Answer reflection & next button */}
          {hasAnsweredQuiz && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4 border-t border-stone-150/60 dark:border-stone-850 pt-5 mt-5"
            >
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-stone-50/50 dark:bg-stone-950/40 border border-stone-200/50 dark:border-stone-850">
                <span className={`p-2 rounded-lg shrink-0 ${isAnswerCorrect ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-[#d4af37]"}`}>
                  {isAnswerCorrect ? (
                    <Trophy className="h-5 w-5 animate-bounce" />
                  ) : (
                    <HelpCircle className="h-5 w-5" />
                  )}
                </span>
                <div>
                  <h4 className="text-xs font-bold text-stone-900 dark:text-stone-100 uppercase tracking-wide mb-1 font-mono">
                    {isAnswerCorrect ? "Acolyte Answer Correct!" : "Reviewing the Scriptures"}
                  </h4>
                  <p className="text-[10.5px] leading-relaxed text-stone-550 dark:text-stone-405 font-sans">
                    {isAnswerCorrect 
                      ? `Indeed, this wonderful passage is written in ${quizQuestion.book}. Blessed are those who reflect on His scripture.`
                      : `The correct answer was ${quizQuestion.reference}. This is from the book of ${quizQuestion.book}. Let us meditate on it again.`
                    }
                  </p>
                  <p className="text-[10px] italic text-stone-400 dark:text-stone-400 mt-2">
                    "{quizQuestion.devotional}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end">
                <button
                  onClick={generateQuizQuestion}
                  className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 dark:from-amber-400 dark:to-amber-500 text-stone-950 font-bold font-mono text-xs uppercase cursor-pointer hover:scale-[1.02] active:scale-95 shadow-md self-end transition-all"
                >
                  <span>NEXT QUESTION</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          )}

        </div>
      )}

    </div>
  );
}
