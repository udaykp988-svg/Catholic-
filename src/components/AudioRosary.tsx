/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Play, Pause, ChevronRight, ChevronLeft, Volume2, VolumeX, RotateCcw, 
  HelpCircle, ChevronDown, Check, Info, Flame, Moon, Compass
} from "lucide-react";

// Web Audio meditational synthesizer helper
class RosarySynth {
  private audioCtx: AudioContext | null = null;
  private rootOsc: OscillatorNode | null = null;
  private fifthOsc: OscillatorNode | null = null;
  private octaveOsc: OscillatorNode | null = null;
  private mainGain: GainNode | null = null;

  startDrone() {
    try {
      // Create audio context safely
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;

      this.audioCtx = new AudioCtxClass();
      this.mainGain = this.audioCtx.createGain();
      this.mainGain.gain.setValueAtTime(0.0, this.audioCtx.currentTime);
      this.mainGain.connect(this.audioCtx.destination);

      // Warm Root drone - perfect fifth harmony (C2 - 130.81 Hz, G2 - 196.00 Hz, C3 - 261.63 Hz)
      this.rootOsc = this.audioCtx.createOscillator();
      this.rootOsc.type = "sine";
      this.rootOsc.frequency.value = 130.81;

      this.fifthOsc = this.audioCtx.createOscillator();
      this.fifthOsc.type = "triangle"; // softer harmonics
      this.fifthOsc.frequency.value = 196.00;

      this.octaveOsc = this.audioCtx.createOscillator();
      this.octaveOsc.type = "sine";
      this.octaveOsc.frequency.value = 261.63;

      const oscGain = this.audioCtx.createGain();
      oscGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime); // very soft

      this.rootOsc.connect(oscGain);
      this.fifthOsc.connect(oscGain);
      this.octaveOsc.connect(oscGain);
      
      oscGain.connect(this.mainGain);

      this.rootOsc.start();
      this.fifthOsc.start();
      this.octaveOsc.start();

      // Fade in gently over 2 seconds
      this.mainGain.gain.linearRampToValueAtTime(0.35, this.audioCtx.currentTime + 2);
    } catch (err) {
      console.error("Could not run ambient synthesizer:", err);
    }
  }

  stopDrone() {
    try {
      if (this.mainGain && this.audioCtx) {
        const now = this.audioCtx.currentTime;
        // Fade out over 0.8 seconds
        this.mainGain.gain.linearRampToValueAtTime(0.001, now + 0.8);
        setTimeout(() => {
          this.rootOsc?.stop();
          this.fifthOsc?.stop();
          this.octaveOsc?.stop();
          this.audioCtx?.close();
          this.rootOsc = null;
          this.fifthOsc = null;
          this.octaveOsc = null;
          this.mainGain = null;
          this.audioCtx = null;
        }, 900);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Plays a soft angelic bell chime
  playBeadChime() {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = this.audioCtx || new AudioCtxClass();
      if (!ctx) return;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = "sine";
      // Pure angelic chime frequency (987.77 Hz - B5)
      osc.frequency.setValueAtTime(987.77, ctx.currentTime);
      
      // Ringing frequency modulation for chime sound
      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(1479.98, ctx.currentTime); // F#6
      
      const chimeGain = ctx.createGain();
      chimeGain.gain.setValueAtTime(0.07, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
      
      osc.connect(gain);
      osc2.connect(chimeGain);
      chimeGain.connect(gain);
      
      gain.connect(ctx.destination);
      
      osc.start();
      osc2.start();
      osc.stop(ctx.currentTime + 1.9);
      osc2.stop(ctx.currentTime + 1.9);
    } catch (e) {
      // Fallback
    }
  }
}

interface Mystery {
  title: string;
  mysteries: {
    num: number;
    name: string;
    description: string;
    fruit: string;
  }[];
}

const MYSTERIES_BY_DAY: Record<string, Mystery> = {
  "Joyful": {
    title: "The Joyful Mysteries (Mondays & Saturdays)",
    mysteries: [
      { num: 1, name: "The Annunciation", description: "The Angel Gabriel announces to Mary that she will bear the Son of God.", fruit: "Humility" },
      { num: 2, name: "The Visitation", description: "Mary visits her cousin Elizabeth, who is pregnant with John the Baptist.", fruit: "Love of Neighbor" },
      { num: 3, name: "The Nativity", description: "Jesus Christ, the Savior of the world, is born in a stable in Bethlehem.", fruit: "Poverty of Spirit" },
      { num: 4, name: "The Presentation", description: "Infant Jesus is presented in the Temple according to Jewish customs.", fruit: "Obedience" },
      { num: 5, name: "The Finding of Jesus in the Temple", description: "After three days of search, Jesus is found preaching to the theologians.", fruit: "Joy of Finding Christ" }
    ]
  },
  "Sorrowful": {
    title: "The Sorrowful Mysteries (Tuesdays & Fridays)",
    mysteries: [
      { num: 1, name: "The Agony in the Garden", description: "Jesus prays in deep blood-sweat in Gethsemane on the eve of Calvary.", fruit: "Sorrow for Sin" },
      { num: 2, name: "The Scourging at the Pillar", description: "Jesus is bound and brutally whipped by imperial Roman soldiers.", fruit: "Purity of Heart / Mortification" },
      { num: 3, name: "The Crowning with Thorns", description: "Soldiers weave a crown of thorns and crash it onto our Lord\'s head.", fruit: "Moral Courage" },
      { num: 4, name: "The Carrying of the Cross", description: "Jesus carries his heavy wooden execution post through Jerusalem toward Calvary.", fruit: "Patience under Trias" },
      { num: 5, name: "The Crucifixion", description: "Jesus hangs in agony for three hours in final prayer to achieve our redemption.", fruit: "Self-Sacrificing Charity" }
    ]
  },
  "Glorious": {
    title: "The Glorious Mysteries (Wednesdays & Sundays)",
    mysteries: [
      { num: 1, name: "The Resurrection", description: "Jesus rises from the dead on Easter Sunday, defeating death.", fruit: "Faith" },
      { num: 2, name: "The Ascension", description: "Jesus ascends body and soul into heaven forty days after his resurrection.", fruit: "Hope & Desire for Heaven" },
      { num: 3, name: "The Descent of the Holy Spirit", description: "Tongues of fire rest upon Mary and the Apostles gathered in prayer on Pentecost.", fruit: "Wisdom & Love of God" },
      { num: 4, name: "The Assumption of Our Lady", description: "Mary is taken up body and soul into heavenly glory at the end of her life.", fruit: "Devotion to Mary" },
      { num: 5, name: "The Coronation of Our Lady", description: "Mary is crowned by the Holy Trinity as Queen of Heaven and Earth.", fruit: "Grace of Final Perseverance" }
    ]
  },
  "Luminous": {
    title: "The Luminous Mysteries (Thursdays)",
    mysteries: [
      { num: 1, name: "The Baptism of Jesus in the Jordan", description: "The Holy Spirit descends like a dove and the Father proclaims Jesus as Son.", fruit: "Gratitude for Grace of Baptism" },
      { num: 2, name: "The Wedding at Cana", description: "At Mary's request, Jesus performs his first public miracle, turning water into wine.", fruit: "Fidelity, Trust in Mary\'s Intercession" },
      { num: 3, name: "The Proclamation of the Kingdom", description: "Jesus calls all to repentance and preaches the arrival of God\'s reign.", fruit: "Repentance and Conversion" },
      { num: 4, name: "The Transfiguration", description: "On Mount Tabor, Jesus' form shines like solar rays before Peter, James, and John.", fruit: "Spiritual Courage / Prayer Habits" },
      { num: 5, name: "The Institution of the Eucharist", description: "At the Last Supper, Jesus offers his Body and Blood under the species of bread and wine.", fruit: "Eucharistic Adoration and Love" }
    ]
  }
};

const ROSARY_STEPS = [
  { id: "intro-creed", name: "Apostle's Creed", beadType: "Cross", text: "I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord..." },
  { id: "intro-father", name: "Our Father (For Pope's Intentions)", beadType: "Large Bead", text: "Our Father, Who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done, on earth as it is in heaven..." },
  { id: "intro-m1", name: "Hail Mary (For Faith)", beadType: "Small Bead", text: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women..." },
  { id: "intro-m2", name: "Hail Mary (For Hope)", beadType: "Small Bead", text: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women..." },
  { id: "intro-m3", name: "Hail Mary (For Charity)", beadType: "Small Bead", text: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women..." },
  { id: "intro-glory", name: "Glory Be & Fatima Prayer", beadType: "Large Bead", text: "Glory be to the Father, and to the Son, and to the Holy Spirit..." },
  
  // Decade 1
  { id: "d1-ann", name: "Decade 1: Announcement & Lord's Prayer", beadType: "Large Bead", text: "Our Father, who art in heaven..." },
  ...Array.from({ length: 10 }, (_, i) => ({ id: `d1-${i+1}`, name: `Decade 1: Hail Mary ${i+1}`, beadType: "Small Bead", text: "Hail Mary, full of grace..." })),
  { id: "d1-glory", name: "Glory Be & Fatima Prayer", beadType: "Large Bead", text: "Glory be to the Father... O my Jesus, forgive us..." },

  // Decade 2
  { id: "d2-father", name: "Decade 2: Lord's Prayer", beadType: "Large Bead", text: "Our Father, who art in heaven..." },
  ...Array.from({ length: 10 }, (_, i) => ({ id: `d2-${i+1}`, name: `Decade 2: Hail Mary ${i+1}`, beadType: "Small Bead", text: "Hail Mary, full of grace..." })),
  { id: "d2-glory", name: "Glory Be & Fatima Prayer", beadType: "Large Bead", text: "Glory be to the Father... O my Jesus, forgive us..." },

  // Decade 3
  { id: "d3-father", name: "Decade 3: Lord's Prayer", beadType: "Large Bead", text: "Our Father, who art in heaven..." },
  ...Array.from({ length: 10 }, (_, i) => ({ id: `d3-${i+1}`, name: `Decade 3: Hail Mary ${i+1}`, beadType: "Small Bead", text: "Hail Mary, full of grace..." })),
  { id: "d3-glory", name: "Glory Be & Fatima Prayer", beadType: "Large Bead", text: "Glory be to the Father... O my Jesus, forgive us..." },

  // Decade 4
  { id: "d4-father", name: "Decade 4: Lord's Prayer", beadType: "Large Bead", text: "Our Father, who art in heaven..." },
  ...Array.from({ length: 10 }, (_, i) => ({ id: `d4-${i+1}`, name: `Decade 4: Hail Mary ${i+1}`, beadType: "Small Bead", text: "Hail Mary, full of grace..." })),
  { id: "d4-glory", name: "Glory Be & Fatima Prayer", beadType: "Large Bead", text: "Glory be to the Father... O my Jesus, forgive us..." },

  // Decade 5
  { id: "d5-father", name: "Decade 5: Lord's Prayer", beadType: "Large Bead", text: "Our Father, who art in heaven..." },
  ...Array.from({ length: 10 }, (_, i) => ({ id: `d5-${i+1}`, name: `Decade 5: Hail Mary ${i+1}`, beadType: "Small Bead", text: "Hail Mary, full of grace..." })),
  { id: "d5-glory", name: "Glory Be & Fatima Prayer", beadType: "Large Bead", text: "Glory be to the Father... O my Jesus, forgive us..." },

  // Final prayers
  { id: "final-salve", name: "Hail Holy Queen (Salve Regina)", beadType: "Cross", text: "Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope..." },
  { id: "final-conclude", name: "Concluding Prayers & Sign of the Cross", beadType: "Cross", text: "O God, whose only begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal salvation..." }
];

export function AudioRosary({ onRosaryComplete }: { onRosaryComplete: () => void }) {
  const [selectedMysteryKey, setSelectedMysteryKey] = useState<string>("Joyful");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundscapeEnabled, setSoundscapeEnabled] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(false);
  const [advanceSeconds, setAdvanceSeconds] = useState<number>(12);
  const [timeLeft, setTimeLeft] = useState<number>(12);
  
  const synthRef = useRef<RosarySynth | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto detect typical mystery based on today's day of week
  useEffect(() => {
    const today = new Date().getDay(); // 0 = Sun, 1 = Mon...
    if (today === 1 || today === 6) setSelectedMysteryKey("Joyful");      // Mon & Sat
    else if (today === 2 || today === 5) setSelectedMysteryKey("Sorrowful"); // Tue & Fri
    else if (today === 4) setSelectedMysteryKey("Luminous");                 // Thu
    else setSelectedMysteryKey("Glorious");                                  // Wed & Sun
  }, []);

  // Initialize synthesizer
  useEffect(() => {
    synthRef.current = new RosarySynth();
    return () => {
      synthRef.current?.stopDrone();
    };
  }, []);

  // Handle music synthesis play/stop
  const handleToggleSoundscape = () => {
    if (!synthRef.current) return;
    if (soundscapeEnabled) {
      synthRef.current.stopDrone();
      setSoundscapeEnabled(false);
    } else {
      synthRef.current.startDrone();
      setSoundscapeEnabled(true);
    }
  };

  // Determine current active mystery index (decade)
  // Decade 1 starts around index 6
  // Decade 2 starts around index 18
  // Decade 3 starts around index 30
  // Decade 4 starts around index 42
  // Decade 5 starts around index 54
  const getActiveDecadeMystery = () => {
    const mysteryData = MYSTERIES_BY_DAY[selectedMysteryKey];
    if (currentStepIndex >= 6 && currentStepIndex <= 17) return mysteryData.mysteries[0];
    if (currentStepIndex >= 18 && currentStepIndex <= 29) return mysteryData.mysteries[1];
    if (currentStepIndex >= 30 && currentStepIndex <= 41) return mysteryData.mysteries[2];
    if (currentStepIndex >= 42 && currentStepIndex <= 53) return mysteryData.mysteries[3];
    if (currentStepIndex >= 54 && currentStepIndex <= 65) return mysteryData.mysteries[4];
    return null;
  };

  // Navigate back and forth
  const handleNextStep = () => {
    if (currentStepIndex === ROSARY_STEPS.length - 1) {
      setIsPlaying(false);
      onRosaryComplete();
      alert("Praised be Jesus Christ! You have completed the Holy Rosary. May God bless you and fill you with peace.");
      return;
    }
    
    synthRef.current?.playBeadChime();
    setCurrentStepIndex(prev => prev + 1);
    setTimeLeft(advanceSeconds);
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
      setTimeLeft(advanceSeconds);
    }
  };

  // Handles auto-advance timer count
  useEffect(() => {
    if (isPlaying && autoAdvance) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleNextStep();
            return advanceSeconds;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, autoAdvance, currentStepIndex, advanceSeconds]);

  const activeMystery = getActiveDecadeMystery();
  const currentStep = ROSARY_STEPS[currentStepIndex];

  // Helper arrays to draw bead circles in UI
  const getBeadColorClass = (stepIdx: number) => {
    if (stepIdx === currentStepIndex) return "bg-amber-500 scale-125 ring-4 ring-amber-200 dark:ring-amber-900";
    if (stepIdx < currentStepIndex) return "bg-emerald-600 dark:bg-emerald-500 opacity-60";
    return "bg-stone-300 dark:bg-stone-700 hover:bg-stone-400";
  };

  return (
    <div className="bg-stone-50 dark:bg-stone-900 rounded-2xl shadow-sm border border-stone-200/80 dark:border-stone-800 p-6 max-w-4xl mx-auto">
      
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-4 mb-6">
        <div>
          <h2 className="text-xl font-heading font-medium text-stone-950 dark:text-stone-50 flex items-center gap-2">
            <Compass className="h-5 w-5 text-amber-600 dark:text-amber-400 animate-pulse" />
            Interactive Audio Rosary Companion
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            Meditate on Christ's holy mysteries with built-in celestial synthesizers.
          </p>
        </div>

        {/* Mystery Selection Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-mono text-stone-400 uppercase tracking-wider">Mystery:</label>
          <select 
            value={selectedMysteryKey} 
            onChange={(e) => {
              setSelectedMysteryKey(e.target.value);
              setCurrentStepIndex(0);
            }}
            className="text-sm border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1.5 bg-white dark:bg-stone-950 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="Joyful">Joyful (Mon/Sat)</option>
            <option value="Sorrowful">Sorrowful (Tue/Fri)</option>
            <option value="Glorious">Glorious (Wed/Sun)</option>
            <option value="Luminous">Luminous (Thu)</option>
          </select>
        </div>
      </div>

      {/* Liturgical Active Mystery Card */}
      {activeMystery ? (
        <div className="mb-6 bg-amber-50/50 dark:bg-amber-950/20 border border-amber-500/20 rounded-xl p-4 transition-all">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/45 p-2 rounded-lg text-amber-700 dark:text-amber-300">
              <span className="font-heading font-bold text-lg">#{activeMystery.num}</span>
            </div>
            <div>
              <span className="text-xs font-mono text-amber-700 dark:text-amber-400 uppercase tracking-widest font-semibold block">
                Fruit of the Mystery: {activeMystery.fruit}
              </span>
              <h3 className="font-heading text-base font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                The {activeMystery.num} Mystery: {activeMystery.name}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 italic">
                {activeMystery.description}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-stone-100 dark:bg-stone-950 rounded-xl p-4 text-center text-xs text-stone-500 dark:text-stone-400">
          <Info className="h-4 w-4 mx-auto mb-1 text-stone-400" />
          Currently reciting the opening prayers of devotion. Hold Saint Mary's hand.
        </div>
      )}

      {/* Centered Large Prayer Script Viewer */}
      <div className="bg-white dark:bg-stone-950 rounded-xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 min-h-[220px] flex flex-col justify-between relative shadow-sm">
        
        {/* Step Badge */}
        <div className="flex items-center justify-between">
          <span className="inline-block px-2.5 py-0.5 bg-stone-100 dark:bg-stone-900 text-[10px] font-mono text-stone-500 dark:text-stone-400 rounded-full font-bold uppercase tracking-wider">
            Bead {currentStepIndex + 1} / {ROSARY_STEPS.length} • {currentStep.beadType}
          </span>
          
          {autoAdvance && isPlaying && (
            <span className="text-xs font-mono text-amber-500 flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping"></span>
              Auto-advancing in {timeLeft}s
            </span>
          )}
        </div>

        {/* The active prayer script */}
        <div className="my-6 text-center">
          <h4 className="text-sm font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wide font-sans mb-2">
            {currentStep.name}
          </h4>
          <p className="text-base md:text-lg text-stone-850 dark:text-stone-200 font-heading leading-relaxed font-normal max-w-2xl mx-auto italic">
            "{currentStep.text}"
          </p>
        </div>

        {/* Dynamic Prayer Helper Text (Hail Mary, Glory Be fully printed for ease) */}
        <div className="border-t border-stone-100 dark:border-stone-900 pt-3 flex justify-between items-center">
          <span className="text-[11px] text-stone-400 dark:text-stone-500 italic">
            Traditional Devotion of the {selectedMysteryKey} Mystery.
          </span>
          <button 
            onClick={() => {
              let msg = "";
              if (currentStep.name.includes("Hail Mary")) msg = "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.";
              else if (currentStep.name.includes("Our Father")) msg = "Our Father, Who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done, on earth as it is in heaven. Give us this day our daily bread. And forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen.";
              else if (currentStep.name.includes("Apostle's Creed")) msg = "I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate...";
              else msg = "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen. (Fatima Prayer: O my Jesus, forgive us our sins, save us from the fires of hell...)";
              alert(msg);
            }} 
            className="text-[11px] font-mono text-amber-600 hover:underline cursor-pointer"
          >
            Show Full Text of this Prayer
          </button>
        </div>
      </div>

      {/* Interactive Rosary Beads Physical Tracker Grid */}
      <h5 className="text-xs font-mono uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-6 mb-3 text-center">
        Rosary Bead Trail Tracker
      </h5>
      <div className="flex flex-wrap justify-center items-center gap-1.5 p-3 bg-stone-100/50 dark:bg-stone-950/40 rounded-xl border border-stone-200/50 dark:border-stone-850 max-h-36 overflow-y-auto mb-6">
        
        {ROSARY_STEPS.map((step, idx) => {
          const isExtraBead = step.id.includes("glory") || step.name.includes("Glory Be");
          if (isExtraBead) return null;

          const isLarge = step.beadType === "Large Bead" || step.beadType === "Cross";
          return (
            <button
              key={step.id + idx}
              onClick={() => {
                setCurrentStepIndex(idx);
                setTimeLeft(advanceSeconds);
                synthRef.current?.playBeadChime();
              }}
              className={`rounded-full transition-all cursor-pointer flex items-center justify-center font-mono text-[8px] font-bold ${
                isLarge ? "w-6 h-6 border border-amber-600/30" : "w-4 h-4"
              } ${getBeadColorClass(idx)} text-stone-900`}
              title={step.name} 
            >
              {(() => {
                if (isLarge) {
                  return "†";
                }
                const parts = step.id.split('-');
                if (parts.length > 1) {
                  const suffix = parts[1];
                  if (suffix.startsWith('m')) {
                    return suffix.substring(1);
                  }
                  const num = parseInt(suffix, 10);
                  if (!isNaN(num)) {
                    return num.toString();
                  }
                }
                return "";
              })()}
            </button>
          );
        })}
      </div>

      {/* Main Music Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 border-t border-stone-200 dark:border-stone-850 pt-6">
        
        {/* Left: Meditative Ambient Synth */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSoundscape}
            className={`p-2.5 rounded-lg border flex items-center gap-2 cursor-pointer transition-all ${
              soundscapeEnabled 
                ? "bg-amber-100 dark:bg-amber-950/30 border-amber-300 text-amber-800 dark:text-amber-300 font-semibold" 
                : "bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-100"
            }`}
          >
            {soundscapeEnabled ? <Volume2 className="h-4.5 w-4.5 text-amber-650" /> : <VolumeX className="h-4.5 w-4.5" />}
            <span className="text-xs">Meditational Chords</span>
          </button>
          <div className="text-[10px] text-stone-400 dark:text-stone-500">
            {soundscapeEnabled ? "Analog Synth playing roots..." : "Off. Click to start chime generator"}
          </div>
        </div>

        {/* Center: Play, Forward, Back controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="p-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-30 cursor-pointer"
            title="Previous bead"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white dark:text-stone-950 rounded-full cursor-pointer shadow transition-transform hover:scale-105 flex items-center justify-center"
            title={isPlaying ? "Pause Automated Devotion" : "Play Devotion"}
          >
            {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
          </button>

          <button
            onClick={handleNextStep}
            className="p-2 border border-stone-200 dark:border-stone-800 rounded-lg bg-white dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer"
            title="Next bead"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            onClick={() => {
              setCurrentStepIndex(0);
              setTimeLeft(advanceSeconds);
              setIsPlaying(false);
            }}
            className="p-2 text-stone-450 hover:text-stone-750 dark:text-stone-550 dark:hover:text-stone-350 cursor-pointer"
            title="Reset Rosary"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Auto Advance Settings */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400">Auto-timer:</span>
            <input 
              type="checkbox" 
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-stone-400">Interval:</span>
            <select
              value={advanceSeconds}
              onChange={(e) => {
                const secs = Number(e.target.value);
                setAdvanceSeconds(secs);
                setTimeLeft(secs);
              }}
              disabled={!autoAdvance}
              className="text-[10px] border border-stone-200 dark:border-stone-800 rounded px-1.5 py-0.5 bg-white dark:bg-stone-950 text-stone-700 dark:text-stone-300 disabled:opacity-40"
            >
              <option value={6}>6s (Quick)</option>
              <option value={12}>12s (Reverent)</option>
              <option value={20}>20s (Meditative)</option>
              <option value={35}>35s (Committed)</option>
            </select>
          </div>
        </div>

      </div>

    </div>
  );
}
