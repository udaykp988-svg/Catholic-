import React, { useState, useEffect } from "react";
import { 
  Search, Star, BookOpen, Clock, Heart, Sparkles, Copy, 
  Check, Info, Flame, ChevronRight, X, AlertCircle, RefreshCw
} from "lucide-react";
import { Saint, PersonalIntention } from "../types";
import { LITURGICAL_SAINTS } from "../data/saints";

interface SaintsCatalogTabProps {
  personalIntentions?: PersonalIntention[];
  onAddIntentionNote?: (intentionId: string, noteText: string) => void;
  searchQuery?: string;
  onSearchQueryChange?: (query: string) => void;
}

export default function SaintsCatalogTab({ 
  personalIntentions = [], 
  onAddIntentionNote,
  searchQuery: externalSearchQuery,
  onSearchQueryChange
}: SaintsCatalogTabProps) {
  // --- STATE ---
  const [saints, setSaints] = useState<Saint[]>(LITURGICAL_SAINTS);
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  
  const searchQuery = externalSearchQuery !== undefined ? externalSearchQuery : localSearchQuery;
  const setSearchQuery = onSearchQueryChange || setLocalSearchQuery;
  const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const saved = localStorage.getItem("catholic_favorite_saints");
    return saved ? JSON.parse(saved) : [];
  });
  
  // Custom saint explorer state (dynamic API)
  const [exploreQuery, setExploreQuery] = useState("");
  const [exploreResult, setExploreResult] = useState<Saint | null>(null);
  const [isExploring, setIsExploring] = useState(false);
  const [exploreError, setExploreError] = useState<string | null>(null);

  // Intercession Candle lighting state
  const [isInterceding, setIsInterceding] = useState(false);
  const [intercedeIntention, setIntercedeIntention] = useState("");
  const [customIntentionText, setCustomIntentionText] = useState("");
  const [candleLit, setCandleLit] = useState(false);
  const [candleText, setCandleText] = useState("");

  const [copied, setCopied] = useState<string | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<"catalog" | "explore">("catalog");

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem("catholic_favorite_saints", JSON.stringify(favorites));
  }, [favorites]);

  // Toggle favorite
  const toggleFavorite = (saintId: string) => {
    setFavorites(prev => {
      if (prev.includes(saintId)) {
        return prev.filter(id => id !== saintId);
      } else {
        return [...prev, saintId];
      }
    });
  };

  // Copy prayer text helper
  const handleCopyPrayer = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  // Handle Dynamic Saint Exploration from Express backend
  const handleExploreSaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exploreQuery.trim()) return;

    setIsExploring(true);
    setExploreError(null);
    setExploreResult(null);

    try {
      const response = await fetch(`/api/saints/explore?q=${encodeURIComponent(exploreQuery.trim())}`);
      if (!response.ok) {
        throw new Error("Unable to fetch biographical data for this saint. Please verify connection.");
      }
      const data = await response.json();
      setExploreResult(data);
      
      // If the result isn't already in our local listing, let's gracefully keep track of it
      if (data && !saints.some(s => s.name.toLowerCase() === data.name.toLowerCase() || s.id === data.id)) {
        setSaints(prev => [...prev, data]);
      }
    } catch (err: any) {
      setExploreError(err.message || "Something went wrong while connecting with the hagiography engine.");
    } finally {
      setIsExploring(false);
    }
  };

  // Trigger Candle lighting/Intercession
  const handleLightCandle = (saint: Saint) => {
    setIsInterceding(true);
    setCandleLit(false);
    setCandleText("");
    
    // Default intention to the first one available if any
    if (personalIntentions.length > 0) {
      setIntercedeIntention(personalIntentions[0].id);
    } else {
      setIntercedeIntention("custom");
    }
  };

  const submitIntercession = (saint: Saint) => {
    let intentionTitle = "";
    if (intercedeIntention === "custom") {
      intentionTitle = customIntentionText.trim() || "peace and strength";
    } else {
      const found = personalIntentions.find(i => i.id === intercedeIntention);
      intentionTitle = found ? found.title : "spiritual support";
    }

    setCandleText(`A virtual holy votive candle has been lit at the altar seek the intercession of ${saint.name} for your intention: "${intentionTitle}".`);
    setCandleLit(true);

    // If there is an option and callback to append a note to personal intention, let's append it!
    if (onAddIntentionNote && intercedeIntention !== "custom") {
      const timestamp = new Date().toLocaleDateString();
      onAddIntentionNote(
        intercedeIntention, 
        `Lit intercession candle to ${saint.name} on ${timestamp}. Ask for their pray support: "${saint.patronage}".`
      );
    }
  };

  // Clean filters for liturgical search
  const filteredSaints = saints.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.patronage.toLowerCase().includes(q) ||
      s.era.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q)
    );
  });

  const favoritedSaintsList = saints.filter(s => favorites.includes(s.id));

  // Visual helper to map liturgical colors to Tailwind styles
  const getColorStyles = (color: string) => {
    switch (color) {
      case "red":
        return {
          bg: "bg-red-500/10 dark:bg-red-500/5",
          border: "border-red-500/20 dark:border-red-500/30",
          text: "text-red-600 dark:text-red-400",
          accent: "red",
          glow: "shadow-red-500/10",
          badge: "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-950/40 dark:text-red-400"
        };
      case "blue":
        return {
          bg: "bg-blue-500/10 dark:bg-blue-500/5",
          border: "border-blue-500/20 dark:border-blue-500/30",
          text: "text-blue-600 dark:text-blue-400",
          accent: "blue",
          glow: "shadow-blue-500/10",
          badge: "bg-blue-100 hover:bg-blue-200 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400"
        };
      case "green":
        return {
          bg: "bg-emerald-500/10 dark:bg-emerald-500/5",
          border: "border-emerald-500/20 dark:border-emerald-500/30",
          text: "text-emerald-600 dark:text-emerald-400",
          accent: "emerald",
          glow: "shadow-emerald-500/10",
          badge: "bg-emerald-100 hover:bg-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400"
        };
      case "violet":
        return {
          bg: "bg-violet-500/10 dark:bg-violet-500/5",
          border: "border-violet-500/20 dark:border-violet-500/30",
          text: "text-violet-600 dark:text-violet-400",
          accent: "violet",
          glow: "shadow-violet-500/10",
          badge: "bg-violet-100 hover:bg-violet-200 text-violet-800 dark:bg-violet-950/40 dark:text-violet-400"
        };
      case "rose":
        return {
          bg: "bg-rose-500/10 dark:bg-rose-500/5",
          border: "border-rose-500/20 dark:border-rose-500/30",
          text: "text-rose-600 dark:text-rose-400",
          accent: "rose",
          glow: "shadow-rose-500/10",
          badge: "bg-rose-100 hover:bg-rose-200 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400"
        };
      default: // white / gold
        return {
          bg: "bg-[#8b4513]/5 dark:bg-[#8b4513]/[0.02]",
          border: "border-[#8b4513]/15",
          text: "text-[#6b3410]",
          accent: "amber",
          glow: "shadow-amber-500/10",
          badge: "bg-amber-100 hover:bg-amber-200 text-amber-800 dark:bg-amber-950/40"
        };
    }
  };

  return (
    <div className="space-y-6">
      {/* Title Header Card */}
      <div className="bg-[#faf7f0] dark:bg-[#f5f0e8] rounded-2xl border border-stone-200 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-heading font-semibold text-stone-900 flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-[#8b4513]" />
              Saints & Intercessors Catalog
            </h2>
            <p className="text-xs text-stone-500 font-sans mt-1.5 max-w-2xl leading-relaxed">
              Explore the lives, patrongages, and prayers of the saints referenced in the liturgical calendar. 
              Mark them as favorites to draft them as intercessory guardians on your spiritual trek.
            </p>
          </div>
          <div className="flex bg-stone-100 rounded-xl p-1 shrink-0 max-w-fit">
            <button
              onClick={() => setActiveSubTab("catalog")}
              className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                activeSubTab === "catalog"
                  ? "bg-[#faf7f0] shadow-xs text-stone-900"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              Liturgical Calendar
            </button>
            <button
              onClick={() => setActiveSubTab("explore")}
              className={`px-4 py-2 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                activeSubTab === "explore"
                  ? "bg-[#faf7f0] shadow-xs text-stone-900"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              <Sparkles className="h-3 w-3 text-[#8b4513]" />
              Explore Any Saint
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Favorites Panel + Content tab */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column: Favorites & Quick Index */}
        <div className="lg:col-span-1 space-y-6">
          {/* Favorites List */}
          <div className="bg-[#faf7f0] dark:bg-[#f5f0e8] rounded-2xl border border-stone-200 p-4 shadow-sm">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#6b3410] mb-3 flex items-center gap-2">
              <Star className="h-4 w-4 fill-[#8b4513] text-[#8b4513]" />
              My Intercessors ({favoritedSaintsList.length})
            </h3>
            
            {favoritedSaintsList.length === 0 ? (
              <div className="py-6 px-2 text-center border border-dashed border-stone-200 rounded-xl">
                <p className="text-[11px] text-stone-400 italic">
                  No favorited saints yet. Tap the star icon on any saint card to keep them close.
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
                {favoritedSaintsList.map(s => {
                  const sStyles = getColorStyles(s.color);
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedSaint(s)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl border border-stone-150 bg-stone-50/50 hover:bg-stone-50 transition-colors text-left cursor-pointer group`}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="font-heading font-medium text-xs text-stone-800 group-hover:text-[#6b3410] dark:group-hover:text-[#a0520f] truncate">
                          {s.name}
                        </div>
                        <div className="text-[10px] text-stone-500 truncate font-sans">
                          {s.patronage}
                        </div>
                      </div>
                      <ChevronRight className="h-3.5 w-3.5 text-stone-400 shrink-0" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Core Tip Card */}
          <div className="bg-gradient-to-br from-[#d4af37]/5 to-transparent border border-[#8b4513]/10 rounded-2xl p-4 text-[11px] line-relaxed text-stone-500 font-sans space-y-2.5">
            <div className="flex items-center gap-2 text-amber-700 font-bold font-mono uppercase tracking-wider">
              <Flame className="h-4 w-4" />
              What is Intercession?
            </div>
            <p className="leading-relaxed">
              In Catholic doctrine, saints in heaven stand before the Divine King. When we ask a saint to "pray for us", 
              they join their prayers with our earthly voice to strengthen our intentions.
            </p>
          </div>
        </div>

        {/* Right column: Content View based on active sub tab */}
        <div className="lg:col-span-3 space-y-4">
          
          {activeSubTab === "catalog" && (
            <>
              {/* Search & Filter bar */}
              <div className="bg-[#faf7f0] dark:bg-[#f5f0e8] rounded-2xl border border-stone-200 p-4 flex gap-3 shadow-xs">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-stone-400">
                    <Search className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search saints by name, patronage, or century (e.g. Peter, Lost Causes, 20th Century)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#8b4513] focus:border-transparent transition-all"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Grid lists */}
              {filteredSaints.length === 0 ? (
                <div className="bg-[#faf7f0] dark:bg-[#f5f0e8] rounded-2xl border border-stone-200 p-12 text-center">
                  <Info className="h-10 w-10 text-stone-400 mx-auto mb-3" />
                  <h4 className="font-heading text-sm font-semibold text-stone-800">No Saints Found</h4>
                  <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                    Try checking your spelling or explore any other saint in the top right "Explore Any Saint" tab where you can search the global roster!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSaints.map(saint => {
                    const isFav = favorites.includes(saint.id);
                    const stylistic = getColorStyles(saint.color);
                    
                    return (
                      <div 
                        key={saint.id}
                        className={`bg-[#faf7f0] dark:bg-[#f5f0e8] rounded-2xl border ${stylistic.border} hover:border-[#d4af37]/45 p-5 shadow-inner/10 hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative`}
                      >
                        {/* Upper Details */}
                        <div>
                          <div className="flex justify-between items-start gap-3">
                            <div>
                              <span className="text-[9px] font-mono uppercase tracking-widest font-bold text-stone-400">
                                {saint.era} • FEAST: {saint.feastDay}
                              </span>
                              <h3 className="font-heading text-[15px] font-semibold text-stone-900 mt-0.5 select-none inline-flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: saint.color === 'blue' ? '#3B82F6' : saint.color === 'red' ? '#EF4444' : saint.color === 'green' ? '#10B981' : saint.color === 'violet' ? '#8B5CF6' : saint.color === 'rose' ? '#F43F5E' : '#F59E0B' }} />
                                {saint.name}
                              </h3>
                              <p className="text-[10px] text-amber-700 font-medium italic mt-0.5 line-clamp-1">
                                {saint.title}
                              </p>
                            </div>

                            {/* Fav Buttons */}
                            <button
                              type="button"
                              onClick={() => toggleFavorite(saint.id)}
                              className="p-2 rounded-full cursor-pointer transition-colors duration-200 bg-stone-50 hover:bg-stone-100 hover:text-[#8b4513]"
                              title={isFav ? "Remove from favorite intercessors" : "Mark as favorite intercessor"}
                            >
                              <Star className={`h-4.5 w-4.5 transition-all ${isFav ? "fill-[#8b4513] text-[#8b4513]" : "text-stone-400"}`} />
                            </button>
                          </div>

                          {/* Patronage list */}
                          <div className="mt-3.5 space-y-1.5">
                            <div className="text-[11px] font-sans text-stone-600 line-clamp-2 leading-relaxed">
                              <strong>Patron of:</strong> {saint.patronage}
                            </div>
                            <p className="text-[11px] text-stone-500 font-sans line-clamp-3 leading-relaxed">
                              {saint.biography}
                            </p>
                          </div>
                        </div>

                        {/* Virtues and Action Buttons */}
                        <div className="mt-5 pt-3 border-t border-stone-100 flex flex-wrap gap-1.5 justify-between items-center bg-stone-50/[0.01]">
                          <div className="flex gap-1">
                            {saint.virtues.slice(0, 2).map((v, idx) => (
                              <span key={idx} className="text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200/50">
                                {v}
                              </span>
                            ))}
                          </div>

                          <div className="flex gap-1.5 shrink-0">
                            <button
                              onClick={() => handleLightCandle(saint)}
                              className="px-2.5 py-1 text-[10px] font-mono font-bold text-amber-700 bg-[#8b4513]/10 hover:bg-[#8b4513]/20 rounded-lg cursor-pointer transition-all flex items-center gap-1"
                              title="Light intersession candle"
                            >
                              <Flame className="h-3 w-3 animate-pulse" />
                              <span>Intercede</span>
                            </button>
                            
                            <button
                              onClick={() => setSelectedSaint(saint)}
                              className="px-2.5 py-1 text-[10px] font-mono font-bold text-stone-700 hover:text-stone-950 bg-stone-100 hover:bg-stone-200 rounded-lg cursor-pointer transition-all"
                            >
                              Learn More
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {activeSubTab === "explore" && (
            <div className="bg-[#faf7f0] dark:bg-[#f5f0e8] rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
              <div className="max-w-xl">
                <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-[#6b3410] flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4" />
                  Dynamic AI Saint Hagiography
                </h3>
                <p className="text-[11px] text-stone-500 font-sans leading-relaxed mt-1">
                  Type the name of any Roman Catholic, Eastern, or historic saint (e.g., "Saint Thomas Aquinas", "Saint Benedict of Nursia", "Saint Dymphna", "Saint Joan of Arc"). Our server API will query a theological hagiographical model to fetch full patronages, history, virtues, and an intercessory prayer.
                </p>
              </div>

              {/* Exploration Form */}
              <form onSubmit={handleExploreSaint} className="flex gap-2 max-w-xl">
                <input
                  type="text"
                  required
                  placeholder="e.g. Saint Benedict, Saint Anthony of Padua, Saint Lucy..."
                  value={exploreQuery}
                  onChange={(e) => setExploreQuery(e.target.value)}
                  disabled={isExploring}
                  className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-sans text-stone-800 placeholder-stone-400 focus:outline-hidden focus:ring-1 focus:ring-[#8b4513] focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={isExploring || !exploreQuery.trim()}
                  className="px-5 py-2.5 bg-[#f0e8d8] text-[#8b4513] border border-stone-800 dark:bg-[#8b4513] text-xs font-mono font-bold rounded-xl hover:bg-[#f0e8d8] transition-all cursor-pointer flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {isExploring ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Searching...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Explore</span>
                    </>
                  )}
                </button>
              </form>

              {exploreError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl max-w-xl flex gap-3 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Lookup Failed</span>
                    {exploreError}
                  </div>
                </div>
              )}

              {/* Results View */}
              {exploreResult && (
                <div className={`border p-6 rounded-2xl bg-stone-50/30 animate-fadeIn max-w-2xl relative ${getColorStyles(exploreResult.color).border}`}>
                  
                  {/* Category Accent Background Indicator */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${getColorStyles(exploreResult.color).bg} ${getColorStyles(exploreResult.color).text}`}>
                      {exploreResult.era}
                    </span>
                    <button
                      onClick={() => toggleFavorite(exploreResult.id)}
                      className="p-1.5 rounded-full bg-[#faf7f0] border border-stone-100 shadow-sm text-stone-400 hover:text-[#8b4513]"
                      title="Favorite this saint"
                    >
                      <Star className={`h-4.5 w-4.5 ${favorites.includes(exploreResult.id) ? "fill-[#8b4513] text-[#8b4513]" : ""}`} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8b4513]">
                        {exploreResult.title}
                      </span>
                      <h4 className="font-heading text-lg font-bold text-stone-900 mt-1">
                        {exploreResult.name}
                      </h4>
                      <p className="text-[11px] font-sans text-stone-500">
                        <strong>Feast Day:</strong> {exploreResult.feastDay} | <strong>Patron of:</strong> {exploreResult.patronage}
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-stone-250/20 pt-3">
                      <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                        Spiritual Biography
                      </h5>
                      <p className="text-xs text-stone-600 leading-relaxed font-sans">
                        {exploreResult.biography}
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-stone-250/20 pt-3">
                      <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                        Sanctuary Virtues
                      </h5>
                      <div className="flex flex-wrap gap-1.5">
                        {exploreResult.virtues.map((v, i) => (
                          <span key={i} className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#8b4513]/10 text-amber-700 border border-[#8b4513]/10">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>

                    {exploreResult.traditionalPrayer && (
                      <div className="space-y-2 border-t border-stone-250/20 pt-3">
                        <div className="flex justify-between items-center">
                          <h5 className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                            <Star className="h-3 w-3 inline text-[#8b4513]" />
                            Intercessory Prayer
                          </h5>
                          <button
                            type="button"
                            onClick={() => handleCopyPrayer(exploreResult.traditionalPrayer, exploreResult.id)}
                            className="text-[9px] font-mono font-bold text-stone-400 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                          >
                            {copied === exploreResult.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-emerald-500">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span>Copy Prayer</span>
                              </>
                            )}
                          </button>
                        </div>
                        <div className="p-3 bg-stone-100/50 rounded-xl border border-stone-150">
                          <p className="text-xs leading-relaxed text-stone-600 italic font-sans">
                            {exploreResult.traditionalPrayer}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex gap-2">
                      <button
                        onClick={() => handleLightCandle(exploreResult)}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm shadow-amber-500/10 select-none animate-pulse"
                      >
                        <Flame className="h-3.5 w-3.5" />
                        <span>Light Intercession Candle</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* --- MODAL 1: SAINT LEARN MORE MODAL --- */}
      {selectedSaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#f0e8d8] backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#faf7f0] dark:bg-[#f5f0e8] rounded-2xl border border-stone-200 p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative space-y-5">
            <button
              onClick={() => setSelectedSaint(null)}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-800 transition-colors bg-stone-50 rounded-lg cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#8b4513]">
                {selectedSaint.era} • FEAST DAY: {selectedSaint.feastDay}
              </span>
              <h3 className="font-heading text-xl font-bold text-stone-900 mt-1 select-none flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selectedSaint.color === 'blue' ? '#3B82F6' : selectedSaint.color === 'red' ? '#EF4444' : selectedSaint.color === 'green' ? '#10B981' : selectedSaint.color === 'violet' ? '#8B5CF6' : selectedSaint.color === 'rose' ? '#F43F5E' : '#F59E0B' }} />
                {selectedSaint.name}
              </h3>
              <p className="text-xs text-amber-700 font-medium italic mt-1">
                {selectedSaint.title}
              </p>
            </div>

            <div className="space-y-2 border-t border-stone-200/50 pt-4 text-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                Sanctuary Patronage
              </span>
              <p className="text-stone-750 font-sans leading-relaxed">
                {selectedSaint.patronage}
              </p>
            </div>

            <div className="space-y-2 border-t border-stone-200/50 pt-4 text-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                Faith Biography Story
              </span>
              <p className="text-stone-600 font-sans leading-relaxed text-xs">
                {selectedSaint.biography}
              </p>
            </div>

            <div className="space-y-2 border-t border-stone-200/50 pt-4 text-xs">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                Core Virtues
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedSaint.virtues.map((v, i) => (
                  <span key={i} className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200/50">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {selectedSaint.traditionalPrayer && (
              <div className="space-y-2.5 border-t border-stone-200/50 pt-4 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                    Traditional Intercession Prayer
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyPrayer(selectedSaint.traditionalPrayer, selectedSaint.id)}
                    className="text-[9px] font-mono font-bold text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copied === selectedSaint.id ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3" />
                        <span>Copy Prayer</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-150 text-stone-600 italic font-sans leading-relaxed">
                  "{selectedSaint.traditionalPrayer}"
                </div>
              </div>
            )}

            <div className="border-t border-stone-200/50 pt-4 flex gap-2">
              <button
                onClick={() => {
                  setSelectedSaint(null);
                  handleLightCandle(selectedSaint);
                }}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-xs"
              >
                <Flame className="h-3.5 w-3.5" />
                <span>Begin Sacred Intercession</span>
              </button>
              
              <button
                onClick={() => {
                  toggleFavorite(selectedSaint.id);
                }}
                className={`px-4 py-2.5 border text-xs font-mono font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors ${
                  favorites.includes(selectedSaint.id)
                    ? "border-[#8b4513]/20 bg-[#8b4513]/10 text-amber-700"
                    : "border-stone-200 text-stone-600 hover:bg-stone-50"
                }`}
              >
                <Star className={`h-3.5 w-3.5 ${favorites.includes(selectedSaint.id) ? "fill-[#8b4513] text-[#8b4513]" : ""}`} />
                <span>{favorites.includes(selectedSaint.id) ? "Favorited" : "Favorite"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL 2: INTERCESSORY ALtar CANDLE LIGHTING MODAL --- */}
      {isInterceding && selectedSaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#f0e8d8] backdrop-blur-xs animate-fadeIn">
          <div className="bg-[#faf7f0] dark:bg-[#f5f0e8] rounded-2xl border border-stone-200 p-6 max-w-md w-full shadow-2xl relative text-center space-y-5">
            
            <button
              onClick={() => {
                setIsInterceding(false);
                setCandleLit(false);
                setCandleText("");
              }}
              className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-800 transition-colors bg-stone-50 rounded-lg cursor-pointer"
            >
              <X className="h-4.5 w-4.5" />
            </button>

            {/* Candle Graphic and Glow */}
            <div className="py-6 flex flex-col items-center justify-center relative">
              <div className="relative">
                {/* Candle flame block */}
                <div className={`w-3.5 h-[50px] bg-amber-100 dark:bg-amber-200/90 rounded-t-sm relative shadow-md ${candleLit ? "shadow-amber-500/40" : ""}`}>
                  {/* Wick */}
                  <div className="absolute -top-1.5 left-1.5 w-[2px] h-2 bg-[#f0e8d8]" />
                </div>
                
                {/* Animated flame */}
                {candleLit && (
                  <div className="absolute -top-6 left-[-1.5px] w-4.5 h-[26px] bg-gradient-to-t from-red-500 via-amber-450 to-amber-100 rounded-full animate-pulse opacity-90 origin-bottom ring-2 ring-amber-400/20 blur-[0.5px]">
                    <span className="absolute bottom-0.5 left-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 blur-[0.5px] opacity-80" />
                  </div>
                )}
              </div>
              <div className="h-0.5 w-[70px] bg-stone-200 rounded-full shadow-md mt-1" />
            </div>

            <div>
              <h4 className="font-heading text-base font-bold text-stone-900">
                {candleLit ? "Candle is Burning" : "Altar of Intercession"}
              </h4>
              <p className="text-[11px] text-stone-500 font-sans mt-1">
                Bring your personal intention before <strong>{selectedSaint.name}</strong>, Patron of {selectedSaint.patronage.split(',')[0]}.
              </p>
            </div>

            {!candleLit ? (
              <div className="space-y-4 text-left max-h-[300px] overflow-y-auto">
                <div className="space-y-2">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400">
                    Connect to a Saved Intention:
                  </label>
                  
                  <div className="space-y-1.5">
                    {personalIntentions.filter(i => !i.answered).map(i => (
                      <label key={i.id} className="flex items-start gap-2.5 p-2 rounded-xl border border-stone-150 bg-stone-50 hover:bg-stone-100 cursor-pointer text-xs">
                        <input
                          type="radio"
                          name="intention-select"
                          checked={intercedeIntention === i.id}
                          onChange={() => setIntercedeIntention(i.id)}
                          className="mt-0.5"
                        />
                        <div className="font-sans text-stone-800">
                          <span className="font-semibold block truncate leading-tight">{i.title}</span>
                          <span className="text-[10px] block text-stone-400 truncate leading-snug">{i.description}</span>
                        </div>
                      </label>
                    ))}

                    <label className="flex items-start gap-2.5 p-2 rounded-xl border border-stone-150 bg-stone-50 hover:bg-stone-100 cursor-pointer text-xs">
                      <input
                        type="radio"
                        name="intention-select"
                        checked={intercedeIntention === "custom"}
                        onChange={() => setIntercedeIntention("custom")}
                        className="mt-0.5"
                      />
                      <div className="font-sans text-stone-800 w-full pr-1">
                        <span className="font-semibold block leading-tight">State a custom intention:</span>
                        {intercedeIntention === "custom" && (
                          <input
                            type="text"
                            required
                            placeholder="Type your prayer need here (e.g. grandad's health or exam calm)..."
                            value={customIntentionText}
                            onChange={(e) => setCustomIntentionText(e.target.value)}
                            className="w-full mt-1.5 px-3 py-1.5 bg-[#faf7f0] border border-stone-200 rounded-lg text-xs"
                          />
                        )}
                      </div>
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => submitIntercession(selectedSaint)}
                  className="w-full py-2.5 mt-2 bg-[#f0e8d8] hover:bg-[#f0e8d8] dark:bg-[#8b4513] hover:dark:bg-amber-450 font-mono font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 text-[#8b4513]"
                >
                  <Flame className="h-3.5 w-3.5" />
                  <span>Light Holy Votive Candle</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-3.5 bg-[#8b4513]/[0.03] border border-[#8b4513]/20 text-xs text-stone-600 font-sans leading-relaxed rounded-xl italic">
                  "{candleText}"
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-150 text-left text-[11px] leading-relaxed font-sans text-stone-500">
                  <span className="font-bold text-stone-700 uppercase block mb-1">Intercessory Counsel:</span>
                  As the candle burns, recite the intercession prayer to are beloved Saint:
                  <p className="mt-1.5 text-stone-600 italic font-semibold">
                    "{selectedSaint.traditionalPrayer}"
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsInterceding(false);
                    setCandleLit(false);
                    setCandleText("");
                  }}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-250 hover: text-stone-605 font-mono font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Close & Continue Meditations
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
