import React, { useState, useEffect, useRef } from "react";
import { Moon, Play, Pause, RefreshCw, Volume2, VolumeX, Eye, HelpCircle, BookOpen, Clock, Sparkles } from "lucide-react";

interface SleepStory {
  id: string;
  title: string;
  narrator: string;
  duration: string;
  description: string;
  scriptureRef: string;
  fullBodyText: string;
}

const SLEEP_STORIES: SleepStory[] = [
  {
    id: "st-1",
    title: "The Garden of Creation",
    narrator: "Father Justin",
    duration: "24 min",
    description: "Relax into the rhythmic ordering of cosmic silence and the restful waters of Genesis.",
    scriptureRef: "Genesis 1:1-19",
    fullBodyText: "In the absolute beginning, when God created the heavens and the earth, the earth was formless and void, and darkness swept over the face of the deep waters. And God breathed a warm, silent wind over the waters. Close your eyes, and feel that same divine wind carrying all your heavy thoughts far out into the quiet infinite.\n\nThen God said, 'Let there be light,' and there was a soft, glowing light, separating the morning from the quiet evening. He created the great oceans, separating the damp sky from the fertile land. He planted beautiful trees, whispering cedars, and wild vines that rested beneath the starry sky.\n\nAs the night deepens, let your breathing slow, matching the rhythmic waves of the primal lakes. Everything is placed in perfect order. The stars are fixed like tiny candles to light your rest. Rest now, dear pilgrim, in the peaceful dark of the first garden."
  },
  {
    id: "st-2",
    title: "Peace, Be Still!",
    narrator: "Brother Johnathan",
    duration: "18 min",
    description: "Experience the profound calm of the Galilean sea as Jesus whispers peace to the violent gale.",
    scriptureRef: "Mark 4:35-41",
    fullBodyText: "As evening came, Jesus said to his disciples, 'Let us cross over to the other side.' They left the loud crowds behind and entered a simple wooden boat, drifting onto the dark, glassy lake. Jesus lay at the back of the boat, resting His head upon a soft cushion, slowly drifting into a deep, peaceful sleep.\n\nSuddenly, cold wind rushed down from the mountains, and black waves began to wash over the side. The boat filled with water, and the disciples were filled with intense fear. They ran to Him, calling out, 'Teacher, do you not care that we are perishing?'\n\nJesus rose quietly. He did not yell or panic. He simply looked out at the raging storm, raised His hands, and whispered to the ocean: 'Peace, be still!' And the wind stopped instantly. The sea became flat, quiet, and warm, reflecting the stars above. Jesus looks at you now, resting beside Him on the calm lake, and whispers: 'Why are you terrified? Do you still have no faith? Sleep now, for I am holding the boat.'"
  },
  {
    id: "st-3",
    title: "Sanctuary of the Good Shepherd",
    narrator: "Mother Mary Elena",
    duration: "30 min",
    description: "Lie down in the green, fragrant pastures of Psalm 23, guided by the loving Guardian.",
    scriptureRef: "Psalm 23:1-6",
    fullBodyText: "The Lord is your Shepherd; you shall lack absolutely nothing. He makes you lie down in deep, fragrant green pastures, where the grass is cool and the soil is soft. Close your eyes and smell the fresh clover. Feel the warm afternoon sun slowly fading behind the blue hills as the quiet night takes its place.\n\nHe leads you beside still, resting waters. Not raging rivers, but quiet streamlets that bubble softly. He restores your tired soul. He guides you along gentle, level pathways for His name's sake.\n\nEven though you walk through the valleys of the darkest shadow, you will fear no evil, for He is walking directly beside you. His rod and His shepherd's staff comfort you. He prepares a table of complete resting protection for you. He anoints your head with soothing olive oil; your cup overflows with peace. Only goodness and mercy shall follow you all the days of your life, and you will sleep tonight in the house of the Lord."
  },
  {
    id: "st-4",
    title: "The Dream of the Wise King",
    narrator: "Father Michael",
    duration: "21 min",
    description: "Receive the quiet whisper of divine wisdom and safety offered to Solomon during sleep.",
    scriptureRef: "1 Kings 3:5-15",
    fullBodyText: "Solomon went to Gibeon to pray. That night, while he was asleep in his clean, stone chamber, the Lord appeared to him in a gentle, hazy dream, whispering: 'Ask what I shall give to you.'\n\nSolomon did not ask for money, or power, or the destruction of his enemies. He looked up into the light and said: 'Lord, I am but a small child, and do not know how to carry out my duties. Give Your servant an understanding, listening heart.'\n\nGod was deeply pleased with this humble, quiet request. He said: 'Because you have asked for wisdom and not long life or wealth, I have granted you a mind calmer and wiser than any who came before you. And I have placed a safe shield over your house.' Solomon woke to see the silver moonlight streaming through his high window, his heart filled with absolute stillness. He knew he was guarded. Sleep now with that same crown of holy wisdom."
  }
];

export function SleepStoriesTab() {
  const [activeStoryId, setActiveStoryId] = useState<string>("st-3");
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playProgress, setPlayProgress] = useState<number>(35); // simulated percent
  const [ambientSound, setAmbientSound] = useState<boolean>(false);
  const [showFullText, setShowFullText] = useState<boolean>(false);
  
  // Web Audio Context for generating serene ambient drone sound
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  const selectedStory = SLEEP_STORIES.find(s => s.id === activeStoryId) || SLEEP_STORIES[2];

  // Simulated player progress loop
  useEffect(() => {
    let interval: any = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setPlayProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 0.2;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      stopAmbientSynth();
    };
  }, []);

  // Handle ambient synthesize toggling
  useEffect(() => {
    if (ambientSound) {
      startAmbientSynth();
    } else {
      stopAmbientSynth();
    }
  }, [ambientSound]);

  const startAmbientSynth = () => {
    try {
      if (!audioContextRef.current) {
        // Initialize Web Audio
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        audioContextRef.current = new AudioContextClass();
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") {
        ctx.resume();
      }

      // Create synthetic low-pass drone chord
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc1.type = "sine";
      osc1.frequency.setValueAtTime(110, ctx.currentTime); // A2 note
      
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(165, ctx.currentTime); // E3 fifth note

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(180, ctx.currentTime); // cut sharp buzz
      filter.Q.setValueAtTime(1, ctx.currentTime);

      // Super quiet, soothing volume
      gainNode.gain.setValueAtTime(0.0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 2.0); // smooth fade in

      // Connections
      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc1.start();
      osc2.start();

      oscillatorRef.current = osc1; // store ref to stop later (we'll stop both using close or storage)
      gainNodeRef.current = gainNode;
      filterRef.current = filter;

      // Keep second oscillator referenced in a sneaky way or just save context
      (oscillatorRef as any).currentSecond = osc2;

    } catch (e) {
      console.error("Web Audio API not fully initialized or blocked by browser gesture:", e);
    }
  };

  const stopAmbientSynth = () => {
    try {
      if (gainNodeRef.current && audioContextRef.current) {
        const ctx = audioContextRef.current;
        gainNodeRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.0); // smooth fade out
        setTimeout(() => {
          if (oscillatorRef.current) {
            oscillatorRef.current.stop();
            oscillatorRef.current.disconnect();
          }
          if ((oscillatorRef as any).currentSecond) {
            (oscillatorRef as any).currentSecond.stop();
            (oscillatorRef as any).currentSecond.disconnect();
          }
          if (audioContextRef.current) {
            audioContextRef.current.close().then(() => {
              audioContextRef.current = null;
            });
          }
        }, 1200);
      }
    } catch (e) {
      // safe bypass
    }
  };

  const togglePrimaryPlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      
      {/* Immersive Midnight Starry Jumbotron */}
      <div className="bg-gradient-to-br from-[#faf7f0] via-[#f5f0e8] to-[#f0e8d8] border border-[#8b4513]/10 rounded-3xl p-6 md:p-8 relative overflow-hidden shadow-2xl text-stone-800">
        
        {/* Primal Star Points */}
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/40 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-8 left-1/4 w-1 h-1 bg-[#faf7f0] rounded-full animate-ping opacity-60" />
        <div className="absolute top-20 right-1/3 w-1.5 h-1.5 bg-[#faf7f0] rounded-full animate-pulse opacity-40" />
        <div className="absolute bottom-12 left-1/2 w-1 h-1 bg-[#faf7f0] rounded-full animate-ping opacity-80" />
        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-[#8b4513]/[0.04] blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center justify-between">
          
          {/* Sleep Player Box Left */}
          <div className="w-full md:w-1/2 space-y-4">
            
            <div className="flex items-center gap-2 text-[#a0520f]">
              <Moon className="h-5 w-5 fill-amber-400/30 animate-pulse shrink-0" />
              <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-[#a0520f]">
                ⭐ HOLY REPOSE SANCTUARY ⭐
              </span>
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl md:text-3xl font-heading font-semibold text-white tracking-wide">
                {selectedStory.title}
              </h2>
              <p className="text-xs text-indigo-205/80 font-sans">
                Devotional Lectio narrated by <strong className="text-amber-300 font-medium">{selectedStory.narrator}</strong> • {selectedStory.duration} repose
              </p>
            </div>

            {/* Simulated sound playback progress bar */}
            <div className="space-y-1.5 pt-2">
              <div className="w-full bg-stone-200 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-amber-400 to-amber-200 h-full rounded-full transition-all duration-300"
                  style={{ width: `${playProgress}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-amber-300/80">
                <span>{Math.floor((playProgress / 100) * 15)}:00</span>
                <span>{selectedStory.duration}</span>
              </div>
            </div>

            {/* Playback Controls Row */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={togglePrimaryPlay}
                className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-450 hover:to-amber-550 text-stone-950 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-[0.98] shadow-lg shadow-amber-550/20 border border-amber-400/30"
                title={isPlaying ? "Pause Bedtime story recital" : "Play Bedtime story recital"}
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6 text-stone-950 fill-current" />
                ) : (
                  <Play className="h-6 w-6 text-stone-950 fill-current ml-1" />
                )}
              </button>

              <div className="flex flex-col">
                <span className="text-xs font-heading font-semibold text-white tracking-wide">
                  {isPlaying ? "SACRED RECITAL UNVEILED" : "RECITAL PAUSED"}
                </span>
                <span className="text-[10px] font-mono text-indigo-200/70 leading-normal">
                  Toggle to companion your night rest.
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Audio details & Interactive synthetic White Noise */}
          <div className="w-full md:w-1/2 bg-[#f5f0e8] backdrop-blur-md rounded-2xl p-5 border border-stone-200 space-y-4">
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-[#a0520f] shrink-0" />
                <span className="text-xs font-semibold text-white font-sans tracking-wide">
                  Primal Warm Ambient Sound:
                </span>
              </div>
              <input
                type="checkbox"
                checked={ambientSound}
                onChange={() => setAmbientSound(!ambientSound)}
                className="rounded text-amber-550 focus:ring-[#8b4513] h-4.5 w-4.5 cursor-pointer accent-amber-500"
                id="ambient-sound-toggle"
              />
            </div>

            <p className="text-[11px] text-indigo-200/70 font-sans leading-relaxed">
              💡 **Sacred White Noise:** When enabled, this uses your browser's physical audio synthesis network to emit a very soft, serene 110Hz A-chord drone simulating the gentle hum of a quiet stone convent. Excellent for letting go of anxiety.
            </p>

            <div className="flex items-center gap-1.5 bg-[#f5f0e8] p-3 rounded-xl border border-stone-200">
              <BookOpen className="h-3.5 w-3.5 text-indigo-300 shrink-0" />
              <span className="text-[11px] font-mono text-indigo-100">
                <strong>Source:</strong> {selectedStory.scriptureRef}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="w-full py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-200 border border-indigo-500/20 rounded-xl text-xs font-semibold cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                <Eye className="h-3.5 w-3.5" />
                {showFullText ? "Collapse Reading Board" : "Reveal Story Text"}
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Story Board Text Drawer (when enabled) */}
      {showFullText && (
        <div className="bg-[#faf7f0] border border-stone-200 p-6 rounded-2xl animate-slideDown shadow-sm max-w-3xl mx-auto leading-relaxed text-center">
          <span className="text-[10px] font-mono text-indigo-650 bg-indigo-50 dark:bg-indigo-950/40 px-2 rounded-full font-bold uppercase tracking-widest">{selectedStory.title} READ-ALONG</span>
          <div className="text-stone-300 text-2xl font-serif my-3 mb-1 select-none">†</div>
          <p className="text-sm md:text-base text-stone-750 font-sans italic max-w-xl mx-auto leading-relaxed select-text whitespace-pre-line text-left py-4 pt-1">
            {selectedStory.fullBodyText}
          </p>
        </div>
      )}

      {/* Selectors Grid: Pick and Play other Sleep narratives */}
      <div className="space-y-3">
        <h4 className="text-xs font-mono text-stone-500 uppercase tracking-widest font-bold">
          Explore Sleeping Narratives
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SLEEP_STORIES.map(story => {
            const isCurrent = story.id === activeStoryId;
            return (
              <div
                key={story.id}
                onClick={() => {
                  setActiveStoryId(story.id);
                  setPlayProgress(0); // reset progress on selection
                  setIsPlaying(false);
                }}
                className={`bg-[#faf7f0] p-5 rounded-2xl border text-left cursor-pointer hover:border-indigo-500/20 hover:scale-[1.01] transition-all flex flex-col justify-between h-44 ${
                  isCurrent 
                    ? "ring-1 ring-indigo-550 border-indigo-550 dark:border-indigo-500 shadow-md" 
                    : "border-stone-200 shadow-sm"
                }`}
              >
                
                <div className="space-y-1">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono bg-stone-100 text-stone-500 p-1 px-2 rounded-lg font-bold border border-stone-150">
                      {story.duration}
                    </span>
                    {isCurrent && (
                      <span className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-505 bg-indigo-500"></span>
                      </span>
                    )}
                  </div>

                  <h5 className="font-heading font-semibold text-sm text-stone-900 pt-1.5 leading-snug">
                    {story.title}
                  </h5>
                  
                  <p className="text-[11px] text-stone-500 leading-relaxed font-sans line-clamp-2 pt-0.5">
                    {story.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-stone-400 border-t border-stone-100 pt-2.5 mt-2">
                  <span>Narrator: {story.narrator}</span>
                  <span>Ref: {story.scriptureRef}</span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
