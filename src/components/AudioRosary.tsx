/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { 
  Play, Pause, ChevronRight, ChevronLeft, Volume2, VolumeX, RotateCcw, 
  HelpCircle, ChevronDown, Check, Info, Flame, Moon, Compass,
  Sparkles, User, MessageCircle, Heart, ShieldCheck, Maximize2, X, Settings,
  Eye, EyeOff
} from "lucide-react";

// Web Audio meditational synthesizer helper
class RosarySynth {
  public audioCtx: AudioContext | null = null;
  public rootOsc: OscillatorNode | null = null;
  public fifthOsc: OscillatorNode | null = null;
  public octaveOsc: OscillatorNode | null = null;
  public mainGain: GainNode | null = null;
  public analyser: AnalyserNode | null = null;

  ensureAudioContext() {
    if (this.audioCtx) return;
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      this.audioCtx = new AudioCtxClass();

      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;

      // Connect analyser to destination so sounds played through it are outputted
      this.analyser.connect(this.audioCtx.destination);
    } catch (err) {
      console.error("Could not ensure audio context:", err);
    }
  }

  startDrone() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx || !this.analyser) return;

      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      this.mainGain = this.audioCtx.createGain();
      this.mainGain.gain.setValueAtTime(0.0, this.audioCtx.currentTime);
      
      // Connect mainGain to the analyser
      this.mainGain.connect(this.analyser);

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
      this.mainGain.gain.linearRampToValueAtTime(0.25, this.audioCtx.currentTime + 2);
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
        const oscToStop = [this.rootOsc, this.fifthOsc, this.octaveOsc];
        this.rootOsc = null;
        this.fifthOsc = null;
        this.octaveOsc = null;
        const gainToDisconnect = this.mainGain;
        this.mainGain = null;

        setTimeout(() => {
          oscToStop.forEach(osc => {
            try { osc?.stop(); } catch (e) {}
          });
          try { gainToDisconnect?.disconnect(); } catch (e) {}
        }, 900);
      }
    } catch (e) {
      console.error(e);
    }
  }

  // Plays a soft angelic bell chime
  playBeadChime() {
    try {
      this.ensureAudioContext();
      const ctx = this.audioCtx;
      if (!ctx) return;

      if (ctx.state === "suspended") {
        ctx.resume();
      }
      
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
      chimeGain.gain.setValueAtTime(0.05, ctx.currentTime);
      
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
      
      osc.connect(gain);
      osc2.connect(chimeGain);
      chimeGain.connect(gain);
      
      if (this.analyser) {
        gain.connect(this.analyser);
      } else {
        gain.connect(ctx.destination);
      }
      
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
      { num: 2, name: "The Scourging at the Pillar", description: "Jesus is bound and brutally whipped by imperial Roman soldiers.", fruit: "Purity of Heart" },
      { num: 3, name: "The Crowning with Thorns", description: "Soldiers weave a crown of thorns and crash it onto our Lord's head.", fruit: "Moral Courage" },
      { num: 4, name: "The Carrying of the Cross", description: "Jesus carries his heavy wooden execution post through Jerusalem toward Calvary.", fruit: "Patience under Trials" },
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
      { num: 2, name: "The Wedding at Cana", description: "At Mary's request, Jesus performs his first public miracle, turning water into wine.", fruit: "Fidelity, Trust in Mary's Intercession" },
      { num: 3, name: "The Proclamation of the Kingdom", description: "Jesus calls all to repentance and preaches the arrival of God's reign.", fruit: "Repentance and Conversion" },
      { num: 4, name: "The Transfiguration", description: "On Mount Tabor, Jesus' form shines like solar rays before Peter, James, and John.", fruit: "Spiritual Courage" },
      { num: 5, name: "The Institution of the Eucharist", description: "At the Last Supper, Jesus offers his Body and Blood under the species of bread and wine.", fruit: "Eucharistic Adoration and Love" }
    ]
  }
};

const ROSARY_STEPS = [
  { id: "intro-creed", name: "Apostle's Creed", beadType: "Cross", text: "I believe in God, the Father Almighty, Creator of heaven and earth..." },
  { id: "intro-father", name: "Our Father (For Pope's Intentions)", beadType: "Large Bead", text: "Our Father, Who art in heaven..." },
  { id: "intro-m1", name: "Hail Mary (For Faith)", beadType: "Small Bead", text: "Hail Mary, full of grace, the Lord is with thee..." },
  { id: "intro-m2", name: "Hail Mary (For Hope)", beadType: "Small Bead", text: "Hail Mary, full of grace, the Lord is with thee..." },
  { id: "intro-m3", name: "Hail Mary (For Charity)", beadType: "Small Bead", text: "Hail Mary, full of grace, the Lord is with thee..." },
  { id: "intro-glory", name: "Glory Be & Fatima Prayer", beadType: "Large Bead", text: "Glory be to the Father... O my Jesus, forgive us..." },
  
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
  { id: "final-salve", name: "Hail Holy Queen (Salve Regina)", beadType: "Cross", text: "Hail, holy Queen, Mother of mercy, our life, our sweetness..." },
  { id: "final-conclude", name: "Concluding Prayers & Sign of the Cross", beadType: "Cross", text: "O God, whose only begotten Son, by His life, death, and resurrection..." }
];

interface PrayerScript {
  full: string;
  leader: string;
  response: string;
}

const TRADITIONAL_PRAYERS: Record<string, PrayerScript> = {
  creed: {
    full: "I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father Almighty; from there He shall come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.",
    leader: "I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father Almighty; from there He shall come to judge the living and the dead.",
    response: "I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen."
  },
  father: {
    full: "Our Father, Who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done, on earth as it is in heaven. Give us this day our daily bread. And forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen.",
    leader: "Our Father, Who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done, on earth as it is in heaven.",
    response: "Give us this day our daily bread. And forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen."
  },
  mary: {
    full: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.",
    leader: "Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus.",
    response: "Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen."
  },
  glory: {
    full: "Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen. O my Jesus, forgive us our sins, save us from the fires of hell. Lead all souls to heaven, especially those in most need of thy mercy. Amen.",
    leader: "Glory be to the Father, and to the Son, and to the Holy Spirit.",
    response: "As it was in the beginning, is now, and ever shall be, world without end. Amen. O my Jesus, forgive us our sins, save us from the fires of hell. Lead all souls to heaven, especially those in most need of thy mercy. Amen."
  },
  salve: {
    full: "Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.",
    leader: "Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.",
    response: "Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen."
  },
  conclude: {
    full: "O God, whose only begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal salvation, grant, we beseech Thee, that meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen. In the name of the Father, and of the Son, and of the Holy Spirit. Amen.",
    leader: "O God, whose only begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal salvation, grant, we beseech Thee, that meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.",
    response: "In the name of the Father, and of the Son, and of the Holy Spirit. Amen."
  }
};

function getPrayerKey(stepId: string): keyof typeof TRADITIONAL_PRAYERS {
  if (stepId.includes("creed")) return "creed";
  if (stepId.includes("father") || stepId.includes("ann")) return "father";
  if (stepId.includes("glory")) return "glory";
  if (stepId.includes("salve")) return "salve";
  if (stepId.includes("conclude")) return "conclude";
  return "mary";
}

interface AudioRosaryProps {
  onRosaryComplete: () => void;
  isTabActive?: boolean;
  setActiveTab?: (tab: any) => void;
  isFocusMode?: boolean;
  setIsFocusMode?: (mode: boolean) => void;
}

export function AudioRosary({ 
  onRosaryComplete, 
  isTabActive = true, 
  setActiveTab,
  isFocusMode,
  setIsFocusMode
}: AudioRosaryProps) {
  const [selectedMysteryKey, setSelectedMysteryKey] = useState<string>("Joyful");
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [soundscapeEnabled, setSoundscapeEnabled] = useState<boolean>(false);
  const [autoAdvance, setAutoAdvance] = useState<boolean>(true); // recommended default for speech tracking

  // Vocal settings states
  const [isVoiceGuideEnabled, setIsVoiceGuideEnabled] = useState<boolean>(true);
  const [recitationMode, setRecitationMode] = useState<"full" | "leader">("full");
  const [voiceRate, setVoiceRate] = useState<number>(0.9); // Reverent pace (slightly below default)
  const [voiceVolume, setVoiceVolume] = useState<number>(0.95);
  const [isVoiceSpeaking, setIsVoiceSpeaking] = useState<boolean>(false);
  const [voiceSupported, setVoiceSupported] = useState<boolean>(true);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [showPrayerText, setShowPrayerText] = useState<boolean>(true);
  
  const synthRef = useRef<RosarySynth | null>(null);
  const isPlayingRef = useRef<boolean>(isPlaying);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const visualizerRef = useRef<HTMLDivElement>(null);
  const miniVisualizerRef = useRef<HTMLDivElement>(null);

  // Sync isPlaying state with a mutable ref to solve closure and concurrency race conditions in SpeechSynthesis
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  // Synchronized visualizer animation loop
  useEffect(() => {
    let animationFrameId: number;
    const barCount = 16;
    
    // Create pre-allocated array for frequency data
    const dataArray = new Uint8Array(32);
    
    const updateVisualizer = () => {
      let active = false;
      const values = new Float32Array(barCount);
      
      const synth = synthRef.current;
      
      if (synth && synth.analyser && synth.audioCtx && synth.audioCtx.state !== "suspended") {
        synth.analyser.getByteFrequencyData(dataArray);
        
        // Map dataArray values into our 16 bars
        for (let i = 0; i < barCount; i++) {
          // Take active spectrum bin ranges, ignoring DC offset
          const rawValue = dataArray[i + 1] || 0;
          values[i] = rawValue / 255;
        }
        
        const totalEnergy = values.reduce((sum, v) => sum + v, 0);
        if (totalEnergy > 0.05) {
          active = true;
        }
      }
      
      // If voice guide is speaking, synthesize fluid, voice-like pulsing on top of standard analysis
      if (isVoiceSpeaking && isPlaying) {
        active = true;
        const time = Date.now() * 0.005;
        for (let i = 0; i < barCount; i++) {
          const speakMod = Math.sin(time * 3 + i * 0.5) * 0.4 + 0.6;
          const randomPulse = Math.random() * 0.4 + 0.2;
          const frequencyFactor = Math.sin((i * Math.PI) / barCount); // speech envelope curve
          
          const speechVal = speakMod * randomPulse * frequencyFactor * voiceVolume;
          values[i] = Math.max(values[i], speechVal);
        }
      } else if (isPlaying && !isVoiceSpeaking) {
        // Comforting rest/breathing pulse cycle when paused or waiting between prayer beads
        active = true;
        const breath = Math.sin(Date.now() * 0.0025) * 0.15 + 0.2;
        for (let i = 0; i < barCount; i++) {
          const depth = (Math.sin((i * Math.PI) / (barCount - 1)) * 0.1 + 0.05) * breath;
          values[i] = Math.max(values[i], depth);
        }
      } else if (soundscapeEnabled) {
        active = true;
      }
      
      // Standby state
      if (!active) {
        for (let i = 0; i < barCount; i++) {
          values[i] = 0;
        }
      }
      
      // Performance-optimized direct inline transform rendering (No React lifecycle overhead, full 60fps)
      if (visualizerRef.current) {
        const bars = visualizerRef.current.children;
        for (let i = 0; i < barCount; i++) {
          const bar = bars[i] as HTMLDivElement;
          if (bar) {
            const scale = Math.max(0.08, values[i]);
            bar.style.transform = `scaleY(${scale})`;
            bar.style.opacity = `${0.3 + scale * 0.7}`;
          }
        }
      }
      
      if (miniVisualizerRef.current) {
        const bars = miniVisualizerRef.current.children;
        for (let i = 0; i < barCount; i++) {
          const bar = bars[i] as HTMLDivElement;
          if (bar) {
            const scale = Math.max(0.08, values[i]);
            bar.style.transform = `scaleY(${scale})`;
            bar.style.opacity = `${0.3 + scale * 0.7}`;
          }
        }
      }
      
      animationFrameId = requestAnimationFrame(updateVisualizer);
    };
    
    updateVisualizer();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, isVoiceSpeaking, soundscapeEnabled, voiceVolume]);

  // Helper to load up-to-date audio voices on mobile/iframes
  const updateVoicesList = () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
    }
  };

  // Auto detect typical mystery based on today's day of week
  useEffect(() => {
    const today = new Date().getDay(); // 0 = Sun, 1 = Mon...
    if (today === 1 || today === 6) setSelectedMysteryKey("Joyful");      // Mon & Sat
    else if (today === 2 || today === 5) setSelectedMysteryKey("Sorrowful"); // Tue & Fri
    else if (today === 4) setSelectedMysteryKey("Luminous");                 // Thu
    else setSelectedMysteryKey("Glorious");                                  // Wed & Sun
  }, []);

  // Initialize synthesizer companion background chords and check Voice support
  useEffect(() => {
    synthRef.current = new RosarySynth();
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setVoiceSupported(false);
    } else {
      updateVoicesList();
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = updateVoicesList;
      }
    }
    return () => {
      synthRef.current?.stopDrone();
      if (synthRef.current?.audioCtx) {
        try {
          synthRef.current.audioCtx.close();
        } catch (e) {}
      }
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
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
  const getActiveDecadeMystery = () => {
    const mysteryData = MYSTERIES_BY_DAY[selectedMysteryKey];
    if (currentStepIndex >= 6 && currentStepIndex <= 17) return mysteryData.mysteries[0];
    if (currentStepIndex >= 18 && currentStepIndex <= 29) return mysteryData.mysteries[1];
    if (currentStepIndex >= 30 && currentStepIndex <= 41) return mysteryData.mysteries[2];
    if (currentStepIndex >= 42 && currentStepIndex <= 53) return mysteryData.mysteries[3];
    if (currentStepIndex >= 54 && currentStepIndex <= 65) return mysteryData.mysteries[4];
    return null;
  };

  const activeMystery = getActiveDecadeMystery();
  const currentStep = ROSARY_STEPS[currentStepIndex];

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
  };

  const handlePrevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  // Stop vocal recitation
  const stopVoice = () => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
      speechTimeoutRef.current = null;
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsVoiceSpeaking(false);
  };

  // Get browser/phone default US English voice or other English fallback
  const getPhoneDefaultVoice = (voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    // Filter to English voices (US, UK, AU, etc.)
    const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith("en"));
    if (englishVoices.length === 0) {
      const absoluteDefault = voices.find(v => v.default);
      return absoluteDefault || (voices.length > 0 ? voices[0] : null);
    }

    // Filter to US English specifically to avoid Australian, British, etc.
    const usEnglishVoices = englishVoices.filter(v => 
      v.lang.toLowerCase().includes("us") || v.lang.toLowerCase() === "en"
    );

    // Tier 1: Prefer local (offline-downloaded) US English voices for highest quality
    const usLocal = usEnglishVoices.filter(v => v.localService);
    if (usLocal.length > 0) return usLocal[0];

    // Tier 2: Prefer any US English voice
    if (usEnglishVoices.length > 0) return usEnglishVoices[0];

    // Tier 3: Look for an English voice explicitly set as default inside user settings
    const systemDefaultEng = englishVoices.find(v => v.default);
    if (systemDefaultEng) return systemDefaultEng;

    // Tier 4: Prefer local (offline-downloaded) English voices for quality (UK, AU if no US is available)
    const localEnglish = englishVoices.filter(v => v.localService);
    if (localEnglish.length > 0) return localEnglish[0];

    // Tier 5: Return any English voice
    return englishVoices[0];
  };

  // Play vocal speech
  const speakActivePrayer = (stepIdx: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    
    window.speechSynthesis.cancel();
    
    if (!isPlaying || !isVoiceGuideEnabled) {
      setIsVoiceSpeaking(false);
      return;
    }

    const step = ROSARY_STEPS[stepIdx];
    const key = getPrayerKey(step.id);
    const script = TRADITIONAL_PRAYERS[key];
    
    let textToSpeak = "";
    if (recitationMode === "full") {
      textToSpeak = script.full;
    } else {
      // In leader mode, the computer speaks the leader's line
      textToSpeak = script.leader;
    }

    // Preface first elements beautifully
    const isFirstOfBeadGroup = stepIdx === 0 || 
                               step.id.includes("father") || 
                               step.id.includes("ann") ||
                               step.id.includes("glory") ||
                               step.id === "intro-m1" ||
                               step.id.includes("final");
    
    if (isFirstOfBeadGroup) {
      let preface = "";
      if (stepIdx === 0) {
        preface = "Let us begin. In the name of the Father, and of the Son, and of the Holy Spirit. Amen. ";
      }
      
      const decadeMystery = getActiveDecadeMystery();
      if (step.id.includes("ann") && decadeMystery) {
        preface += `The First Mystery: ${decadeMystery.name}. Fruit of the mystery: ${decadeMystery.fruit}. `;
      } else if (step.id.includes("father") && decadeMystery) {
        let ordinal = "Second";
        if (decadeMystery.num === 3) ordinal = "Third";
        if (decadeMystery.num === 4) ordinal = "Fourth";
        if (decadeMystery.num === 5) ordinal = "Fifth";
        preface += `The ${ordinal} Mystery: ${decadeMystery.name}. Fruit of the mystery: ${decadeMystery.fruit}. `;
      }
      textToSpeak = preface + textToSpeak;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.volume = voiceVolume;
    utterance.rate = voiceRate;

    // Retrieve compatible speech voices
    const rawVoices = window.speechSynthesis.getVoices();
    const voices = rawVoices.length > 0 ? rawVoices : availableVoices;
    const selectedVoice = getPhoneDefaultVoice(voices);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
      console.log(`AudioRosary: Selected default speech voice "${selectedVoice.name}" (localService=${selectedVoice.localService}, lang=${selectedVoice.lang})`);
    }

    utterance.onstart = () => {
      setIsVoiceSpeaking(true);
    };

    utterance.onend = () => {
      setIsVoiceSpeaking(false);
      // Use the mutable ref to ensure checking the actual up-to-date playback status to prevent playing when paused
      if (isPlayingRef.current) {
        if (autoAdvance) {
          setTimeout(() => {
            if (isPlayingRef.current) {
              handleNextStep();
            }
          }, 1800);
        }
      }
    };

    utterance.onerror = (e) => {
      console.error("AudioRosary Web Speech TTS error event:", e);
      setIsVoiceSpeaking(false);
      
      // Self-healing: retry with default voice fallback, checking active play state
      if (utterance.voice && isPlayingRef.current) {
        console.warn("Retrying speech synthesis using browser default voice fallback...");
        try {
          const fallbackUtterance = new SpeechSynthesisUtterance(textToSpeak);
          fallbackUtterance.volume = voiceVolume;
          fallbackUtterance.rate = voiceRate;
          fallbackUtterance.voice = null; // force browser default
          fallbackUtterance.onstart = () => setIsVoiceSpeaking(true);
          fallbackUtterance.onend = utterance.onend;
          fallbackUtterance.onerror = () => setIsVoiceSpeaking(false);
          window.speechSynthesis.speak(fallbackUtterance);
        } catch (err) {
          console.error("Fallback speech synthesis failed:", err);
        }
      }
    };

    // Avoid concurrent race condition queue blocks in Web Speech Synthesis by tracking scheduled timers
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    speechTimeoutRef.current = setTimeout(() => {
      if (typeof window !== "undefined" && "speechSynthesis" in window && isPlayingRef.current && isVoiceGuideEnabled) {
        window.speechSynthesis.speak(utterance);
      }
    }, 100);
  };

  // Play dynamic prayer bell chime using Web Audio API on-the-fly
  const playTestChime = () => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const ctx = new AudioCtxClass();
      
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = "sine";
      osc1.frequency.setValueAtTime(440, ctx.currentTime);
      
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      
      const now = ctx.currentTime;
      gain1.gain.setValueAtTime(0.25, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
      
      gain2.gain.setValueAtTime(0.12, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      
      osc1.start(now);
      osc2.start(now);
      
      osc1.stop(now + 1.6);
      osc2.stop(now + 1.6);
    } catch (err) {
      console.error("Failed to play diagnostic prayer audio chime:", err);
    }
  };



  // Sync vocal speech with state properties
  useEffect(() => {
    if (isPlaying && voiceSupported && isVoiceGuideEnabled) {
      speakActivePrayer(currentStepIndex);
    } else {
      stopVoice();
    }
    return () => {
      stopVoice();
    };
  }, [currentStepIndex, isPlaying, isVoiceGuideEnabled, recitationMode, voiceRate]);

  // Handle manual play/pause toggle
  const handlePlayToggle = () => {
    setIsPlaying(!isPlaying);
  };

  // Helper arrays for drawing bead dots
  const getBeadColorClass = (stepIdx: number) => {
    if (stepIdx === currentStepIndex) return "bg-amber-500 scale-125 ring-4 ring-amber-200 dark:ring-amber-900 text-amber-950 font-bold";
    if (stepIdx < currentStepIndex) return "bg-amber-700/60 dark:bg-amber-500/40 opacity-80 text-white/70";
    return "bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-300 dark:hover:bg-stone-700";
  };

  const activePrayerKey = getPrayerKey(currentStep.id);
  const prayerScript = TRADITIONAL_PRAYERS[activePrayerKey];

  if (!isTabActive) {
    const isRosaryActive = isPlaying || soundscapeEnabled || currentStepIndex > 0;
    if (!isRosaryActive) return null;

    const progressPercent = Math.round((currentStepIndex / (ROSARY_STEPS.length - 1)) * 100);

    const handleDismissBar = () => {
      setIsPlaying(false);
      stopVoice();
      if (synthRef.current) {
        synthRef.current.stopDrone();
      }
      setSoundscapeEnabled(false);
      setCurrentStepIndex(0);
    };

    return createPortal(
      <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[420px] bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850 shadow-2xl rounded-2xl p-4 z-[9999] flex flex-col gap-3 transition-all duration-300 animate-slide-up hover:shadow-amber-500/5">
        
        {/* Top bar: Header & Meta info, Dismiss, Maximize */}
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isPlaying ? "bg-amber-400" : "bg-stone-400"} opacity-75`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isPlaying ? "bg-amber-500" : "bg-stone-500"}`}></span>
            </span>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-stone-500 dark:text-stone-400">
              {isPlaying ? "Playing Rosary" : "Rosary Paused"} {isVoiceGuideEnabled ? "(Vocal Guide)" : "(Muted)"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Maximize Button */}
            <button
              onClick={() => setActiveTab?.("rosary")}
              className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-500 dark:text-stone-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
              title="Open full player"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
            {/* Dismiss Button */}
            <button
              onClick={handleDismissBar}
              className="p-1.5 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg text-stone-500 dark:text-stone-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
              title="Stop & close player"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Middle area: Active Mystery & Bead details */}
        <div className="flex flex-col">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-100 leading-tight">
                {currentStep.name}
              </h4>
              {activeMystery && (
                <p className="text-[11px] text-amber-550 dark:text-amber-400 font-medium mt-0.5 leading-none">
                  Mystery: {activeMystery.name} • <span className="italic">"{activeMystery.fruit}"</span>
                </p>
              )}
            </div>
            <span className="text-[10px] font-mono text-stone-500 bg-stone-100 dark:bg-stone-800 dark:text-stone-400 px-1.5 py-0.5 rounded flex-shrink-0">
              Bead {currentStepIndex + 1}/73
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 italic line-clamp-1 mt-2 bg-stone-50/50 dark:bg-stone-950/40 p-1.5 rounded border border-stone-100/50 dark:border-stone-900/50">
            {currentStep.text}
          </p>
        </div>

        {/* Subtle pulsing mini visualizer */}
        <div className="flex items-center justify-between px-2 bg-stone-50 dark:bg-stone-950/40 py-1 rounded-lg border border-stone-100 dark:border-stone-850">
          <span className="text-[9px] font-mono font-semibold text-stone-400 dark:text-stone-500 uppercase tracking-widest pl-1">Audio Pulse</span>
          <div 
            ref={miniVisualizerRef}
            className="flex items-end justify-end gap-1 h-5 w-32 pr-1"
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="w-1 h-full rounded-full bg-gradient-to-t from-amber-600 to-amber-500 dark:from-amber-550 dark:to-amber-400 origin-bottom"
                style={{ transform: "scaleY(0.08)", opacity: 0.3 }}
              />
            ))}
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full flex flex-col gap-1">
          <div className="w-full h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-300" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[9px] font-mono text-stone-400">
            <span>Progress</span>
            <span>{progressPercent}% Complete</span>
          </div>
        </div>

        {/* Interactive Controls Bar */}
        <div className="flex items-center justify-between mt-1 pt-1 border-t border-stone-100 dark:border-stone-800/85">
          
          {/* Left: Companion ambient synth trigger */}
          <button
            onClick={handleToggleSoundscape}
            className={`p-2 rounded-xl border flex items-center gap-1.5 transition-all text-[10px] font-mono font-medium cursor-pointer ${
              soundscapeEnabled
                ? "bg-amber-100/20 dark:bg-amber-950/20 border-amber-500/30 text-amber-700 dark:text-amber-300"
                : "bg-stone-50 dark:bg-stone-950/40 border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-850"
            }`}
            title="Toggle meditative ambient drone chords"
          >
            {soundscapeEnabled ? <Volume2 className="h-3.5 w-3.5 text-amber-500" /> : <VolumeX className="h-3.5 w-3.5" />}
            <span>Drone Synth</span>
          </button>

          {/* Center: Playback Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                handlePrevStep();
                stopVoice();
              }}
              disabled={currentStepIndex === 0}
              className="p-2 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-300 disabled:opacity-30 cursor-pointer animate-none"
              title="Previous bead"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={handlePlayToggle}
              className="p-3 bg-amber-600 hover:bg-amber-700 dark:bg-amber-550 dark:hover:bg-amber-600 text-white dark:text-stone-950 rounded-full cursor-pointer shadow-md transition-transform hover:scale-105 flex items-center justify-center animate-none"
              title={isPlaying ? "Pause Recitation" : "Resume Recitation"}
            >
              {isPlaying ? <Pause className="h-4.5 w-4.5 fill-current" /> : <Play className="h-4.5 w-4.5 fill-current" />}
            </button>

            <button
              onClick={() => {
                handleNextStep();
                stopVoice();
              }}
              className="p-2 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-850 text-stone-700 dark:text-stone-300 cursor-pointer animate-none"
              title="Next bead"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Right: Auto Advance Toggle/Indicator */}
          <div className="flex items-center gap-1.5 cursor-pointer select-none" onClick={() => setAutoAdvance(!autoAdvance)}>
            <input 
              type="checkbox" 
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer h-3.5 w-3.5 accent-amber-600"
              onClick={(e) => e.stopPropagation()}
            />
            <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">Auto</span>
          </div>

        </div>

      </div>,
      document.body
    );
  }


  return (
    <div className="bg-stone-50 dark:bg-stone-900 rounded-3xl shadow-md border border-stone-200/80 dark:border-stone-800/80 p-6 max-w-4xl mx-auto overflow-hidden">
      
      {/* Header and Title */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800 pb-5 mb-6">
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-amber-600 dark:text-amber-400 uppercase">
            Rosary Companion
          </span>
          <h2 className="text-2xl font-heading font-normal text-stone-950 dark:text-stone-50 flex items-center gap-2 mt-1">
            <Compass className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            Celestial Audio Play-Along Rosary
          </h2>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-1.5 max-w-lg">
            Choose a comforting vocal guide to recite the Rosary together or lead with prayer response prompts. Enable meditational chord drones for deep focus.
          </p>
        </div>

        {/* Mystery Selection Dropdown */}
        <div className="flex items-center gap-2.5 bg-stone-100/80 dark:bg-stone-950/60 border border-stone-200 dark:border-stone-800 p-2 rounded-xl">
          <label className="text-xs font-mono text-stone-500 dark:text-stone-400 uppercase tracking-wider pl-1">Daily Mystery:</label>
          <select 
            value={selectedMysteryKey} 
            onChange={(e) => {
              setSelectedMysteryKey(e.target.value);
              setCurrentStepIndex(0);
              stopVoice();
            }}
            className="text-xs font-semibold border-none rounded-lg px-2 py-1 bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="Joyful">Joyful (Mon/Sat)</option>
            <option value="Sorrowful">Sorrowful (Tue/Fri)</option>
            <option value="Glorious">Glorious (Wed/Sun)</option>
            <option value="Luminous">Luminous (Thu)</option>
          </select>
        </div>
      </div>

      {/* NEW SECTION: Voice Gender Leader Selector Option */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Box Left: Audio Rosary Vocal Guide toggle and setup */}
        <div className="bg-white dark:bg-stone-950/40 p-5 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 uppercase tracking-widest flex items-center gap-1.5 mb-3.5">
              <Volume2 className="h-3.5 w-3.5 text-amber-600" />
              1. Audio Rosary Vocal Guide
            </h4>
            
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsVoiceGuideEnabled(!isVoiceGuideEnabled);
                  stopVoice();
                }}
                className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  isVoiceGuideEnabled
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/40 text-amber-900 dark:text-amber-200 font-medium"
                    : "bg-stone-50 dark:bg-stone-900/45 border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 hover:bg-stone-100/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                    isVoiceGuideEnabled 
                      ? "bg-amber-100 dark:bg-amber-900/55 text-amber-700 dark:text-amber-300"
                      : "bg-stone-200 dark:bg-stone-800 text-stone-500 dark:text-stone-400"
                  }`}>
                    {isVoiceGuideEnabled ? "ON" : "OFF"}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Vocal Guide {isVoiceGuideEnabled ? "Enabled" : "Disabled"}</span>
                    <span className="text-[10px] text-stone-500">Read aloud prayers automatically</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className={`w-2.5 h-2.5 rounded-full ${isVoiceGuideEnabled ? "bg-emerald-500" : "bg-stone-300"}`} />
                </div>
              </button>

              {isVoiceGuideEnabled && (
                <div className="text-[10.5px] text-stone-500 bg-stone-50 dark:bg-stone-900/55 p-3 rounded-xl border border-stone-150 dark:border-stone-850">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-stone-700 dark:text-stone-300">Default Phone Voice:</span>
                    <span className="font-mono text-[10px] bg-stone-200/60 dark:bg-stone-800 text-stone-800 dark:text-stone-200 px-1.5 py-0.5 rounded max-w-[140px] truncate" title={getPhoneDefaultVoice(availableVoices)?.name || "System default"}>
                      {getPhoneDefaultVoice(availableVoices)?.name || "System default"}
                    </span>
                  </div>
                  <p className="text-[9.5px] text-stone-500 dark:text-stone-400 leading-relaxed">
                    Recitations will play naturally using the default preferred language speaker configured on your mobile phone or browser.
                  </p>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-3 text-[10px] text-stone-500 dark:text-stone-400 italic pl-1 flex items-center gap-1.5 border-t border-stone-100 dark:border-stone-800 pt-2.5">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            Vocal recitations are read live on your device.
          </div>
        </div>

        {/* Box Right: Companion vs. Response Mode Selector */}
        <div className="bg-white dark:bg-stone-950/40 p-4 rounded-2xl border border-stone-200 dark:border-stone-800 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-mono font-bold text-stone-800 dark:text-stone-200 uppercase tracking-widest flex items-center gap-1.5 mb-3">
              <MessageCircle className="h-3.5 w-3.5 text-amber-600" />
              2. Play-Along Recitation Style
            </h4>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => setRecitationMode("full")}
                className={`p-2 px-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  recitationMode === "full"
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/40 text-amber-900 dark:text-amber-200 font-medium whitespace-normal"
                    : "bg-stone-50 dark:bg-stone-900/45 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100/80 hover:text-stone-900"
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold">Companion Mode</span>
                  <span className="text-[9.5px] text-stone-500 dark:text-stone-400 mt-0.5">Voice recites 100% of the entire prayer with you</span>
                </div>
                {recitationMode === "full" && <Check className="h-4 w-4 text-amber-600 shrink-0" />}
              </button>

              <button
                onClick={() => setRecitationMode("leader")}
                className={`p-2 px-3.5 rounded-xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                  recitationMode === "leader"
                    ? "bg-amber-50/50 dark:bg-amber-950/20 border-amber-500/40 text-amber-900 dark:text-amber-200 font-medium"
                    : "bg-stone-50 dark:bg-stone-900/45 border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100/80 hover:text-stone-900"
                }`}
              >
                <div className="flex flex-col font-heading">
                  <span className="text-xs font-semibold flex items-center gap-1">
                    Leader / Response Mode
                  </span>
                  <span className="text-[9.5px] text-stone-500 dark:text-stone-400 mt-0.5">Voice leads the 1st half; you recite the 2nd half response</span>
                </div>
                {recitationMode === "leader" && <Check className="h-4 w-4 text-amber-600 shrink-0" />}
              </button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between border-t border-stone-100 dark:border-stone-800 pt-2.5">
            <span className="text-[10px] text-stone-500 dark:text-stone-400">Pace Control:</span>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-stone-500 dark:text-stone-400">Speech Speed:</span>
              <select
                value={voiceRate}
                onChange={(e) => {
                  setVoiceRate(Number(e.target.value));
                  stopVoice();
                }}
                className="text-[10px] border border-stone-200 dark:border-stone-800 rounded bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-medium focus:outline-none"
              >
                <option value={0.75}>Very Reverent (0.75x)</option>
                <option value={0.88}>Reverent (0.88x)</option>
                <option value={1.0}>Standard (1.0x)</option>
                <option value={1.12}>Quick recitation (1.12x)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Liturgical Active Mystery Card */}
      {activeMystery ? (
        <div className="mb-6 bg-amber-50/40 dark:bg-amber-950/20 border border-amber-500/15 rounded-2xl p-4 transition-all">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 bg-amber-100 dark:bg-amber-900/45 p-2 rounded-xl text-amber-700 dark:text-amber-300">
              <span className="font-heading font-bold text-base">#{activeMystery.num}</span>
            </div>
            <div>
              <span className="text-[10px] font-mono text-amber-700 dark:text-amber-400 uppercase tracking-widest font-bold block">
                Fruit of the Mystery: {activeMystery.fruit}
              </span>
              <h3 className="font-heading text-sm font-semibold text-stone-900 dark:text-stone-100 mt-0.5">
                The {activeMystery.num} Mystery: {activeMystery.name}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1 italic">
                {activeMystery.description}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 bg-stone-100 dark:bg-stone-950/60 rounded-2xl p-4 text-center text-xs text-stone-500 dark:text-stone-400 border border-stone-200/50">
          <Info className="h-4 w-4 mx-auto mb-1 text-stone-400" />
          Currently reciting the opening prayers of devotion. Hold Saint Mary's hand to begin Calvary's walk.
        </div>
      )}      {/* Centered Large Prayer Script Viewer */}
      <div className="bg-white dark:bg-stone-950 rounded-2xl border border-stone-200 dark:border-stone-800 p-6 md:p-8 min-h-[240px] flex flex-col justify-between relative shadow-sm">
        
        {/* Step Badge and Audio Pulse */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-block px-2.5 py-0.5 bg-stone-100 dark:bg-stone-900 text-[10px] font-mono text-stone-500 dark:text-stone-400 rounded-full font-bold uppercase tracking-wider">
              Bead {currentStepIndex + 1} of {ROSARY_STEPS.length} • {currentStep.beadType}
            </span>
            
            {/* Display Text Toggle */}
            <button
              onClick={() => setShowPrayerText(!showPrayerText)}
              className="px-2.5 py-0.5 text-[10px] font-mono font-bold rounded-full bg-stone-100 hover:bg-stone-200 dark:bg-stone-900 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 transition-all flex items-center gap-1 cursor-pointer"
              title={showPrayerText ? "Hide active prayer text for focused meditation" : "Show active prayer text"}
            >
              {showPrayerText ? <EyeOff className="h-3 w-3 text-stone-500" /> : <Eye className="h-3 w-3 text-stone-500" />}
              <span>{showPrayerText ? "Hide Text" : "Show Text"}</span>
            </button>
          </div>
          
          {isPlaying && (
            <div className="flex items-center gap-1.5 bg-amber-500/10 dark:bg-amber-500/5 px-2 py-0.5 rounded-full border border-amber-500/20 text-[10px] font-mono text-amber-600 dark:text-amber-400 select-none">
              {isVoiceSpeaking ? (
                <span className="flex items-center gap-1">
                  {/* Waveform graphic animation */}
                  <span className="flex items-end gap-0.5 h-3">
                    <span className="w-0.5 bg-amber-500 rounded-full animate-[bounce_0.6s_infinite_0ms] h-2"></span>
                    <span className="w-0.5 bg-amber-500 rounded-full animate-[bounce_0.6s_infinite_100ms] h-3"></span>
                    <span className="w-0.5 bg-amber-500 rounded-full animate-[bounce_0.6s_infinite_200ms] h-1.5"></span>
                  </span>
                  Guide Voice Reading...
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-stone-300 animate-pulse"></span>
                  Listening / Paused
                </span>
              )}
            </div>
          )}
        </div>

        {/* The active prayer script with Leader & Response Separated beautifully */}
        <div className="my-6 text-center">
          <h4 className="text-xs font-bold text-amber-600 dark:text-amber-550 uppercase tracking-widest font-sans mb-3">
            {currentStep.name}
          </h4>

          {showPrayerText ? (
            recitationMode === "leader" ? (
              <div className="flex flex-col gap-4 text-left max-w-2xl mx-auto">
                {/* Leader segment */}
                <div className="p-3 bg-stone-50 dark:bg-stone-900 rounded-xl border border-stone-100 dark:border-stone-800">
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 uppercase tracking-wider mb-1">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                    Leader (Vocal Guide Speaks):
                  </span>
                  <p className={`text-sm leading-relaxed italic ${isVoiceSpeaking ? "text-stone-900 dark:text-stone-200 font-medium" : "text-stone-500 dark:text-stone-400"}`}>
                    "{prayerScript.leader}"
                  </p>
                </div>

                {/* Response segment */}
                <div className="p-3 bg-amber-500/5 dark:bg-amber-500/[0.02] rounded-xl border border-amber-500/10">
                  <span className="text-[10px] font-mono font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1 uppercase tracking-wider mb-1">
                    <Heart className="h-3 w-3 inline text-amber-600 animate-pulse" />
                    Your Response (Recite Aloud):
                  </span>
                  <p className={`text-sm leading-relaxed font-semibold italic ${!isVoiceSpeaking && isPlaying ? "text-stone-900 dark:text-stone-100 font-normal underline decoration-amber-500/25 decoration-wavy" : "text-stone-500 dark:text-stone-400"}`}>
                    "{prayerScript.response}"
                  </p>
                </div>
              </div>
            ) : (
              // Full play along companion mode
              <p className="text-base md:text-[17px] text-stone-800 dark:text-stone-200 font-heading leading-relaxed font-normal max-w-2xl mx-auto italic">
                "{prayerScript.full}"
              </p>
            )
          ) : (
            <div className="py-8 flex flex-col items-center justify-center gap-3">
              <span className="p-4 rounded-full bg-amber-500/15 dark:bg-amber-500/5 border border-amber-500/20 text-amber-600 animate-pulse">
                <Flame className="h-6 w-6" />
              </span>
              <p className="text-xs text-stone-500 dark:text-stone-400 max-w-xs mx-auto italic leading-normal">
                Active prayer text is hidden for focused scripture meditation. Follow along by listening to the spoken guides.
              </p>
            </div>
          )}
        </div>

        {/* Subtle, pulsing audio visualizer bar */}
        <div className="flex flex-col items-center justify-center -mt-2 mb-4">
          <div 
            ref={visualizerRef}
            className="flex items-end justify-center gap-1.5 h-10 w-full max-w-[200px] mx-auto"
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                className="w-1.5 h-full rounded-full bg-gradient-to-t from-amber-600 to-amber-500 dark:from-amber-550 dark:to-amber-400 origin-bottom"
                style={{ transform: "scaleY(0.08)", opacity: 0.3 }}
              />
            ))}
          </div>
          <span className="text-[9px] font-mono text-stone-400 dark:text-stone-500 tracking-wider mt-1.5 uppercase select-none">
            {isPlaying || soundscapeEnabled ? "Meditation Audio Pulse" : "Visualizer Standby"}
          </span>
        </div>

        {/* Dynamic Prayer Helper Text (Hail Mary, Glory Be fully printed for ease) */}
        <div className="border-t border-stone-100 dark:border-stone-900 pt-3 flex justify-between items-center">
          <span className="text-[10px] text-stone-500 dark:text-stone-500 italic">
            Liturgical devotion of the {selectedMysteryKey} Holy Mystery.
          </span>
          <button 
            onClick={() => {
              let msg = "";
              if (currentStep.name.includes("Hail Mary")) msg = TRADITIONAL_PRAYERS.mary.full;
              else if (currentStep.name.includes("Our Father")) msg = TRADITIONAL_PRAYERS.father.full;
              else if (currentStep.name.includes("Apostle's Creed")) msg = TRADITIONAL_PRAYERS.creed.full;
              else msg = TRADITIONAL_PRAYERS.glory.full;
              alert(msg);
            }} 
            className="text-[10px] font-mono text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
          >
            Show Full Historical Text
          </button>
        </div>
      </div>

      {/* Interactive Rosary Beads Physical Tracker Grid */}
      <h5 className="text-xs font-mono uppercase tracking-widest text-stone-400 dark:text-stone-500 mt-6 mb-3 text-center flex items-center justify-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5 text-amber-605" />
        Interactive Rosary Bead Trail Tracker
      </h5>
      <div className="flex flex-wrap justify-center items-center gap-1.5 p-3.5 bg-stone-100/50 dark:bg-stone-950/40 rounded-2xl border border-stone-200/50 dark:border-stone-850/50 max-h-36 overflow-y-auto mb-6">
        {ROSARY_STEPS.map((step, idx) => {
          const isExtraBead = step.id.includes("glory") || step.name.includes("Glory Be");
          if (isExtraBead) return null;

          const isLarge = step.beadType === "Large Bead" || step.beadType === "Cross";
          return (
            <button
              key={step.id + idx}
              onClick={() => {
                setCurrentStepIndex(idx);
                stopVoice();
                synthRef.current?.playBeadChime();
              }}
              className={`rounded-full transition-all cursor-pointer flex items-center justify-center font-mono text-[8px] font-bold ${
                isLarge ? "w-6 h-6 border border-amber-605/30 shrink-0" : "w-4.5 h-4.5 shrink-0"
              } ${getBeadColorClass(idx)}`}
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
      <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 border-t border-stone-200 dark:border-stone-800 pt-6">
        
        {/* Left: Meditative Ambient Synth */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSoundscape}
            className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
              soundscapeEnabled 
                ? "bg-amber-100 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900 text-amber-805 dark:text-amber-305 font-semibold" 
                : "bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-100"
            }`}
          >
            {soundscapeEnabled ? <Volume2 className="h-4 w-4 text-amber-655" /> : <VolumeX className="h-4 w-4" />}
            <span className="text-xs">Ambient Chords</span>
          </button>
          <div className="text-[10px] text-stone-400 dark:text-stone-500 leading-tight">
            {soundscapeEnabled ? "Playing roots (C-G-C)..." : "Chords off. Click to start celestial background notes."}
          </div>
        </div>

        {/* Center: Play, Forward, Back controls */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              handlePrevStep();
              stopVoice();
            }}
            disabled={currentStepIndex === 0}
            className="p-2.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 disabled:opacity-30 cursor-pointer"
            title="Previous bead"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={handlePlayToggle}
            className="p-3.5 bg-amber-600 hover:bg-amber-700 dark:bg-amber-550 dark:hover:bg-amber-600 text-white dark:text-stone-950 rounded-full cursor-pointer shadow-md transition-transform hover:scale-105 flex items-center justify-center"
            title={isPlaying ? "Pause Recitation" : "Start Play-Along Guide"}
          >
            {isPlaying ? <Pause className="h-6 w-6 fill-current" /> : <Play className="h-6 w-6 fill-current" />}
          </button>

          <button
            onClick={() => {
              handleNextStep();
              stopVoice();
            }}
            className="p-2.5 border border-stone-200 dark:border-stone-800 rounded-xl bg-white dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 cursor-pointer"
            title="Next bead"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <button
            onClick={() => {
              setCurrentStepIndex(0);
              setIsPlaying(false);
              stopVoice();
            }}
            className="p-2 text-stone-400 hover:text-stone-700 dark:text-stone-500 dark:hover:text-stone-300 cursor-pointer"
            title="Reset Rosary"
          >
            <RotateCcw className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Right: Auto Advance Settings */}
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs text-stone-500 dark:text-stone-400">Speech Auto-Advance:</span>
            <input 
              type="checkbox" 
              checked={autoAdvance}
              onChange={(e) => setAutoAdvance(e.target.checked)}
              className="rounded border-stone-300 text-amber-600 focus:ring-amber-500 cursor-pointer h-4 w-4 accent-amber-600"
            />
          </div>
          <span className="text-[9.5px] text-stone-400 dark:text-stone-500 leading-none text-right">
            {autoAdvance ? "Advances automatically when guide stops speaking." : "Requires manual clicking for next bead."}
          </span>
          
          <div className="flex items-center gap-2 mt-1 w-full max-w-[130px]">
            <span className="text-[10px] text-stone-400">Volume:</span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={voiceVolume}
              onChange={(e) => setVoiceVolume(Number(e.target.value))}
              className="w-full accent-amber-600 h-1 rounded-lg bg-stone-200 dark:bg-stone-800 cursor-pointer"
            />
          </div>
        </div>

      </div>

    </div>
  );
}
