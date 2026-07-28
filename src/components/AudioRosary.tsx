/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioRosary — Hallow dark amber theme
 */

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Play, Pause, ChevronRight, ChevronLeft, Volume2, VolumeX, RotateCcw,
  ChevronDown, Check, Info, Flame, Compass, Sparkles, MessageCircle,
  Heart, ShieldCheck, Maximize2, X, Eye, EyeOff
} from "lucide-react";

/* ─── Synth ─────────────────────────────────────────────────────────────────── */
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
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      this.audioCtx = new Ctx();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.8;
      this.analyser.connect(this.audioCtx.destination);
    } catch (e) { console.error(e); }
  }

  startDrone() {
    try {
      this.ensureAudioContext();
      if (!this.audioCtx || !this.analyser) return;
      if (this.audioCtx.state === "suspended") this.audioCtx.resume();
      this.mainGain = this.audioCtx.createGain();
      this.mainGain.gain.setValueAtTime(0.0, this.audioCtx.currentTime);
      this.mainGain.connect(this.analyser);
      const freqs = [130.81, 196.00, 261.63];
      const types: OscillatorType[] = ["sine", "triangle", "sine"];
      const oscs = freqs.map((f, i) => {
        const o = this.audioCtx!.createOscillator();
        o.type = types[i]; o.frequency.value = f;
        o.detune.setValueAtTime((Math.random() - 0.5) * 6, this.audioCtx!.currentTime);
        return o;
      });
      const og = this.audioCtx.createGain();
      og.gain.setValueAtTime(0.12, this.audioCtx.currentTime);
      oscs.forEach(o => { o.connect(og); o.start(); });
      og.connect(this.mainGain);
      this.rootOsc = oscs[0]; this.fifthOsc = oscs[1]; this.octaveOsc = oscs[2];
      this.mainGain.gain.linearRampToValueAtTime(0.25, this.audioCtx.currentTime + 2);
    } catch (e) { console.error(e); }
  }

  stopDrone() {
    try {
      if (this.mainGain && this.audioCtx) {
        const ct = this.audioCtx.currentTime;
        this.mainGain.gain.setValueAtTime(this.mainGain.gain.value, ct);
        this.mainGain.gain.linearRampToValueAtTime(0, ct + 0.8);
        const all = [this.rootOsc, this.fifthOsc, this.octaveOsc];
        const g = this.mainGain;
        this.rootOsc = this.fifthOsc = this.octaveOsc = this.mainGain = null;
        setTimeout(() => { all.forEach(o => { try { o?.stop(); } catch {} }); try { g?.disconnect(); } catch {} }, 900);
      }
    } catch (e) {}
  }

  playBeadChime() {
    try {
      this.ensureAudioContext();
      const ctx = this.audioCtx; if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume();
      const o1 = ctx.createOscillator(), o2 = ctx.createOscillator();
      const g = ctx.createGain(), cg = ctx.createGain();
      o1.type = "sine"; o1.frequency.setValueAtTime(987.77, ctx.currentTime);
      o2.type = "triangle"; o2.frequency.setValueAtTime(1479.98, ctx.currentTime);
      cg.gain.setValueAtTime(0.05, ctx.currentTime);
      g.gain.setValueAtTime(0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
      o1.connect(g); o2.connect(cg); cg.connect(g);
      this.analyser ? g.connect(this.analyser) : g.connect(ctx.destination);
      o1.start(); o2.start(); o1.stop(ctx.currentTime + 1.9); o2.stop(ctx.currentTime + 1.9);
    } catch {}
  }
}

/* ─── Data ──────────────────────────────────────────────────────────────────── */
const MYSTERIES_BY_DAY: Record<string, { title: string; mysteries: { num: number; name: string; description: string; fruit: string }[] }> = {
  Joyful: { title: "The Joyful Mysteries (Mon & Sat)", mysteries: [
    { num:1, name:"The Annunciation", description:"The Angel Gabriel announces to Mary that she will bear the Son of God.", fruit:"Humility" },
    { num:2, name:"The Visitation", description:"Mary visits her cousin Elizabeth, who is pregnant with John the Baptist.", fruit:"Love of Neighbor" },
    { num:3, name:"The Nativity", description:"Jesus Christ is born in a stable in Bethlehem.", fruit:"Poverty of Spirit" },
    { num:4, name:"The Presentation", description:"Infant Jesus is presented in the Temple according to Jewish customs.", fruit:"Obedience" },
    { num:5, name:"The Finding in the Temple", description:"After three days of search, Jesus is found preaching to theologians.", fruit:"Joy of Finding Christ" },
  ]},
  Sorrowful: { title: "The Sorrowful Mysteries (Tue & Fri)", mysteries: [
    { num:1, name:"The Agony in the Garden", description:"Jesus prays in Gethsemane on the eve of Calvary.", fruit:"Sorrow for Sin" },
    { num:2, name:"The Scourging at the Pillar", description:"Jesus is bound and brutally whipped by Roman soldiers.", fruit:"Purity of Heart" },
    { num:3, name:"The Crowning with Thorns", description:"Soldiers weave a crown of thorns onto our Lord's head.", fruit:"Moral Courage" },
    { num:4, name:"The Carrying of the Cross", description:"Jesus carries his cross through Jerusalem toward Calvary.", fruit:"Patience under Trials" },
    { num:5, name:"The Crucifixion", description:"Jesus hangs in agony for three hours to achieve our redemption.", fruit:"Self-Sacrificing Charity" },
  ]},
  Glorious: { title: "The Glorious Mysteries (Wed & Sun)", mysteries: [
    { num:1, name:"The Resurrection", description:"Jesus rises from the dead on Easter Sunday, defeating death.", fruit:"Faith" },
    { num:2, name:"The Ascension", description:"Jesus ascends body and soul into heaven forty days after resurrection.", fruit:"Hope & Desire for Heaven" },
    { num:3, name:"The Descent of the Holy Spirit", description:"Tongues of fire rest upon Mary and the Apostles on Pentecost.", fruit:"Wisdom & Love of God" },
    { num:4, name:"The Assumption of Our Lady", description:"Mary is taken up body and soul into heavenly glory.", fruit:"Devotion to Mary" },
    { num:5, name:"The Coronation of Our Lady", description:"Mary is crowned Queen of Heaven and Earth.", fruit:"Grace of Final Perseverance" },
  ]},
  Luminous: { title: "The Luminous Mysteries (Thu)", mysteries: [
    { num:1, name:"The Baptism of Jesus", description:"The Holy Spirit descends and the Father proclaims Jesus as Son.", fruit:"Gratitude for Baptism" },
    { num:2, name:"The Wedding at Cana", description:"At Mary's request, Jesus turns water into wine.", fruit:"Fidelity & Trust in Mary" },
    { num:3, name:"The Proclamation of the Kingdom", description:"Jesus calls all to repentance and preaches God's reign.", fruit:"Repentance & Conversion" },
    { num:4, name:"The Transfiguration", description:"Jesus shines like the sun on Mount Tabor.", fruit:"Spiritual Courage" },
    { num:5, name:"Institution of the Eucharist", description:"At the Last Supper, Jesus offers His Body and Blood.", fruit:"Eucharistic Adoration" },
  ]},
};

const ROSARY_STEPS = [
  { id:"intro-creed", name:"Apostle's Creed", beadType:"Cross", text:"I believe in God, the Father Almighty..." },
  { id:"intro-father", name:"Our Father (Pope's Intentions)", beadType:"Large Bead", text:"Our Father, Who art in heaven..." },
  { id:"intro-m1", name:"Hail Mary (For Faith)", beadType:"Small Bead", text:"Hail Mary, full of grace..." },
  { id:"intro-m2", name:"Hail Mary (For Hope)", beadType:"Small Bead", text:"Hail Mary, full of grace..." },
  { id:"intro-m3", name:"Hail Mary (For Charity)", beadType:"Small Bead", text:"Hail Mary, full of grace..." },
  { id:"intro-glory", name:"Glory Be & Fatima Prayer", beadType:"Large Bead", text:"Glory be to the Father..." },
  { id:"d1-ann", name:"Decade 1: Lord's Prayer", beadType:"Large Bead", text:"Our Father, who art in heaven..." },
  ...Array.from({length:10},(_,i)=>({ id:`d1-${i+1}`, name:`Decade 1: Hail Mary ${i+1}`, beadType:"Small Bead", text:"Hail Mary, full of grace..." })),
  { id:"d1-glory", name:"Glory Be & Fatima Prayer", beadType:"Large Bead", text:"Glory be to the Father..." },
  { id:"d2-father", name:"Decade 2: Lord's Prayer", beadType:"Large Bead", text:"Our Father, who art in heaven..." },
  ...Array.from({length:10},(_,i)=>({ id:`d2-${i+1}`, name:`Decade 2: Hail Mary ${i+1}`, beadType:"Small Bead", text:"Hail Mary, full of grace..." })),
  { id:"d2-glory", name:"Glory Be & Fatima Prayer", beadType:"Large Bead", text:"Glory be to the Father..." },
  { id:"d3-father", name:"Decade 3: Lord's Prayer", beadType:"Large Bead", text:"Our Father, who art in heaven..." },
  ...Array.from({length:10},(_,i)=>({ id:`d3-${i+1}`, name:`Decade 3: Hail Mary ${i+1}`, beadType:"Small Bead", text:"Hail Mary, full of grace..." })),
  { id:"d3-glory", name:"Glory Be & Fatima Prayer", beadType:"Large Bead", text:"Glory be to the Father..." },
  { id:"d4-father", name:"Decade 4: Lord's Prayer", beadType:"Large Bead", text:"Our Father, who art in heaven..." },
  ...Array.from({length:10},(_,i)=>({ id:`d4-${i+1}`, name:`Decade 4: Hail Mary ${i+1}`, beadType:"Small Bead", text:"Hail Mary, full of grace..." })),
  { id:"d4-glory", name:"Glory Be & Fatima Prayer", beadType:"Large Bead", text:"Glory be to the Father..." },
  { id:"d5-father", name:"Decade 5: Lord's Prayer", beadType:"Large Bead", text:"Our Father, who art in heaven..." },
  ...Array.from({length:10},(_,i)=>({ id:`d5-${i+1}`, name:`Decade 5: Hail Mary ${i+1}`, beadType:"Small Bead", text:"Hail Mary, full of grace..." })),
  { id:"d5-glory", name:"Glory Be & Fatima Prayer", beadType:"Large Bead", text:"Glory be to the Father..." },
  { id:"final-salve", name:"Hail Holy Queen (Salve Regina)", beadType:"Cross", text:"Hail, holy Queen, Mother of mercy..." },
  { id:"final-conclude", name:"Concluding Prayers", beadType:"Cross", text:"O God, whose only begotten Son..." },
];

interface PrayerScript { full: string; leader: string; response: string; }
const PRAYERS: Record<string, PrayerScript> = {
  creed: { full:"I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father Almighty; from there He shall come to judge the living and the dead. I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen.", leader:"I believe in God, the Father Almighty, Creator of heaven and earth, and in Jesus Christ, His only Son, our Lord, who was conceived by the Holy Spirit, born of the Virgin Mary, suffered under Pontius Pilate, was crucified, died and was buried; He descended into hell; on the third day He rose again from the dead; He ascended into heaven, and is seated at the right hand of God the Father Almighty; from there He shall come to judge the living and the dead.", response:"I believe in the Holy Spirit, the holy catholic Church, the communion of saints, the forgiveness of sins, the resurrection of the body, and life everlasting. Amen." },
  father: { full:"Our Father, Who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done, on earth as it is in heaven. Give us this day our daily bread. And forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen.", leader:"Our Father, Who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done, on earth as it is in heaven.", response:"Give us this day our daily bread. And forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen." },
  mary: { full:"Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.", leader:"Hail Mary, full of grace, the Lord is with thee. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus.", response:"Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen." },
  glory: { full:"Glory be to the Father, and to the Son, and to the Holy Spirit. As it was in the beginning, is now, and ever shall be, world without end. Amen. O my Jesus, forgive us our sins, save us from the fires of hell. Lead all souls to heaven, especially those in most need of thy mercy. Amen.", leader:"Glory be to the Father, and to the Son, and to the Holy Spirit.", response:"As it was in the beginning, is now, and ever shall be, world without end. Amen. O my Jesus, forgive us our sins, save us from the fires of hell. Lead all souls to heaven, especially those in most need of thy mercy. Amen." },
  salve: { full:"Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen.", leader:"Hail, holy Queen, Mother of mercy, our life, our sweetness and our hope. To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears. Turn then, most gracious advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary.", response:"Pray for us, O holy Mother of God, that we may be made worthy of the promises of Christ. Amen." },
  conclude: { full:"O God, whose only begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal salvation, grant, we beseech Thee, that meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen. In the name of the Father, and of the Son, and of the Holy Spirit. Amen.", leader:"O God, whose only begotten Son, by His life, death, and resurrection, has purchased for us the rewards of eternal salvation, grant, we beseech Thee, that meditating upon these mysteries of the Most Holy Rosary of the Blessed Virgin Mary, we may imitate what they contain and obtain what they promise, through the same Christ our Lord. Amen.", response:"In the name of the Father, and of the Son, and of the Holy Spirit. Amen." },
};

function getPrayerKey(id: string): keyof typeof PRAYERS {
  if (id.includes("creed")) return "creed";
  if (id.includes("father") || id.includes("ann")) return "father";
  if (id.includes("glory")) return "glory";
  if (id.includes("salve")) return "salve";
  if (id.includes("conclude")) return "conclude";
  return "mary";
}

/* ─── Component ─────────────────────────────────────────────────────────────── */
interface AudioRosaryProps {
  onRosaryComplete: () => void;
  isTabActive?: boolean;
  setActiveTab?: (tab: any) => void;
  isFocusMode?: boolean;
  setIsFocusMode?: (v: boolean) => void;
}

export function AudioRosary({ onRosaryComplete, isTabActive = true, setActiveTab }: AudioRosaryProps) {
  const [mysteryKey, setMysteryKey] = useState("Joyful");
  const [stepIdx, setStepIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [droneOn, setDroneOn] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [mode, setMode] = useState<"full"|"leader">("full");
  const [rate, setRate] = useState(0.9);
  const [volume, setVolume] = useState(0.95);
  const [speaking, setSpeaking] = useState(false);
  const [showText, setShowText] = useState(true);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synthRef = useRef<RosarySynth | null>(null);
  const isPlayingRef = useRef(false);
  const speechTimerRef = useRef<NodeJS.Timeout | null>(null);
  const vizRef = useRef<HTMLDivElement>(null);
  const miniVizRef = useRef<HTMLDivElement>(null);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  /* Visualizer */
  useEffect(() => {
    let raf: number;
    const data = new Uint8Array(32);
    const N = 16;
    const tick = () => {
      const vals = new Float32Array(N);
      const s = synthRef.current;
      if (s?.analyser && s.audioCtx?.state !== "suspended") {
        s.analyser.getByteFrequencyData(data);
        for (let i = 0; i < N; i++) vals[i] = (data[i+1]||0)/255;
      }
      if (speaking && isPlaying) {
        const t = Date.now()*0.005;
        for (let i=0;i<N;i++) {
          const v = (Math.sin(t*3+i*0.5)*0.4+0.6)*(Math.random()*0.4+0.2)*Math.sin(i*Math.PI/N)*volume;
          vals[i]=Math.max(vals[i],v);
        }
      } else if (isPlaying) {
        const b=Math.sin(Date.now()*0.0025)*0.15+0.2;
        for(let i=0;i<N;i++) vals[i]=Math.max(vals[i],(Math.sin(i*Math.PI/(N-1))*0.1+0.05)*b);
      }
      [vizRef, miniVizRef].forEach(r => {
        if (!r.current) return;
        const bars=r.current.children;
        for(let i=0;i<N;i++) {
          const b=bars[i] as HTMLDivElement;
          if(b){ const sc=Math.max(0.08,vals[i]); b.style.transform=`scaleY(${sc})`; b.style.opacity=`${0.3+sc*0.7}`; }
        }
      });
      raf=requestAnimationFrame(tick);
    };
    tick();
    return ()=>cancelAnimationFrame(raf);
  },[isPlaying,speaking,droneOn,volume]);

  useEffect(()=>{
    const day=new Date().getDay();
    if(day===1||day===6) setMysteryKey("Joyful");
    else if(day===2||day===5) setMysteryKey("Sorrowful");
    else if(day===4) setMysteryKey("Luminous");
    else setMysteryKey("Glorious");
  },[]);

  useEffect(()=>{
    synthRef.current=new RosarySynth();
    if("speechSynthesis" in window){
      const upd=()=>setVoices(window.speechSynthesis.getVoices());
      upd(); window.speechSynthesis.onvoiceschanged=upd;
    }
    return ()=>{ synthRef.current?.stopDrone(); if("speechSynthesis" in window) window.speechSynthesis.cancel(); };
  },[]);

  const getDefaultVoice=(vs:SpeechSynthesisVoice[])=>{
    const eng=vs.filter(v=>v.lang.toLowerCase().startsWith("en"));
    if(!eng.length) return vs.find(v=>v.default)||vs[0]||null;
    const us=eng.filter(v=>v.lang.toLowerCase().includes("us")||v.lang.toLowerCase()==="en");
    return us.find(v=>v.localService)||us[0]||eng.find(v=>v.default)||eng.find(v=>v.localService)||eng[0]||null;
  };

  const getMystery=()=>{
    const m=MYSTERIES_BY_DAY[mysteryKey].mysteries;
    if(stepIdx>=6&&stepIdx<=17) return m[0];
    if(stepIdx>=18&&stepIdx<=29) return m[1];
    if(stepIdx>=30&&stepIdx<=41) return m[2];
    if(stepIdx>=42&&stepIdx<=53) return m[3];
    if(stepIdx>=54&&stepIdx<=65) return m[4];
    return null;
  };

  const stopVoice=()=>{
    if(speechTimerRef.current){ clearTimeout(speechTimerRef.current); speechTimerRef.current=null; }
    if("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const next=()=>{
    if(stepIdx===ROSARY_STEPS.length-1){ setIsPlaying(false); onRosaryComplete(); alert("Praised be Jesus Christ! You have completed the Holy Rosary."); return; }
    synthRef.current?.playBeadChime();
    setStepIdx(p=>p+1);
  };

  const prev=()=>{ if(stepIdx>0) setStepIdx(p=>p-1); };

  const speakPrayer=(idx:number)=>{
    if(!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if(!isPlaying||!voiceOn){ setSpeaking(false); return; }
    const step=ROSARY_STEPS[idx];
    const key=getPrayerKey(step.id);
    const script=PRAYERS[key];
    let text=mode==="full"?script.full:script.leader;
    if(idx===0) text="Let us begin. In the name of the Father, and of the Son, and of the Holy Spirit. Amen. "+text;
    const mystery=getMystery();
    if(step.id.includes("ann")&&mystery) text=`The First Mystery: ${mystery.name}. Fruit: ${mystery.fruit}. `+text;
    const u=new SpeechSynthesisUtterance(text);
    u.volume=volume; u.rate=rate;
    const v=getDefaultVoice(window.speechSynthesis.getVoices().length?window.speechSynthesis.getVoices():voices);
    if(v) u.voice=v;
    u.onstart=()=>setSpeaking(true);
    u.onend=()=>{ setSpeaking(false); if(isPlayingRef.current&&autoAdvance) setTimeout(()=>{ if(isPlayingRef.current) next(); },1800); };
    u.onerror=()=>setSpeaking(false);
    if(speechTimerRef.current) clearTimeout(speechTimerRef.current);
    speechTimerRef.current=setTimeout(()=>{ if("speechSynthesis" in window&&isPlayingRef.current&&voiceOn) window.speechSynthesis.speak(u); },100);
  };

  useEffect(()=>{ if(isPlaying&&voiceOn) speakPrayer(stepIdx); else stopVoice(); return()=>stopVoice(); },[stepIdx,isPlaying,voiceOn,mode,rate]);

  const step=ROSARY_STEPS[stepIdx];
  const mystery=getMystery();
  const pKey=getPrayerKey(step.id);
  const prayer=PRAYERS[pKey];
  const progress=Math.round((stepIdx/(ROSARY_STEPS.length-1))*100);

  const beadColor=(i:number)=>{
    if(i===stepIdx) return "bg-[#c9922a] scale-125 ring-4 ring-[#c9922a]/30 text-[#1a0f00] font-bold";
    if(i<stepIdx) return "bg-[#8a5a15] text-[#f5ead8]/70";
    return "bg-[#1e1a10] text-[#4a3318] hover:bg-[#2a1e08]";
  };

  /* Mini player (when tab not active) */
  if(!isTabActive){
    const active=isPlaying||droneOn||stepIdx>0;
    if(!active) return null;
    return createPortal(
      <div className="fixed bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-[400px] bg-[#131008] border border-[#2a1e08] shadow-2xl rounded-2xl p-4 z-[9999] flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-[#1e1a10] pb-2">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isPlaying?"bg-[#c9922a] animate-pulse":"bg-[#4a3318]"}`}/>
            <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-[#6b5a30]">{isPlaying?"Playing Rosary":"Rosary Paused"}</span>
          </div>
          <div className="flex gap-1">
            <button onClick={()=>setActiveTab?.("pray")} className="p-1.5 rounded-lg text-[#4a3318] hover:text-[#c9922a] cursor-pointer bg-none border-none"><Maximize2 className="w-4 h-4"/></button>
            <button onClick={()=>{ setIsPlaying(false); stopVoice(); synthRef.current?.stopDrone(); setDroneOn(false); setStepIdx(0); }} className="p-1.5 rounded-lg text-[#4a3318] hover:text-[#e05050] cursor-pointer bg-none border-none"><X className="w-4 h-4"/></button>
          </div>
        </div>
        <div>
          <div className="text-[12px] font-bold text-[#ddc98a]">{step.name}</div>
          {mystery&&<div className="text-[10px] text-[#c9922a] mt-0.5">Mystery: {mystery.name} · {mystery.fruit}</div>}
          <div className="text-[10px] text-[#4a3318] italic mt-1 line-clamp-1">"{step.text}"</div>
        </div>
        <div ref={miniVizRef} className="flex items-end gap-1 h-5 bg-[#0c0a07] rounded-lg px-2 py-1">
          {Array.from({length:16}).map((_,i)=><div key={i} className="w-1 h-full rounded-full bg-[#c9922a] origin-bottom" style={{transform:"scaleY(0.08)",opacity:0.3}}/>)}
        </div>
        <div className="h-1.5 bg-[#1e1a10] rounded-full overflow-hidden"><div className="h-full bg-[#c9922a] rounded-full transition-all" style={{width:`${progress}%`}}/></div>
        <div className="flex items-center justify-between">
          <button onClick={()=>{droneOn?synthRef.current?.stopDrone():synthRef.current?.startDrone();setDroneOn(!droneOn);}} className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10px] font-bold cursor-pointer ${droneOn?"bg-[#c9922a]/15 border-[#3d2808] text-[#c9922a]":"bg-[#131008] border-[#1e1a10] text-[#4a3318]"}`}>
            {droneOn?<Volume2 className="w-3 h-3"/>:<VolumeX className="w-3 h-3"/>} Chants
          </button>
          <div className="flex items-center gap-3">
            <button onClick={()=>{prev();stopVoice();}} disabled={stepIdx===0} className="p-2 bg-[#131008] border border-[#1e1a10] rounded-xl text-[#6b5a30] disabled:opacity-30 cursor-pointer"><ChevronLeft className="w-3.5 h-3.5"/></button>
            <button onClick={()=>setIsPlaying(!isPlaying)} className="p-3 bg-[#c9922a] rounded-full text-[#1a0f00] cursor-pointer"><{isPlaying?Pause:Play} className="w-4 h-4 fill-current"/></button>
            <button onClick={()=>{next();stopVoice();}} className="p-2 bg-[#131008] border border-[#1e1a10] rounded-xl text-[#6b5a30] cursor-pointer"><ChevronRight className="w-3.5 h-3.5"/></button>
          </div>
          <label className="flex items-center gap-1.5 cursor-pointer">
            <input type="checkbox" checked={autoAdvance} onChange={e=>setAutoAdvance(e.target.checked)} className="accent-amber-600 w-3.5 h-3.5"/>
            <span className="text-[10px] text-[#4a3318] font-mono">Auto</span>
          </label>
        </div>
      </div>,
      document.body
    );
  }

  /* Full player */
  return (
    <div className="bg-[#0e0b05] rounded-2xl border border-[#2a1e08] p-5 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1e1a10] pb-4 mb-5">
        <div>
          <div className="text-[10px] font-mono font-bold tracking-widest text-[#c9922a] uppercase mb-1">Rosary Companion</div>
          <h2 className="text-[17px] font-bold text-[#f5ead8] flex items-center gap-2"><Compass className="w-5 h-5 text-[#c9922a]"/>Celestial Audio Rosary</h2>
          <p className="text-[10.5px] text-[#4a3318] mt-1">Vocal guide to recite the Rosary with prayer prompts and ambient drone chords.</p>
        </div>
        <div className="flex items-center gap-2 bg-[#131008] border border-[#1e1a10] p-2 rounded-xl">
          <label className="text-[10px] font-mono text-[#4a3318] uppercase tracking-wide">Daily Mystery:</label>
          <select value={mysteryKey} onChange={e=>{setMysteryKey(e.target.value);setStepIdx(0);stopVoice();}} className="text-[11px] font-semibold border-none rounded-lg px-2 py-1 bg-[#0c0a07] text-[#c9922a] cursor-pointer focus:outline-none">
            <option value="Joyful">Joyful (Mon/Sat)</option>
            <option value="Sorrowful">Sorrowful (Tue/Fri)</option>
            <option value="Glorious">Glorious (Wed/Sun)</option>
            <option value="Luminous">Luminous (Thu)</option>
          </select>
        </div>
      </div>

      {/* Settings grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
        {/* Voice guide */}
        <div className="bg-[#131008] border border-[#1e1a10] rounded-xl p-4">
          <div className="text-[9.5px] font-mono font-bold text-[#6b5a30] uppercase tracking-widest flex items-center gap-1.5 mb-3"><Volume2 className="w-3.5 h-3.5 text-[#c9922a]"/>1. Vocal Guide</div>
          <button onClick={()=>{setVoiceOn(!voiceOn);stopVoice();}} className={`w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${voiceOn?"bg-[#1e1405] border-[#c9922a]/30 text-[#ddc98a]":"bg-[#0c0a07] border-[#1e1a10] text-[#4a3318]"}`}>
            <div className="flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[11px] ${voiceOn?"bg-[#c9922a]/20 text-[#c9922a]":"bg-[#1e1a10] text-[#4a3318]"}`}>{voiceOn?"ON":"OFF"}</div>
              <div><div className="text-[11px] font-semibold">Vocal Guide {voiceOn?"Enabled":"Disabled"}</div><div className="text-[9.5px] text-[#4a3318]">Read prayers aloud automatically</div></div>
            </div>
            <span className={`w-2.5 h-2.5 rounded-full ${voiceOn?"bg-[#50b870]":"bg-[#2a1e08]"}`}/>
          </button>
          {voiceOn&&(
            <div className="mt-2 p-2.5 bg-[#0c0a07] border border-[#1e1a10] rounded-xl text-[10px] text-[#4a3318]">
              <div className="flex justify-between mb-1"><span className="text-[#6b5a30] font-semibold">Voice:</span><span className="font-mono text-[#8a6a30] truncate max-w-[120px]">{getDefaultVoice(voices)?.name||"System default"}</span></div>
              <p className="text-[9px] leading-relaxed text-[#3d2808]">Plays using your device's default English speaker.</p>
            </div>
          )}
          <div className="mt-2 text-[9.5px] text-[#2a1e08] flex items-center gap-1 pt-2 border-t border-[#1e1a10]"><ShieldCheck className="w-3 h-3 text-[#50b870]"/>Recitations read live on your device.</div>
        </div>

        {/* Mode */}
        <div className="bg-[#131008] border border-[#1e1a10] rounded-xl p-4">
          <div className="text-[9.5px] font-mono font-bold text-[#6b5a30] uppercase tracking-widest flex items-center gap-1.5 mb-3"><MessageCircle className="w-3.5 h-3.5 text-[#c9922a]"/>2. Recitation Style</div>
          <div className="flex flex-col gap-2">
            {(["full","leader"] as const).map(m=>(
              <button key={m} onClick={()=>setMode(m)} className={`p-2.5 rounded-xl border text-left flex items-center justify-between cursor-pointer transition-all ${mode===m?"bg-[#1e1405] border-[#c9922a]/30 text-[#ddc98a]":"bg-[#0c0a07] border-[#1e1a10] text-[#4a3318] hover:border-[#2a1e08]"}`}>
                <div><div className="text-[11px] font-semibold">{m==="full"?"Companion Mode":"Leader / Response"}</div><div className="text-[9px] text-[#3d2808] mt-0.5">{m==="full"?"Voice recites 100% with you":"Voice leads 1st half; you recite response"}</div></div>
                {mode===m&&<Check className="w-3.5 h-3.5 text-[#c9922a] flex-shrink-0"/>}
              </button>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-[#1e1a10] flex items-center justify-between">
            <span className="text-[10px] text-[#4a3318]">Speed:</span>
            <select value={rate} onChange={e=>{setRate(Number(e.target.value));stopVoice();}} className="text-[10px] bg-[#0c0a07] border border-[#1e1a10] rounded px-2 py-1 text-[#8a6a30] focus:outline-none">
              <option value={0.75}>Very Reverent (0.75x)</option>
              <option value={0.88}>Reverent (0.88x)</option>
              <option value={1.0}>Standard (1.0x)</option>
              <option value={1.12}>Quick (1.12x)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active mystery */}
      {mystery?(
        <div className="mb-5 bg-[#1a1405] border border-[#2a1e08] rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-[#c9922a]/10 border border-[#c9922a]/20 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-[#c9922a]">#{mystery.num}</div>
            <div>
              <div className="text-[9.5px] font-mono font-bold text-[#c9922a] uppercase tracking-widest mb-0.5">Fruit: {mystery.fruit}</div>
              <div className="text-[13px] font-bold text-[#f5ead8]">The {mystery.num} Mystery: {mystery.name}</div>
              <div className="text-[10.5px] text-[#6b5a30] mt-1 italic">{mystery.description}</div>
            </div>
          </div>
        </div>
      ):(
        <div className="mb-5 bg-[#131008] border border-[#1e1a10] rounded-xl p-4 text-center text-[10.5px] text-[#4a3318] italic">
          Currently reciting the opening prayers. Hold Saint Mary's hand to begin.
        </div>
      )}

      {/* Prayer viewer */}
      <div className="bg-[#131008] border border-[#1e1a10] rounded-xl p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[9.5px] font-mono bg-[#0c0a07] border border-[#1e1a10] text-[#4a3318] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">Bead {stepIdx+1}/{ROSARY_STEPS.length} · {step.beadType}</span>
          <div className="flex items-center gap-2">
            {isPlaying&&<span className={`text-[10px] font-mono flex items-center gap-1.5 ${speaking?"text-[#c9922a]":"text-[#4a3318]"}`}>{speaking?"🔊 Guide speaking...":"⏸ Listening..."}</span>}
            <button onClick={()=>setShowText(!showText)} className="flex items-center gap-1 text-[10px] font-mono text-[#4a3318] hover:text-[#8a6a30] cursor-pointer bg-none border-none">
              {showText?<EyeOff className="w-3 h-3"/>:<Eye className="w-3 h-3"/>}{showText?"Hide":"Show"}
            </button>
          </div>
        </div>

        <div className="text-[10px] font-bold text-[#c9922a] uppercase tracking-widest text-center mb-3">{step.name}</div>

        {showText?(
          mode==="leader"?(
            <div className="flex flex-col gap-3">
              <div className="bg-[#0e0b05] border border-[#1e1a10] rounded-xl p-3">
                <div className="text-[9px] font-mono font-bold text-[#c9922a] uppercase tracking-widest flex items-center gap-1 mb-1.5"><span className={`w-1.5 h-1.5 rounded-full ${speaking?"bg-[#c9922a] animate-ping":"bg-[#3d2808]"}`}/>Leader (Voice Speaks):</div>
                <p className={`prayer-text text-[12px] ${speaking?"text-[#ddc98a]":"text-[#4a3318]"}`}>"{prayer.leader}"</p>
              </div>
              <div className="bg-[#1a1405] border border-[#2a1e08] rounded-xl p-3">
                <div className="text-[9px] font-mono font-bold text-[#c9922a] uppercase tracking-widest flex items-center gap-1 mb-1.5"><Heart className="w-2.5 h-2.5 text-[#c9922a]"/>Your Response:</div>
                <p className={`prayer-text text-[12px] ${!speaking&&isPlaying?"text-[#f5ead8]":"text-[#6b5a30]"}`}>"{prayer.response}"</p>
              </div>
            </div>
          ):(
            <p className="prayer-text text-[13px] text-[#c9b888] text-center leading-relaxed">"{prayer.full}"</p>
          )
        ):(
          <div className="py-8 text-center">
            <Flame className="w-8 h-8 text-[#c9922a] mx-auto mb-2 animate-pulse"/>
            <p className="text-[10.5px] text-[#4a3318] italic">Prayer text hidden for focused meditation.</p>
          </div>
        )}

        {/* Visualizer */}
        <div className="mt-4 flex flex-col items-center">
          <div ref={vizRef} className="flex items-end gap-1 h-8 w-40">
            {Array.from({length:16}).map((_,i)=><div key={i} className="w-1.5 h-full rounded-full bg-[#c9922a] origin-bottom" style={{transform:"scaleY(0.08)",opacity:0.3}}/>)}
          </div>
          <span className="text-[8.5px] font-mono text-[#2a1e08] tracking-wider mt-1 uppercase">{isPlaying||droneOn?"Meditation Audio Pulse":"Visualizer Standby"}</span>
        </div>

        <div className="mt-4 pt-3 border-t border-[#1e1a10] flex items-center justify-between">
          <span className="text-[9.5px] italic text-[#2a1e08]">Liturgical devotion of the {mysteryKey} Holy Mystery.</span>
          <button onClick={()=>alert(prayer.full)} className="text-[9.5px] font-mono text-[#c9922a] hover:underline cursor-pointer bg-none border-none">Show Full Text</button>
        </div>
      </div>

      {/* Bead tracker */}
      <div className="text-[9px] font-mono uppercase tracking-widest text-[#2a1e08] text-center mb-2 flex items-center justify-center gap-1.5"><Sparkles className="w-3 h-3 text-[#c9922a]"/>Bead Trail</div>
      <div className="flex flex-wrap justify-center gap-1.5 p-3 bg-[#0c0a07] border border-[#1e1a10] rounded-xl max-h-28 overflow-y-auto mb-5">
        {ROSARY_STEPS.map((s,i)=>{
          if(s.id.includes("glory")) return null;
          const large=s.beadType==="Large Bead"||s.beadType==="Cross";
          return (
            <button key={s.id+i} onClick={()=>{setStepIdx(i);stopVoice();synthRef.current?.playBeadChime();}}
              className={`rounded-full transition-all cursor-pointer flex items-center justify-center font-mono text-[8px] font-bold ${large?"w-6 h-6":"w-4 h-4"} ${beadColor(i)}`} title={s.name}>
              {large?"†":s.id.split("-").pop()?.replace(/[a-z]/g,"")||""}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="grid grid-cols-3 items-center gap-4 border-t border-[#1e1a10] pt-4">
        <div className="flex items-center gap-2">
          <button onClick={()=>{droneOn?synthRef.current?.stopDrone():synthRef.current?.startDrone();setDroneOn(!droneOn);}} className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-[11px] cursor-pointer transition-all ${droneOn?"bg-[#1e1405] border-[#c9922a]/30 text-[#c9922a]":"bg-[#131008] border-[#1e1a10] text-[#4a3318] hover:border-[#2a1e08]"}`}>
            {droneOn?<Volume2 className="w-4 h-4"/>:<VolumeX className="w-4 h-4"/>}<span className="hidden sm:inline">Ambient Chords</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button onClick={()=>{prev();stopVoice();}} disabled={stepIdx===0} className="p-2.5 bg-[#131008] border border-[#1e1a10] rounded-xl text-[#6b5a30] disabled:opacity-30 cursor-pointer hover:border-[#2a1e08]"><ChevronLeft className="w-5 h-5"/></button>
          <button onClick={()=>setIsPlaying(!isPlaying)} className="p-4 bg-[#c9922a] hover:bg-[#e5b04a] rounded-full text-[#1a0f00] cursor-pointer shadow-lg transition-all hover:scale-105">
            {isPlaying?<Pause className="w-5 h-5 fill-current"/>:<Play className="w-5 h-5 fill-current"/>}
          </button>
          <button onClick={()=>{next();stopVoice();}} className="p-2.5 bg-[#131008] border border-[#1e1a10] rounded-xl text-[#6b5a30] cursor-pointer hover:border-[#2a1e08]"><ChevronRight className="w-5 h-5"/></button>
          <button onClick={()=>{setStepIdx(0);setIsPlaying(false);stopVoice();}} className="p-2 text-[#2a1e08] hover:text-[#6b5a30] cursor-pointer bg-none border-none"><RotateCcw className="w-4 h-4"/></button>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-[10px] text-[#4a3318]">Auto-Advance:</span>
            <input type="checkbox" checked={autoAdvance} onChange={e=>setAutoAdvance(e.target.checked)} className="accent-amber-600 w-4 h-4"/>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-[9.5px] text-[#2a1e08]">Volume:</span>
            <input type="range" min="0.2" max="1" step="0.05" value={volume} onChange={e=>setVolume(Number(e.target.value))} className="w-20 accent-amber-600 h-1 bg-[#1e1a10] rounded cursor-pointer"/>
          </div>
        </div>
      </div>
    </div>
  );
}
