import React, { useState, useEffect } from "react";
import { 
  ClipboardCheck, Clock, Bookmark, ChevronDown, ChevronUp, Trash, 
  RotateCcw, ShieldCheck, Heart, Info, HelpCircle, Calendar, 
  Plus, CheckCircle2, AlertCircle, FileText, Check, ShieldAlert, Sparkles, BookOpen
} from "lucide-react";

interface ConfessionPrepTabProps {
  triggerSound?: () => void;
}

interface SinsState {
  [sinId: string]: boolean;
}

interface CommandmentReflection {
  id: string;
  number: number;
  title: string;
  commandmentText: string;
  sins: { id: string; text: string; gravity: "venial" | "mortal_potential" }[];
}

const COMMANDMENTS_GUIDE: CommandmentReflection[] = [
  {
    id: "commandment-1",
    number: 1,
    title: "First Commandment",
    commandmentText: "I am the Lord your God. You shall not have strange gods before Me.",
    sins: [
      { id: "c1-1", text: "Have I doubted or denied any teachings of the Catholic Church or the existence of God?", gravity: "mortal_potential" },
      { id: "c1-2", text: "Have I neglected regular daily prayer, or treated prayer as a thoughtless chore?", gravity: "venial" },
      { id: "c1-3", text: "Have I placed other things (money, work, fame, sports, internet, pleasure) above God?", gravity: "mortal_potential" },
      { id: "c1-4", text: "Have I actively read or engaged in superstitious practices like astrology, horoscopes, tarot cards, ouija boards, or occult mediums?", gravity: "mortal_potential" },
      { id: "c1-5", text: "Have I presumed upon God's mercy (doing wrong with the intent of confessing it later)?", gravity: "mortal_potential" },
      { id: "c1-6", text: "Have I despaired of God's mercy, believing my sins are too great to be forgiven?", gravity: "mortal_potential" },
    ]
  },
  {
    id: "commandment-2",
    number: 2,
    title: "Second Commandment",
    commandmentText: "You shall not take the name of the Lord your God in vain.",
    sins: [
      { id: "c2-1", text: "Have I used the Holy Name of Jesus, God, Mary, or the Saints carelessly, in anger, or as a curse word?", gravity: "venial" },
      { id: "c2-2", text: "Have I broken any solemn promises, oaths, or vows made to God?", gravity: "mortal_potential" },
      { id: "c2-3", text: "Have I spoken with hatred, irreverence, or mockery toward holy things, the sacraments, or Church teachings?", gravity: "mortal_potential" },
      { id: "c2-4", text: "Have I committed perjury (swearing falsely under oath)?", gravity: "mortal_potential" }
    ]
  },
  {
    id: "commandment-3",
    number: 3,
    title: "Third Commandment",
    commandmentText: "Remember to keep holy the Lord's Day.",
    sins: [
      { id: "c3-1", text: "Have I deliberately missed Holy Mass on a Sunday or a Holy Day of Obligation without a grave reason (such as sickness, or caring for infants)?", gravity: "mortal_potential" },
      { id: "c3-2", text: "Have I done unnecessary manual labor, shopping, or heavy chores on Sunday that hindered resting, prayer, or worship?", gravity: "venial" },
      { id: "c3-3", text: "Have I failed to make Sunday a joyful day of rest, focusing more on work/distractions than family and religious celebration?", gravity: "venial" },
      { id: "c3-4", text: "Have I consistently arrived late or left early from Mass due to laziness or neglect?", gravity: "venial" }
    ]
  },
  {
    id: "commandment-4",
    number: 4,
    title: "Fourth Commandment",
    commandmentText: "Honor your father and your mother.",
    sins: [
      { id: "c4-1", text: "Have I been disobedient, disrespectful, or verbally unkind to my parents, guardians, or elders?", gravity: "venial" },
      { id: "c4-2", text: "Have I neglected our relational or physical duties to my spouse, family, parents, or children?", gravity: "venial" },
      { id: "c4-3", text: "Have I failed to support, visit, or care for my parents in their old age, sickness, or times of loneliness?", gravity: "mortal_potential" },
      { id: "c4-4", text: "Have I broken the civil laws or neglected civic duties (e.g., paying fair taxes) without serious reason?", gravity: "venial" },
      { id: "c4-5", text: "Have I spoken ill of or rebelled against legitimate authorities, teachers, or pastors?", gravity: "venial" }
    ]
  },
  {
    id: "commandment-5",
    number: 5,
    title: "Fifth Commandment",
    commandmentText: "You shall not kill.",
    sins: [
      { id: "c5-1", text: "Have I harbored deep-seated anger, hatred, bitterness, or a desire for physical/emotional revenge against anyone?", gravity: "mortal_potential" },
      { id: "c5-2", text: "Have I spoken with malice, engaged in verbal fights, or caused physical injury to another person?", gravity: "mortal_potential" },
      { id: "c5-3", text: "Have I intentionally induced or assisted in an abortion, or encouraged/supported someone in getting one?", gravity: "mortal_potential" },
      { id: "c5-4", text: "Have I run serious physical risks: driving recklessly, driving under the influence, or abusing my body with drugs, vaping, or excessive alcohol?", gravity: "mortal_potential" },
      { id: "c5-5", text: "Have I participated in or caused scandal—actions or words that deliberately led or encouraged someone else to commit sin?", gravity: "mortal_potential" },
      { id: "c5-6", text: "Have I failed to forgive those who have repented, or held onto unforgiveness in my heart?", gravity: "venial" }
    ]
  },
  {
    id: "commandment-6",
    number: 6,
    title: "Sixth Commandment",
    commandmentText: "You shall not commit adultery.",
    sins: [
      { id: "c6-1", text: "Have I committed any impure acts with myself (masturbation) or with someone else outside of Holy Matrimony?", gravity: "mortal_potential" },
      { id: "c6-2", text: "Have I watched pornography, sexually explicit videos, or hovered over indecent photos/magazines?", gravity: "mortal_potential" },
      { id: "c6-3", text: "Have I been unfaithful to my marriage vows in thought, action, or digital flirting?", gravity: "mortal_potential" },
      { id: "c6-4", text: "Have I deliberately engaged in immodest conversations, told crude jokes, or worn immodest clothing that leads others to sin?", gravity: "venial" },
      { id: "c6-5", text: "Have I failed to respect the sacred dignity of my body or the bodies of others?", gravity: "venial" }
    ]
  },
  {
    id: "commandment-7",
    number: 7,
    title: "Seventh Commandment",
    commandmentText: "You shall not steal.",
    sins: [
      { id: "c7-1", text: "Have I stolen money or property belonging to someone else, or assisted others in theft?", gravity: "mortal_potential" },
      { id: "c7-2", text: "Have I cheated on tests, schoolwork, tax returns, or business dealings?", gravity: "mortal_potential" },
      { id: "c7-3", text: "Have I wasted my employer's time, or neglected the work for which I am being paid?", gravity: "venial" },
      { id: "c7-4", text: "Have I damaged or vandalized someone else's property without making amends or restoration?", gravity: "venial" },
      { id: "c7-5", text: "Have I been selfish or tight-fisted, refusing to give alms or support to the poor and the Church according to my means?", gravity: "venial" }
    ]
  },
  {
    id: "commandment-8",
    number: 8,
    title: "Eighth Commandment",
    commandmentText: "You shall not bear false witness against your neighbor.",
    sins: [
      { id: "c8-1", text: "Have I told lies to protect my reputation, damage another's reputation, or escape direct consequences?", gravity: "venial" },
      { id: "c8-2", text: "Have I engaged in gossip, backbiting, detraction (revealing someone's true faults without grave reason) or slander (spreading false stories)?", gravity: "mortal_potential" },
      { id: "c8-3", text: "Have I made rash judgments, assuming the worst, or gossiping about the perceived faults of priests, family, or colleagues?", gravity: "venial" },
      { id: "c8-4", text: "Have I broken confidentiality or revealed secrets that I was entrusted to keep?", gravity: "venial" }
    ]
  },
  {
    id: "commandment-9",
    number: 9,
    title: "Ninth Commandment",
    commandmentText: "You shall not covet your neighbor's wife.",
    sins: [
      { id: "c9-1", text: "Have I deliberately nurtured, dwelt on, or consented to impure thoughts, fantasies, or romantic obsessions with someone else?", gravity: "mortal_potential" },
      { id: "c9-2", text: "Have I looked at others with lust, objectifying them rather than seeing them as a child of God?", gravity: "venial" },
      { id: "c9-3", text: "Have I failed to guard my eyes and heart when browsing media, movies, or the internet?", gravity: "venial" }
    ]
  },
  {
    id: "commandment-10",
    number: 10,
    title: "Tenth Commandment",
    commandmentText: "You shall not covet your neighbor's goods.",
    sins: [
      { id: "c10-1", text: "Have I harbored hot resentment, envy, or jealousy toward others for their material success, physical appearance, or spiritual gifts?", gravity: "venial" },
      { id: "c10-2", text: "Have I been excessively greedy, placing my heart's happiness primarily in acquiring material goods and luxury?", gravity: "venial" },
      { id: "c10-3", text: "Have I materialistically trusted more in wealth, insurance, or career status than in God's daily providence?", gravity: "venial" }
    ]
  }
];

const ACTS_OF_CONTRITION = [
  {
    id: "contrition-traditional",
    name: "Traditional Act of Contrition",
    text: "O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, Who art all-good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasions of sin. Amen."
  },
  {
    id: "contrition-modern",
    name: "Modern Act of Contrition",
    text: "My God, I am sorry for my sins with all my heart. In choosing to do wrong and failing to do good, I have sinned against You whom I should love above all things. I firmly intend, with your help, to do penance, to sin no more, and to avoid whatever leads me to sin. Our Savior Jesus Christ suffered and died for us. In his name, my God, have mercy. Amen."
  },
  {
    id: "contrition-short",
    name: "Short Cry for Mercy",
    text: "Lord Jesus Christ, Son of God, have mercy on me, a sinner. Wash away all my iniquities, cleanse me of my stains, and restore my soul to the light of Your grace. Sacred Heart of Jesus, I trust in You. Amen."
  }
];

const CONFESSION_FLOW_STEPS = [
  {
    title: "1. Entrance & Greeting",
    instruction: "Enter the confessional box. You may choose to kneel behind the screen anonymously or sit face-to-face with the priest. Begin by making the Sign of the Cross with the words:",
    quote: '"In the name of the Father, and of the Son, and of the Holy Spirit. Amen."'
  },
  {
    title: "2. The Traditional Opening",
    instruction: "The priest will welcome you. Start your confession by declaring the time since your last confession:",
    quote: '"Bless me, Father, for I have sinned. It has been [days / weeks / months / years] since my last confession."'
  },
  {
    title: "3. Confess Your Sins",
    instruction: "State your sins clearly, along with how many times you committed them (to the best of your memory). Confess mortal sins first. If you unsure, ask the priest for guidance. Conclude with:",
    quote: '"For these and all the sins of my past life, I am heartily sorry and ask for penance and absolution from the Lord."'
  },
  {
    title: "4. Receive Penance & Sacred Advice",
    instruction: "The priest will offer spiritual counsel, encouragement, and assign a Penance (e.g., specific prayers, reading Scripture, or a work of charity). Listen attentively."
  },
  {
    title: "5. Recite the Act of Contrition",
    instruction: "The priest will ask you to express your sorrow. Recite your Act of Contrition out loud with sincere intention. You can look at the prayers provided below on this page."
  },
  {
    title: "6. Absolution & Dismissal",
    instruction: "The priest will raise his hand and pronounce the words of Absolution. Answer with sincere faith:",
    quote: '"Amen."',
    extra: "Then he will dismiss you, saying something like, 'Go in peace, your sins are forgiven.' Respond by saying: 'Thank you, Father.'"
  }
];

export function ConfessionPrepTab({ triggerSound }: ConfessionPrepTabProps) {
  // Tab inner navigation: "examine" | "my_list" | "how_to" | "contrition"
  const [innerTab, setInnerTab] = useState<"examine" | "my_list" | "how_to" | "contrition">("examine");
  
  // Expanded state for commandments (map of commandment Id -> boolean)
  const [expandedCommandments, setExpandedCommandments] = useState<{ [id: string]: boolean }>({
    "commandment-1": true
  });

  // Checked sins state
  const [checkedSins, setCheckedSins] = useState<SinsState>(() => {
    try {
      const saved = localStorage.getItem("confession_prep_sins");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Planned next confession date
  const [plannerDate, setPlannerDate] = useState<string>(() => {
    return localStorage.getItem("confession_planned_date") || "";
  });
  
  const [plannerLocation, setPlannerLocation] = useState<string>(() => {
    return localStorage.getItem("confession_planned_location") || "";
  });

  const [notes, setNotes] = useState<string>(() => {
    return localStorage.getItem("confession_prep_notes") || "";
  });

  // Self Examination/Disposition Checklist
  const [dispositions, setDispositions] = useState<{ [key: string]: boolean }>(() => {
    try {
      const saved = localStorage.getItem("confession_dispositions");
      return saved ? JSON.parse(saved) : {
        contrition: false,
        resolution: false,
        forgiveness: false
      };
    } catch {
      return { contrition: false, resolution: false, forgiveness: false };
    }
  });

  // Save sins when checked structure changes
  useEffect(() => {
    localStorage.setItem("confession_prep_sins", JSON.stringify(checkedSins));
  }, [checkedSins]);

  // Save plans
  const savePlannerInfo = (date: string, location: string, customNotes: string) => {
    localStorage.setItem("confession_planned_date", date);
    localStorage.setItem("confession_planned_location", location);
    localStorage.setItem("confession_prep_notes", customNotes);
  };

  // Toggle commandment expand/collapse
  const toggleCommandment = (id: string) => {
    setExpandedCommandments(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
    if (triggerSound) triggerSound();
  };

  // Toggle a sin's checked state
  const toggleSin = (id: string) => {
    setCheckedSins(prev => {
      const newVal = { ...prev, [id]: !prev[id] };
      // Delete false entries to keep storage clean
      if (!newVal[id]) {
        delete newVal[id];
      }
      return newVal;
    });
    if (triggerSound) triggerSound();
  };

  // Toggle disposition item
  const toggleDisposition = (key: string) => {
    setDispositions(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      localStorage.setItem("confession_dispositions", JSON.stringify(updated));
      return updated;
    });
    if (triggerSound) triggerSound();
  };

  // Clear all checked sins
  const resetEverything = () => {
    if (window.confirm("Are you sure you want to clear your current selection of sins and preparation checklist? This is private local data and will be reset completely.")) {
      setCheckedSins({});
      setDispositions({
        contrition: false,
        resolution: false,
        forgiveness: false
      });
      localStorage.removeItem("confession_prep_sins");
      localStorage.removeItem("confession_dispositions");
      if (triggerSound) triggerSound();
    }
  };

  // Resolve checked item count
  const checkedCount = Object.keys(checkedSins).length;

  // Render countdown for planner
  const getDaysRemaining = () => {
    if (!plannerDate) return null;
    const diffTime = new Date(plannerDate).getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "overdue";
    if (diffDays === 0) return "today";
    return diffDays;
  };

  const daysLeft = getDaysRemaining();

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-950 via-[#1b152d] to-stone-950 border border-violet-500/15 p-6 md:p-8 shadow-2xl">
        {/* Archival Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-violet-500/10 to-transparent pointer-events-none rounded-full blur-2xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-violet-500/20 to-violet-600/5 p-3 rounded-2xl text-violet-300 border border-violet-500/30 shadow-inner shrink-0 scale-105">
              <ClipboardCheck className="h-6 w-6 stroke-[1.8]" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-violet-400 uppercase font-black block mb-1.5">
                Sacrament of Reconciliation
              </span>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-stone-100 tracking-wider">
                Confession Preparation
              </h2>
              <p className="text-xs text-stone-400 mt-1 max-w-xl font-sans leading-relaxed">
                "Receive that peace of mind which stems from absolute reconciliation with God, enabling a steady return to a pure life of charity and virtue."
              </p>
            </div>
          </div>

          {/* Sins Checked Counter Badge */}
          <button
            onClick={() => setInnerTab("my_list")}
            className="flex items-center gap-3 bg-violet-900/20 hover:bg-violet-900/30 border border-violet-500/25 px-4.5 py-3 rounded-2xl group transition-all text-left cursor-pointer"
          >
            <div className={`p-2 rounded-lg bg-violet-500/20 text-violet-300 transition-transform group-hover:scale-105`}>
              <Check className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="text-[10px] font-mono text-violet-400 uppercase font-bold">Selected Sins</div>
              <div className="text-lg font-heading font-black text-stone-100">
                {checkedCount === 0 ? "None" : `${checkedCount} Items`}
              </div>
            </div>
          </button>
        </div>

        {/* Private Local Info Note */}
        <div className="mt-5 pt-4 border-t border-violet-500/10 flex items-center gap-2 text-[10px] text-stone-400 font-mono">
          <ShieldCheck className="h-3.5 w-3.5 text-violet-400" />
          <span>This preparation data is stored <strong>completely on your own device</strong> (localStorage). No data is sent to external servers.</span>
        </div>
      </div>

      {/* INNER TABS NAVIGATION */}
      <div className="flex items-center justify-start border-b border-stone-200 dark:border-stone-850/80 gap-1.5 overflow-x-auto scrollbar-none pb-2">
        {[
          { id: "examine", label: "1. Examination of Conscience", icon: ClipboardCheck },
          { id: "my_list", label: "2. My Selected Sins List", icon: CheckCircle2 },
          { id: "how_to", label: "3. Step-by-Step Guide", icon: Info },
          { id: "contrition", label: "4. Act of Contrition Cards", icon: Heart }
        ].map(tab => {
          const TabIcon = tab.icon;
          const isActive = innerTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setInnerTab(tab.id as any);
                if (triggerSound) triggerSound();
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border-none shrink-0 relative ${
                isActive 
                  ? "text-violet-400 bg-violet-500/5 shadow-xs" 
                  : "text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-105"
              }`}
            >
              <TabIcon className={`h-4 w-4 ${isActive ? "text-violet-400 stroke-[2]" : "text-stone-400 dark:text-stone-500"}`} />
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-[-10px] left-0 right-0 h-0.5 bg-violet-500 rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* MAIN VIEW CONTENTS */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* CENTER ELEMENT: DYNAMIC INNER PANELS */}
        <div className="xl:col-span-8 space-y-6">

          {/* INNER TAB 1: EXAMINATION OF CONSCIENCE */}
          {innerTab === "examine" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-black text-stone-900 dark:text-stone-105 text-sm uppercase tracking-wider">
                    The Ten Commandments Examination
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    Click each Commandment block to expand the detailed checklist, and select items you wish to confess.
                  </p>
                </div>
                {checkedCount > 0 && (
                  <button
                    onClick={resetEverything}
                    className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 text-rose-600 hover:text-rose-700 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-all border border-rose-500/10 font-mono font-bold"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset List
                  </button>
                )}
              </div>

              {/* Commandments Accordions */}
              <div className="flex flex-col gap-3">
                {COMMANDMENTS_GUIDE.map((cmd) => {
                  const isExpanded = !!expandedCommandments[cmd.id];
                  const commandmentSins = cmd.sins;
                  const activeInCommandment = commandmentSins.filter(s => checkedSins[s.id]).length;

                  return (
                    <div 
                      key={cmd.id}
                      className={`border rounded-2xl overflow-hidden transition-all duration-200 ${
                        isExpanded 
                          ? "border-violet-500/25 bg-white dark:bg-[#151224] shadow-md" 
                          : "border-stone-200 dark:border-stone-850 bg-stone-50/50 hover:bg-stone-50 dark:bg-stone-950/20 dark:hover:bg-stone-950/45"
                      }`}
                    >
                      {/* Accordion Trigger Header */}
                      <button
                        onClick={() => toggleCommandment(cmd.id)}
                        className="w-full flex items-center justify-between p-4 cursor-pointer text-left focus:outline-none"
                      >
                        <div className="flex items-start gap-3.5 pr-4">
                          <div className={`mt-0.5 shrink-0 flex items-center justify-center font-heading text-xs font-black min-w-[24px] h-[24px] rounded-lg border ${
                            isExpanded 
                              ? "bg-violet-500/10 text-violet-400 border-violet-500/30" 
                              : "bg-stone-100 dark:bg-stone-900 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-800"
                          }`}>
                            {cmd.number}
                          </div>
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="font-heading font-bold text-stone-850 dark:text-stone-150 text-sm">
                                {cmd.title}
                              </h4>
                              {activeInCommandment > 0 && (
                                <span className="bg-violet-500/15 text-violet-400 border border-violet-500/10 text-[9px] px-2 py-0.5 rounded-full font-mono font-bold">
                                  {activeInCommandment} Selected
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] font-sans italic text-stone-500 dark:text-stone-400 mt-1 max-w-xl">
                              "{cmd.commandmentText}"
                            </p>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="h-4.5 w-4.5 text-stone-400 dark:text-stone-600 shrink-0" />
                        ) : (
                          <ChevronDown className="h-4.5 w-4.5 text-stone-400 dark:text-stone-600 shrink-0" />
                        )}
                      </button>

                      {/* Content Section */}
                      {isExpanded && (
                        <div className="px-4 pb-4.5 border-t border-stone-200/50 dark:border-stone-800/40 pt-3 animate-slideDown">
                          <div className="flex flex-col gap-2">
                            {commandmentSins.map((sin) => {
                              const isChecked = !!checkedSins[sin.id];
                              return (
                                <label
                                  key={sin.id}
                                  className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                                    isChecked 
                                      ? "bg-violet-500/[0.04] dark:bg-violet-500/[0.02] border-violet-500/25 text-stone-850 dark:text-stone-150" 
                                      : "bg-white dark:bg-stone-950/20 border-transparent text-stone-650 hover:text-stone-850 dark:text-stone-400 dark:hover:text-stone-200 hover:bg-stone-50/50 dark:hover:bg-stone-900/30"
                                  }`}
                                >
                                  {/* Checkbox Core */}
                                  <div className="relative mt-0.5 flex-shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={() => toggleSin(sin.id)}
                                      className="sr-only"
                                    />
                                    <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                                      isChecked 
                                        ? "bg-violet-500 border-violet-500 text-stone-950" 
                                        : "border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950"
                                    }`}>
                                      {isChecked && <Check className="h-3 w-3 text-white dark:text-stone-950 stroke-[3]" />}
                                    </div>
                                  </div>

                                  <div className="flex-1">
                                    <span className="leading-relaxed block">{sin.text}</span>
                                    {sin.gravity === "mortal_potential" && (
                                      <span className="inline-flex items-center gap-1 mt-1 font-mono text-[9px] uppercase font-bold text-amber-600/90 dark:text-amber-500/80">
                                        <AlertCircle className="h-2.5 w-2.5" />
                                        Mortal Potential
                                      </span>
                                    )}
                                  </div>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* INNER TAB 2: MY SELECTED SINS LIST */}
          {innerTab === "my_list" && (
            <div className="space-y-6">
              
              {/* Contrition & Heart Disposition Checklist */}
              <div className="bg-[#fcfaf4] dark:bg-[#12101e] border border-amber-500/15 rounded-2xl p-5 shadow-xs relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/[0.02] to-transparent pointer-events-none" />
                <h4 className="flex items-center gap-2 font-heading font-black text-stone-900 dark:text-stone-105 text-xs tracking-widest uppercase mb-1.5">
                  <Heart className="h-4 w-4 text-amber-500" />
                  Disposition of the Heart
                </h4>
                <p className="text-[11px] text-stone-500 dark:text-stone-400 font-sans leading-relaxed mb-4">
                  Sincere Confession requires continuous spiritual readiness. Reflect on these three interior steps before entering:
                </p>

                <div className="flex flex-col gap-3">
                  {[
                    {
                      key: "contrition",
                      title: "1. Sincere Contrition",
                      desc: "Do I possess genuine sorrow for having sinned, not just fear of punishment, but out of love for God who is all goodness?"
                    },
                    {
                      key: "resolution",
                      title: "2. Firm Purpose of Amendment",
                      desc: "Am I truly resolved, with the grace of the Holy Spirit, to take concrete actions to avoid these sins and their near occasions in the future?"
                    },
                    {
                      key: "forgiveness",
                      title: "3. Absolute Reconciliation",
                      desc: "Have I forgiven those who have hurt, gossiped, or offended me? Confession requires a heart willing to forgive others."
                    }
                  ].map(item => {
                    const checked = !!dispositions[item.key];
                    return (
                      <label 
                        key={item.key}
                        className={`flex items-start gap-3 p-3 rounded-xl border text-xs cursor-pointer select-none transition-all ${
                          checked 
                            ? "bg-amber-500/[0.04] border-amber-500/25 text-stone-900 dark:text-stone-100" 
                            : "bg-white dark:bg-stone-950/20 border-transparent text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/10"
                        }`}
                      >
                        <div className="mt-0.5 flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDisposition(item.key)}
                            className="sr-only"
                          />
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all ${
                            checked 
                              ? "bg-amber-500 border-amber-500 text-stone-950" 
                              : "border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-950"
                          }`}>
                            {checked && <Check className="h-2.5 w-2.5 text-stone-950 stroke-[3.5]" />}
                          </div>
                        </div>
                        <div>
                          <span className="font-heading font-bold text-xs text-stone-850 dark:text-stone-150 block mb-0.5">{item.title}</span>
                          <p className="text-[10.5px] text-stone-500 dark:text-stone-400 font-sans leading-relaxed">{item.desc}</p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Your Personal Compilation of Selected Sins */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-heading font-black text-stone-900 dark:text-stone-105 text-sm uppercase tracking-wider">
                      Your Confession Checklist
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                      Review your private checked sins. You can bring this secure list in your mind when preparing for the Sacrament.
                    </p>
                  </div>
                  {checkedCount > 0 && (
                    <button
                      onClick={resetEverything}
                      className="flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 text-rose-600 hover:text-rose-700 bg-rose-500/5 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-all border border-rose-500/10 font-mono font-bold"
                    >
                      <Trash className="h-3 w-3" />
                      Clear List
                    </button>
                  )}
                </div>

                {checkedCount === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-stone-200 dark:border-stone-850 rounded-2xl bg-stone-50/50 dark:bg-stone-950/25">
                    <div className="bg-violet-500/10 text-violet-400 p-3.5 rounded-full mb-3 shadow-inner">
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <span className="font-heading font-bold text-stone-800 dark:text-stone-200 text-sm block">
                      No Sins Selected Yet
                    </span>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-xs leading-relaxed">
                      Go to the <strong className="text-violet-400">Examination of Conscience</strong> tab to select the items you would like to prepare.
                    </p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-[#151224] border border-stone-200 dark:border-stone-850/80 rounded-2xl p-4 md:p-6 space-y-4.5 shadow-sm">
                    {COMMANDMENTS_GUIDE.map(cmd => {
                      const selectedInCmd = cmd.sins.filter(sin => checkedSins[sin.id]);
                      if (selectedInCmd.length === 0) return null;

                      return (
                        <div key={cmd.id} className="pb-4 border-b border-stone-200/50 dark:border-stone-800/30 last:border-0 last:pb-0">
                          <div className="flex items-center gap-1.5 mb-2">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-500/10 text-violet-400 font-bold">
                              Cmd {cmd.number}
                            </span>
                            <span className="text-xs font-heading font-extrabold text-stone-700 dark:text-stone-300">
                              {cmd.title}
                            </span>
                          </div>
                          
                          <div className="flex flex-col gap-2 pl-3">
                            {selectedInCmd.map(sin => (
                              <div 
                                key={sin.id} 
                                className="flex items-start gap-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed md:pl-2"
                              >
                                <span className="text-amber-500 mt-0.5 shrink-0">•</span>
                                <div className="flex-1">
                                  <span>{sin.text}</span>
                                  {sin.gravity === "mortal_potential" && (
                                    <span className="inline-block border border-amber-500/15 bg-amber-500/[0.03] text-amber-600 dark:text-amber-500 text-[8.5px] px-1.5 py-0.3 rounded ml-2.5 font-mono">
                                      Mortal Potential
                                    </span>
                                  )}
                                </div>
                                <button
                                  onClick={() => toggleSin(sin.id)}
                                  className="text-stone-400 hover:text-rose-500 p-0.5 rounded cursor-pointer transition-colors"
                                  title="Remove from preparation checklist"
                                >
                                  <Trash className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}

                    {/* Sins checklist completed visual note */}
                    <div className="bg-emerald-500/[0.02] border border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-2.5 text-xs">
                      <ShieldCheck className="h-4.5 w-4.5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-heading font-bold text-stone-850 dark:text-stone-150 block mb-0.5">
                          Private Mind Check
                        </span>
                        <p className="text-stone-500 dark:text-stone-400 font-sans leading-relaxed text-[11px]">
                          Take this compiled list into prayer, seeking perfect contrition. Sins are confessed by kind (what type of sin) and estimated frequency. God is already waiting with absolute healing mercy.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* INNER TAB 3: STEP-BY-STEP GUIDE */}
          {innerTab === "how_to" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading font-black text-stone-900 dark:text-stone-105 text-sm uppercase tracking-wider">
                  How to make a Good Confession
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  If it has been a long time, do not be afraid. The priest or caretaker is always delighted to assist. Below is the traditional step-by-step guideline.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {CONFESSION_FLOW_STEPS.map((step, idx) => (
                  <div 
                    key={idx}
                    className="bg-white dark:bg-[#151224] border border-stone-200 dark:border-stone-850/80 rounded-2xl p-5 shadow-xs space-y-3 flex flex-col justify-between"
                  >
                    <div>
                      <h4 className="font-heading font-black text-stone-850 dark:text-stone-150 text-xs tracking-wider uppercase flex items-center justify-between border-b border-stone-200/55 dark:border-stone-800/40 pb-2">
                        <span>{step.title}</span>
                        <span className="font-mono text-[10px] text-violet-400 font-bold">Step {idx + 1}</span>
                      </h4>
                      <p className="text-[11px] leading-relaxed text-stone-500 dark:text-stone-400 mt-2.5 font-sans">
                        {step.instruction}
                      </p>
                    </div>

                    {step.quote && (
                      <div className="bg-stone-50 dark:bg-stone-950 p-3 rounded-xl border border-stone-200/45 dark:border-stone-800/40 mt-1">
                        <p className="font-mono text-xs text-orange-600 dark:text-amber-450 italic leading-relaxed select-all">
                          {step.quote}
                        </p>
                        {step.extra && (
                          <p className="text-[10px] text-stone-400 dark:text-stone-500 font-sans mt-2">
                            {step.extra}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Liturgical encouragement banner */}
              <div className="bg-gradient-to-br from-violet-500/10 to-transparent border border-violet-500/10 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center gap-5">
                <div className="bg-violet-500/15 text-violet-400 p-3 rounded-xl border border-violet-500/20 shadow-inner">
                  <Sparkles className="h-5 w-5 animate-spin-slow" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-stone-100 text-xs uppercase tracking-wider mb-1">
                    An Encounter With Divine Love
                  </h4>
                  <p className="text-xs text-stone-400 font-sans leading-relaxed max-w-xl">
                    "Confession is not a courtroom; it is a spiritual hospital. Think of it as a soul wash. The priest acts in Persona Christi (in the person of Christ) to wrap you in tender mercy. There is no sin too dark to be dissolved by He who created you."
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* INNER TAB 4: ACT OF CONTRITION CARDS */}
          {innerTab === "contrition" && (
            <div className="space-y-6">
              <div>
                <h3 className="font-heading font-black text-stone-900 dark:text-stone-105 text-sm uppercase tracking-wider">
                  Acts of Contrition
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Choose a traditional or modern version to recite aloud during the sacrament when the priest asks for your act of sorrow.
                </p>
              </div>

              <div className="flex flex-col gap-5">
                {ACTS_OF_CONTRITION.map((prayer) => (
                  <div 
                    key={prayer.id}
                    className="bg-white dark:bg-[#151224] border border-stone-200 dark:border-stone-850/80 rounded-2xl p-6 shadow-sm relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 w-2 h-full bg-violet-500/20 group-hover:bg-violet-400/40 transition-colors" />
                    
                    <div className="flex items-center gap-2 mb-3.5">
                      <div className="bg-violet-500/10 text-violet-400 p-1.5 rounded-lg border border-violet-500/10">
                        <Bookmark className="h-3.5 w-3.5" />
                      </div>
                      <h4 className="font-heading font-black text-stone-850 dark:text-stone-150 text-xs uppercase tracking-widest">
                        {prayer.name}
                      </h4>
                    </div>

                    <p className="font-serif text-sm leading-relaxed text-stone-800 dark:text-stone-200 select-all border-l-2 border-amber-500/30 pl-4 py-1">
                      "{prayer.text}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: RECONCILIATION PLANNER & COUNTDOWN */}
        <div className="xl:col-span-4 space-y-6">
          
          {/* SECURE PLANNER widget */}
          <div className="bg-gradient-to-b from-[#fbf9f4] to-stone-50 dark:from-[#110e1c] dark:to-stone-950/45 border border-violet-500/10 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-violet-500/[0.02] to-transparent pointer-events-none" />
            
            <h4 className="flex items-center gap-2 font-heading font-black text-stone-900 dark:text-stone-105 text-xs tracking-widest uppercase mb-1.5">
              <Calendar className="h-4 w-4 text-violet-400" />
              Sacrament Planner
            </h4>
            <p className="text-[10.5px] text-stone-500 dark:text-stone-400 font-sans leading-relaxed mb-4">
              Regular monthly Confession preserves deep clarity. Schedule your next planned time below.
            </p>

            <div className="space-y-3.5">
              {/* Planned Date input */}
              <div>
                <label className="block text-[9px] font-mono uppercase font-bold text-stone-500 dark:text-stone-400 mb-1">
                  Target Date / Time
                </label>
                <input
                  type="datetime-local"
                  value={plannerDate}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPlannerDate(val);
                    savePlannerInfo(val, plannerLocation, notes);
                    if (triggerSound) triggerSound();
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 font-mono text-stone-800 dark:text-stone-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Planned Location input */}
              <div>
                <label className="block text-[9px] font-mono uppercase font-bold text-stone-500 dark:text-stone-400 mb-1">
                  Parish Church / Location
                </label>
                <input
                  type="text"
                  placeholder="e.g. St. Mary's Cathedral"
                  value={plannerLocation}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPlannerLocation(val);
                    savePlannerInfo(plannerDate, val, notes);
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 font-sans text-stone-800 dark:text-stone-100 focus:outline-none focus:border-violet-500"
                />
              </div>

              {/* Secure note notepad */}
              <div>
                <label className="block text-[9px] font-mono uppercase font-bold text-stone-500 dark:text-stone-400 mb-1 flex items-center justify-between">
                  <span>Confession Notepad</span>
                  <span className="text-stone-400 text-[8.5px] font-normal lowercase italic">Private offline memo</span>
                </label>
                <textarea
                  placeholder="e.g. Remember to bring Penance books..."
                  rows={3}
                  value={notes}
                  onChange={(e) => {
                    const val = e.target.value;
                    setNotes(val);
                    savePlannerInfo(plannerDate, plannerLocation, val);
                  }}
                  className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 font-sans text-stone-800 dark:text-stone-100 focus:outline-none focus:border-violet-500 resize-none whitespace-pre-wrap"
                />
              </div>
            </div>

            {/* Countdown Badge display */}
            {plannerDate && (
              <div className="mt-4 pt-4 border-t border-violet-500/10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase text-stone-500 dark:text-stone-400">Time to sacrament:</span>
                  {daysLeft === "overdue" ? (
                    <span className="bg-rose-500/15 border border-rose-500/20 text-rose-600 dark:text-rose-400 font-mono text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full">
                      Past Planned Time
                    </span>
                  ) : daysLeft === "today" ? (
                    <span className="bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-450 font-mono text-[9px] uppercase font-black px-2.5 py-0.5 rounded-full animate-pulse">
                      Today
                    </span>
                  ) : (
                    <span className="bg-violet-500/15 border border-violet-500/20 text-violet-600 dark:text-violet-400 font-mono text-[9.5px] uppercase font-bold px-3 py-0.6 rounded-full flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {daysLeft} {daysLeft === 1 ? "day" : "days"} remaining
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SPIRITUAL STAGES CARD */}
          <div className="bg-white dark:bg-[#12101e] border border-stone-200 dark:border-stone-850/80 rounded-2xl p-5 shadow-xs relative overflow-hidden">
            <h4 className="font-heading font-black text-stone-900 dark:text-stone-105 text-xs tracking-widest uppercase mb-3 text-center border-b border-stone-100 dark:border-stone-800 pb-2.5">
              The Five Steps
            </h4>
            
            <div className="flex flex-col gap-3">
              {[
                { step: "I", title: "Examination of Conscience", body: "Recall honestly all committed sins since last Confession." },
                { step: "II", title: "Sorrow for Sins", body: "Possess supernatural regret out of love for a merciful Father." },
                { step: "III", title: "Firm Purpose of Amendment", body: "Direct resolution not to sin and stay clear of tempational zones." },
                { step: "IV", title: "Honest Confession", body: "Recite sins sincerely to the ordained priest inside the box." },
                { step: "V", title: "Performance of Penance", body: "Fulfill the spiritual prayers or repairs quickly with love." }
              ].map(st => (
                <div key={st.step} className="flex gap-3">
                  <div className="font-heading text-xs font-black min-w-[20px] max-h-[20px] rounded-md bg-stone-100 dark:bg-stone-900 flex items-center justify-center text-amber-500 border border-stone-200/50 dark:border-stone-850">
                    {st.step}
                  </div>
                  <div>
                    <span className="font-heading font-bold text-[11px] text-stone-800 dark:text-stone-200 block">
                      {st.title}
                    </span>
                    <p className="text-[10px] text-stone-500 dark:text-stone-400 leading-relaxed font-sans mt-0.5">
                      {st.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
