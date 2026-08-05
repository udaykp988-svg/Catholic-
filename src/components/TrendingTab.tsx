import React, { useState } from "react";
import { Flame, TrendingUp, Sparkles, BookOpen, Heart, Users, ChevronRight, CheckCircle, Volume2, Search, ExternalLink } from "lucide-react";

interface TrendingTabProps {
  onAddStatsPrayer: () => void;
}

interface TrendingItem {
  id: string;
  type: "prayer" | "novena" | "intention" | "saint";
  title: string;
  subtitle: string;
  text: string;
  participantsToday: number;
  incrementPercentage: number;
  sparkline: number[]; // numerical trend points
  color: string;
  glow: string;
}

const TRENDING_ITEMS: TrendingItem[] = [
  {
    id: "tr-1",
    type: "prayer",
    title: "Saint Michael Protection Shield",
    subtitle: "Evoked under heavy trials, physical adversity, and midnight anxieties.",
    text: "Saint Michael the Archangel, defend us in battle. Be our protection against the wickedness and snares of the devil. May God rebuke him, we humbly pray; and do thou, O Prince of the Heavenly Host, by the divine power of God, cast into hell Satan and all the evil spirits who roam throughout the world seeking the ruin of souls. Amen.",
    participantsToday: 6512,
    incrementPercentage: 112,
    sparkline: [20, 32, 28, 45, 52, 60, 68],
    color: "from-red-500/20 to-red-950/10 border-red-500/35 dark:border-red-500/20 text-red-600 dark:text-red-400",
    glow: "rgba(239, 68, 68, 0.45)"
  },
  {
    id: "tr-2",
    type: "novena",
    title: "St. Jude Novena for Desperate Matters",
    subtitle: "Active votive fires lit globally for hopeless situations and deep hope.",
    text: "Most holy Apostle, St. Jude, faithful servant and friend of Jesus, the Church honors and invokes you universally, as the patron of difficult cases, of things almost despaired of. Pray for me, I am so helpless and alone. Make use, I implore you, of that particular privilege given to you, to bring visible and speedy help where help is almost despaired of. Come to my assistance in this great need...",
    participantsToday: 8201,
    incrementPercentage: 247,
    sparkline: [40, 48, 55, 68, 72, 85, 94],
    color: "from-amber-500/20 to-amber-950/10 border-amber-500/35 text-[#6b3410]",
    glow: "rgba(245, 158, 11, 0.45)"
  },
  {
    id: "tr-3",
    type: "prayer",
    title: "The Litany of Humility",
    subtitle: "Gaining viral reflection spikes for modern offline fasts and quiet focus.",
    text: "O Jesus, meek and humble of heart, hear me. Deliver me, Jesus, from the desire of being esteemed, loved, extolled, honored, praised, preferred, consulted, and approved. Deliver me, Jesus, from the fear of being humbled, despised, rebuked, calumniated, forgotten, ridiculed, wronged, and suspected. Grant me, Jesus, the grace to desire that others may be more loved than I...",
    participantsToday: 3912,
    incrementPercentage: 86,
    sparkline: [12, 18, 22, 25, 30, 32, 40],
    color: "from-violet-500/20 to-violet-950/10 border-violet-500/35 dark:border-violet-500/20 text-violet-650 dark:text-violet-400",
    glow: "rgba(139, 92, 246, 0.45)"
  },
  {
    id: "tr-4",
    type: "prayer",
    title: "Anima Christi (Soul of Christ)",
    subtitle: "Profound Eucharistic communion thanksgiving prayer experiencing rapid devotion.",
    text: "Soul of Christ, sanctify me. Body of Christ, save me. Blood of Christ, inebriate me. Water from the side of Christ, wash me. Passion of Christ, strengthen me. O good Jesus, hear me. Within Thy wounds hide me. Suffer me not to be separated from Thee. From the malignant enemy defend me. In the hour of my death call me, and bid me come to Thee...",
    participantsToday: 5120,
    incrementPercentage: 98,
    sparkline: [18, 24, 25, 30, 38, 45, 48],
    color: "from-blue-500/20 to-blue-950/10 border-blue-500/35 dark:border-blue-500/20 text-blue-600 dark:text-blue-400",
    glow: "rgba(59, 130, 246, 0.45)"
  },
  {
    id: "tr-5",
    type: "saint",
    title: "Divine Mercy Chaplet",
    subtitle: "Uniting global pilgrims at 3:00 PM Hour of Mercy under Marian surrender.",
    text: "Eternal Father, I offer You the Body and Blood, Soul and Divinity of Your Dearly Beloved Son, Our Lord, Jesus Christ, in atonement for our sins and those of the whole world. For the sake of His sorrowful Passion, have mercy on us and on the whole world.",
    participantsToday: 7305,
    incrementPercentage: 154,
    sparkline: [30, 38, 42, 50, 58, 65, 72],
    color: "from-emerald-500/20 to-emerald-950/10 border-emerald-500/35 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
    glow: "rgba(16, 185, 129, 0.45)"
  }
];

export function TrendingTab({ onAddStatsPrayer }: TrendingTabProps) {
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [items, setItems] = useState<TrendingItem[]>(TRENDING_ITEMS);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [joinedItemId, setJoinedItemId] = useState<string | null>(null);

  const handleJoinDevotion = (itemId: string) => {
    setJoinedItemId(itemId);
    
    // Increment statistical projection
    setItems(prevItems => 
      prevItems.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            participantsToday: item.participantsToday + 1,
            incrementPercentage: item.incrementPercentage + 2
          };
        }
        return item;
      })
    );
    
    // Add stats count to main User Stats
    onAddStatsPrayer();

    // Reset visual flash
    setTimeout(() => {
      setJoinedItemId(null);
    }, 3000);
  };

  const selectedItem = items.find(i => i.id === selectedItemId);

  const filteredItems = items.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.subtitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Heading Intro Bento banner */}
      <div className="bg-[#faf7f0] border border-stone-200 rounded-2xl p-6 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-red-500/[0.04] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-2 -left-2 text-[120px] font-serif text-stone-200/10 pointer-events-none select-none font-bold">†</div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-red-500/20 to-red-600/5 p-3 rounded-2xl text-red-500 dark:text-red-400 mt-1 shadow-inner border border-red-500/25">
              <TrendingUp className="h-6 w-6 stroke-[1.5]" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-red-650 dark:text-red-400 font-bold uppercase block mb-1">
                Pilgrims In Prayer
              </span>
              <h3 className="text-xl font-heading font-semibold text-stone-900 tracking-wide">
                Trending Devotional Intercessions
              </h3>
              <p className="text-xs text-stone-500 mt-1 leading-relaxed font-sans">
                Real-time activity on Grace Sanctuary. Join thousands of pilgrims reciting powerful traditional prayers and starting critical novenas synchronously across the globe.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-stone-100 px-4 py-2 rounded-xl text-xs font-mono font-semibold text-stone-600 border border-stone-200 self-start md:self-auto shrink-0 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            <span className="tracking-widest uppercase">GLOBAL RADAR LIVE</span>
          </div>
        </div>
      </div>

      {/* Dynamic search bar */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search trending pleadings, traditional prayers, active saints..."
          className="w-full text-xs rounded-xl border border-stone-200 bg-[#faf7f0] p-3.5 pl-10 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#8b4513] shadow-sm"
        />
        <Search className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-stone-400" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Sparklined High Intensity trending items list */}
        <div className={`col-span-1 lg:col-span-12 space-y-4`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredItems.map((item, index) => {
              const isSelected = selectedItemId === item.id;
              const hasJoined = joinedItemId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItemId(isSelected ? null : item.id)}
                  className={`bg-[#faf7f0] border rounded-2xl p-5 hover:scale-[1.01] transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between min-h-[190px] shadow-sm select-none ${
                    isSelected 
                      ? "ring-1 ring-amber-500 border-amber-500/60" 
                      : "border-stone-200"
                  }`}
                >
                  
                  {/* Subtle corner flame aesthetic */}
                  <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-stone-100 px-2 py-1 rounded-lg text-[10px] font-mono text-stone-500">
                    <Flame className="h-3.5 w-3.5 text-[#8b4513] animate-pulse fill-[#8b4513]" />
                    <span>#{index + 1} TRENDING</span>
                  </div>

                  <div className="space-y-1 max-w-[80%]">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#6b3410]">
                      {item.type}
                    </span>
                    <h4 className="text-base font-heading font-semibold text-stone-900 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-xs text-stone-500 leading-normal font-sans pt-0.5 max-w-[90%]">
                      {item.subtitle}
                    </p>
                  </div>

                  {/* Sparkline & Stats Row */}
                  <div className="flex items-center justify-between gap-4 pt-4 border-t border-stone-100 mt-4 flex-wrap">
                    
                    <div className="flex gap-4 items-center">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">Pilgrims Today</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5 text-stone-400" />
                          <span className="text-sm font-mono font-bold text-stone-800">
                            {item.participantsToday.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block">Spike Hour</span>
                        <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          +{item.incrementPercentage}%
                        </span>
                      </div>
                    </div>

                    {/* Sparkline Visual Placeholder */}
                    <div className="flex items-end gap-0.5 h-7">
                      {item.sparkline.map((val, idx) => (
                        <div 
                          key={idx} 
                          className="w-1.5 rounded-full bg-[#8b4513]/20"
                          style={{ 
                            height: `${(val / 100) * 100}%`,
                            backgroundColor: idx === item.sparkline.length - 1 ? 'rgb(245, 158, 11)' : undefined
                          }}
                        />
                      ))}
                    </div>

                  </div>

                  {/* Join Prompt trigger overlay */}
                  {isSelected && (
                    <div className="absolute inset-x-0 bottom-0 bg-stone-50/98 p-3 border-t border-stone-250 flex items-center justify-between animate-slideUp">
                      <span className="text-xs font-sans text-stone-500">Read & pledge your intercessory devotion?</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedItemId(item.id); // Triggers detail modal/view
                          }}
                          className="px-2.5 py-1 bg-stone-100 text-stone-700 rounded font-sans text-[10px] font-bold cursor-pointer"
                        >
                          View Prayer Text
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinDevotion(item.id);
                          }}
                          className="px-2.5 py-1 bg-[#6b3410] hover:bg-amber-700 text-white font-sans text-[10px] font-bold rounded cursor-pointer"
                        >
                          {hasJoined ? "✓ Joined" : "🕯️ Join Devotion"}
                        </button>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* DETAILED PRAYER VIEW DRAWER MODAL */}
      {selectedItemId && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f0e8d8] backdrop-blur-sm p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-[#faf7f0] border border-stone-250 rounded-2xl shadow-xl relative overflow-hidden">
            
            {/* Visual Header */}
            <div className="p-6 border-b border-stone-100 relative">
              <div 
                className="absolute -top-10 -left-10 w-32 h-32 rounded-full blur-2xl opacity-20"
                style={{ backgroundColor: selectedItem.glow }}
              />

              <div className="flex justify-between items-start gap-4">
                <div>
                  <span className="text-[10px] font-mono text-stone-400 capitalize bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-150 uppercase tracking-widest block mb-1">
                    {selectedItem.type} devotion
                  </span>
                  <h4 className="font-heading font-semibold text-lg text-stone-950">
                    {selectedItem.title}
                  </h4>
                  <p className="text-xs text-stone-500 font-sans">
                    {selectedItem.subtitle}
                  </p>
                </div>

                <button 
                  onClick={() => setSelectedItemId(null)}
                  className="p-1 px-2.5 bg-stone-100 hover:bg-stone-200 text-stone-500 hover:text-stone-800 text-xs font-mono font-bold rounded-lg cursor-pointer transition-all border border-stone-200"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Central Text Panel */}
            <div className="p-6 bg-[#fcfbf9]/40 max-h-96 overflow-y-auto border-b border-stone-100">
              <div className="p-5 rounded-2xl bg-[#faf7f0] border border-stone-150 leading-relaxed relative text-center">
                
                {/* Liturgical tiny cross */}
                <div className="text-stone-300 text-xl font-serif mb-3 select-none">†</div>
                
                <p className="text-sm md:text-base text-stone-800 font-sans italic max-w-md mx-auto leading-relaxed select-text whitespace-pre-line">
                  "{selectedItem.text}"
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 bg-stone-50 flex items-center justify-between gap-4">
              
              <div className="text-xs font-mono text-stone-400 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 fill-current" />
                <span>{selectedItem.participantsToday.toLocaleString()} currently joined</span>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleJoinDevotion(selectedItem.id)}
                  className="px-4 py-2 bg-[#6b3410] hover:bg-amber-700 dark:bg-amber-550 text-white font-sans text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {joinedItemId === selectedItem.id ? (
                    <>
                      <CheckCircle className="h-4 w-4" /> <span>Pledging Offered</span>
                    </>
                  ) : (
                    <>
                      <span>🕯️ Pledge Intercessory Amen</span>
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
