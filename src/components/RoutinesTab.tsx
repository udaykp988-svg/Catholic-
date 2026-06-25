import React, { useState, useEffect } from "react";
import { Sun, Sunset, Moon, Sunrise, CheckCircle, Play, Pause, RotateCcw, Award, ChevronRight, Compass, Sparkles } from "lucide-react";

interface RoutinesTabProps {
  onAddStatsPrayer: () => void;
  onNavigateToStories: () => void;
}

interface RoutineStep {
  id: string;
  title: string;
  prayer: string;
  durationSeconds: number;
}

interface RoutineGroup {
  id: string;
  name: string;
  timeOfDay: string;
  description: string;
  icon: any;
  color: string;
  glowColor: string;
  steps: RoutineStep[];
}

const ROUTINE_GROUPS: RoutineGroup[] = [
  {
    id: "morning",
    name: "Morning Praise & Adoration",
    timeOfDay: "06:00 - 09:00",
    description: "Dedicate your first thoughts, actions, and breaths to the Divine Presence.",
    icon: Sunrise,
    color: "amber",
    glowColor: "shadow-amber-500/25 border-amber-200 dark:border-amber-900/45",
    steps: [
      {
        id: "m-1",
        title: "The Sign of the Cross & Silent Breathing",
        prayer: "Begin in absolute silence. Inhale deep peace, exhale worldly concerns. Make the Sign of the Cross: 'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.' Spend 30 seconds resting in His gaze.",
        durationSeconds: 30
      },
      {
        id: "m-2",
        title: "The Traditional Morning Offering",
        prayer: "O Jesus, through the Immaculate Heart of Mary, I offer You my prayers, works, joys, and sufferings of this day, for all the intentions of Your Sacred Heart, in union with the Holy Sacrifice of the Mass throughout the world, for the salvation of souls, the reparation of sins, and the reunion of all Christians. Amen.",
        durationSeconds: 45
      },
      {
        id: "m-3",
        title: "The Jesus Prayer (x3)",
        prayer: "Close your eyes and breathe rhythmically:\n'Lord Jesus Christ, Son of God, have mercy on me, a sinner.'\n'Lord Jesus Christ, Son of God, have mercy on me, a sinner.'\n'Lord Jesus Christ, Son of God, have mercy on me, a sinner.'",
        durationSeconds: 20
      },
      {
        id: "m-4",
        title: "Declaration of Today's Purpose",
        prayer: "Offer today's primary tasks to God. Conclude with:\n'Our Father, Who art in heaven, hallowed be Thy name. Thy kingdom come. Thy will be done, on earth as it is in heaven. Give us this day our daily bread, and forgive us our trespasses, as we forgive those who trespass against us. And lead us not into temptation, but deliver us from evil. Amen.'",
        durationSeconds: 45
      }
    ]
  },
  {
    id: "midday",
    name: "Midday Angelus & Pause",
    timeOfDay: "12:00 - 13:00",
    description: "Halt the frantic rush of work to evoke Mary's Fiat and center your soul.",
    icon: Sun,
    color: "orange",
    glowColor: "shadow-orange-500/25 border-orange-200 dark:border-orange-950/40",
    steps: [
      {
        id: "mid-1",
        title: "The Angelus Pleading",
        prayer: "V. The Angel of the Lord declared unto Mary. R. And she conceived of the Holy Spirit. (Hail Mary...)\n\nV. Behold the handmaid of the Lord. R. Be it done unto me according to thy word. (Hail Mary...)\n\nV. And the Word was made Flesh. R. And dwelt among us. (Hail Mary...)\n\nV. Pray for us, o holy Mother of God. R. That we may be made worthy of the promises of Christ.",
        durationSeconds: 60
      },
      {
        id: "mid-2",
        title: "Act of Charity & Surrender",
        prayer: "Lord Jesus, I surrender this busy day to You. Guard my tongue from negative reactions, protect my heart from jealousy, and fill me with compassion for the people I work beside. Sanctify my daily labor. Amen.",
        durationSeconds: 30
      }
    ]
  },
  {
    id: "evening",
    name: "Sunset Rosary & Thanksgiving",
    timeOfDay: "17:00 - 19:30",
    description: "Enter the protection of the Marian Mantle. Recite thanksgiving offerings for the day.",
    icon: Sunset,
    color: "rose",
    glowColor: "shadow-rose-500/25 border-rose-200 dark:border-rose-950/40",
    steps: [
      {
        id: "e-1",
        title: "Praise for the Sunset & Protection Pleading",
        prayer: "Lord of the Heavens, as this day's sun descends, we worship Your creative majesty. Grant this household Your divine peace. Saint Michael the Archangel, defend us in battle, be our protection against the wickedness and snares of the devil. Amen.",
        durationSeconds: 40
      },
      {
        id: "e-2",
        title: "Marian Thanksgiving Devotion",
        prayer: "Hail, Holy Queen, Mother of Mercy, our life, our sweetness and our hope! To thee do we cry, poor banished children of Eve. To thee do we send up our sighs, mourning and weeping in this valley of tears! Turn, then, most gracious Advocate, thine eyes of mercy toward us, and after this our exile, show unto us the blessed fruit of thy womb, Jesus. O clement, O loving, O sweet Virgin Mary. Amen.",
        durationSeconds: 50
      },
      {
        id: "e-3",
        title: "Memorare Prayer for Intercession",
        prayer: "Remember, O most gracious Virgin Mary, that never was it known that anyone who fled to thy protection, implored thy help, or sought thine intercession was left unaided. Inspired by this confidence, I fly unto thee, O Virgin of virgins, my Mother. To thee do I come, before thee I stand, sinful and sorrowful. O Mother of the Word Incarnate, despise not my petitions, but in thy mercy hear and answer me. Amen.",
        durationSeconds: 45
      }
    ]
  },
  {
    id: "night",
    name: "Night Examen & Sleep Journey",
    timeOfDay: "21:00 - 23:30",
    description: "Complete an honest Examen, drop all burdens, and transition into Holy Bedtime stories.",
    icon: Moon,
    color: "violet",
    glowColor: "shadow-violet-500/25 border-violet-200 dark:border-violet-950/40",
    steps: [
      {
        id: "n-1",
        title: "The Ignatian Night Examen",
        prayer: "1. Place yourself in the quiet presence of Holy God.\n2. Recall 3 details from today for which you are deeply grateful.\n3. Examine your day's failures: where did you lack charity, courage, or patience?\n4. Ask for Lord's forgiveness: 'I confess to almighty God and to you, my brothers and sisters, that I have greatly sinned...'\n5. Resolve to rise renewed tomorrow.",
        durationSeconds: 90
      },
      {
        id: "n-2",
        title: "The Act of Contrition",
        prayer: "O my God, I am heartily sorry for having offended Thee, and I detest all my sins because of Thy just punishments, but most of all because they offend Thee, my God, Who art all good and deserving of all my love. I firmly resolve, with the help of Thy grace, to sin no more and to avoid the near occasions of sin. Amen.",
        durationSeconds: 40
      },
      {
        id: "n-3",
        title: "Burden Release & Transition",
        prayer: "Surrender your sleep to God. 'Into Your hands, O Lord, I commend my spirit.' Go gently to sleep. We highly recommend playing a peaceful **Sleep Bible Story** now to companion your repose.",
        durationSeconds: 30
      }
    ]
  }
];

export function RoutinesTab({ onAddStatsPrayer, onNavigateToStories }: RoutinesTabProps) {
  const [selectedGroupId, setSelectedGroupId] = useState<string>("morning");
  const [completedStepIds, setCompletedStepIds] = useState<Record<string, boolean>>({});
  const [activeStepIdx, setActiveStepIdx] = useState<number>(0);
  
  // Custom interactive stopwatch/countdown logic
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [timerRunning, setTimerRunning] = useState<boolean>(false);

  const selectedGroup = ROUTINE_GROUPS.find(g => g.id === selectedGroupId) || ROUTINE_GROUPS[0];
  const steps = selectedGroup.steps;
  const currentStep = steps[activeStepIdx] || steps[0];

  // Sync Timer time whenever step changes
  useEffect(() => {
    setTimeLeft(currentStep.durationSeconds);
    setTimerRunning(false);
  }, [activeStepIdx, selectedGroupId]);

  // Handle timer ticks
  useEffect(() => {
    let timer: any = null;
    if (timerRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerRunning) {
      setTimerRunning(false);
      // Auto complete step!
      const stepId = currentStep.id;
      setCompletedStepIds(prev => ({
        ...prev,
        [stepId]: true
      }));
    }
    return () => clearInterval(timer);
  }, [timerRunning, timeLeft, currentStep]);

  const handleToggleStepCheckbox = (stepId: string) => {
    setCompletedStepIds(prev => ({
      ...prev,
      [stepId]: !prev[stepId]
    }));
  };

  const handleNextStep = () => {
    if (activeStepIdx < steps.length - 1) {
      setActiveStepIdx(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    if (activeStepIdx > 0) {
      setActiveStepIdx(prev => prev - 1);
    }
  };

  const handleRestartTimer = () => {
    setTimeLeft(currentStep.durationSeconds);
    setTimerRunning(false);
  };

  const handleCompleteEntireRoutine = () => {
    // Check all steps in current group
    const updatedCompleted = { ...completedStepIds };
    steps.forEach(step => {
      updatedCompleted[step.id] = true;
    });
    setCompletedStepIds(updatedCompleted);
    setTimerRunning(false);
    
    // Fire event to fuel the prayer counter
    onAddStatsPrayer();
  };

  const isGroupFullyCompleted = steps.every(step => completedStepIds[step.id]);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Intro Bannered Glass */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-850/80 rounded-2xl p-6 shadow-xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-44 h-44 rounded-full bg-gradient-to-br from-amber-500/10 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -bottom-2 -left-2 text-[120px] font-serif text-stone-200/10 dark:text-stone-800/15 pointer-events-none select-none font-bold">†</div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start gap-4">
            <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 p-3 rounded-2xl text-amber-500 dark:text-amber-400 mt-1 shadow-inner border border-amber-500/20">
              <Compass className="h-6 w-6 stroke-[1.5]" />
            </div>
            <div>
              <span className="text-[10px] font-mono tracking-widest text-amber-600 dark:text-amber-400 font-bold uppercase block mb-1">
                Sacred Sanctum Liturgy
              </span>
              <h3 className="text-xl font-heading font-semibold text-stone-900 dark:text-stone-50 tracking-wide">
                Daily Liturgical Routines
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                Nourish a systematic, prayer-filled lifestyle. Align your mornings, middays, evenings, and nights with divine grace. Complete an entire routine to fuel your daily streak lamp.
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-950 px-4 py-2 rounded-xl text-xs font-mono font-semibold text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-stone-850 self-start md:self-auto shadow-sm">
            <Award className="h-4 w-4 text-amber-500 fill-current animate-pulse shrink-0" />
            <span className="tracking-widest uppercase">ROUTINES HARMONY</span>
          </div>
        </div>
      </div>

      {/* Routine Selectors Board Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {ROUTINE_GROUPS.map(group => {
          const GroupIcon = group.icon;
          const isSelected = selectedGroupId === group.id;
          const completedCount = group.steps.filter(s => completedStepIds[s.id]).length;
          const totalSteps = group.steps.length;
          const isDone = completedCount === totalSteps;

          let colorStyles = "";
          if (group.id === "morning") colorStyles = isSelected ? "bg-stone-900 dark:bg-stone-900 text-amber-500 dark:text-amber-400 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30" : "hover:bg-amber-500/5 hover:border-amber-500/20";
          if (group.id === "midday") colorStyles = isSelected ? "bg-stone-900 dark:bg-stone-900 text-amber-500 dark:text-amber-400 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30" : "hover:bg-orange-500/5 hover:border-orange-500/20";
          if (group.id === "evening") colorStyles = isSelected ? "bg-stone-900 dark:bg-stone-900 text-amber-500 dark:text-amber-400 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30" : "hover:bg-rose-500/5 hover:border-rose-500/20";
          if (group.id === "night") colorStyles = isSelected ? "bg-stone-900 dark:bg-stone-900 text-amber-500 dark:text-amber-400 border-amber-500/60 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500/30" : "hover:bg-violet-500/5 hover:border-violet-500/20";

          return (
            <button
              key={group.id}
              onClick={() => {
                setSelectedGroupId(group.id);
                setActiveStepIdx(0);
              }}
              className={`p-4 rounded-2xl border text-left transition-all relative flex flex-col justify-between h-34 cursor-pointer overflow-hidden ${
                isSelected 
                  ? "scale-[1.02] font-bold" 
                  : "border-stone-200 dark:border-stone-850 bg-white dark:bg-stone-950 text-stone-800 dark:text-stone-300"
              } ${colorStyles}`}
            >
              <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-amber-500/5 to-transparent pointer-events-none" />
              <div className="flex justify-between items-start w-full relative z-10">
                <div className={`p-2 rounded-xl transition-colors ${isSelected ? "bg-amber-500/10 border border-amber-500/30 text-amber-500" : "bg-stone-50 dark:bg-stone-900 border border-stone-150 dark:border-stone-800"}`}>
                  <GroupIcon className="h-4.5 w-4.5" />
                </div>
                {isDone ? (
                  <CheckCircle className="h-5 w-5 text-emerald-500 fill-white dark:fill-stone-950" />
                ) : (
                  <span className="text-[10px] font-mono tracking-wider opacity-80 px-2 py-0.5 bg-stone-100 dark:bg-stone-900 rounded-md border border-stone-150 dark:border-stone-800">
                    {completedCount}/{totalSteps}
                  </span>
                )}
              </div>

              <div className="relative z-10">
                <span className="text-sm font-heading tracking-wide block font-semibold">
                  {group.name.split(" ")[0]} <span className="opacity-80 font-normal">{group.name.split(" ").slice(1).join(" ")}</span>
                </span>
                <span className="text-[9px] font-mono opacity-80 block mt-1 tracking-wider text-amber-600 dark:text-amber-450 uppercase">
                  {group.timeOfDay}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Focus Detail Interactive Routine Screen */}
      <div className={`bg-white dark:bg-[#12101b] border border-stone-200 dark:border-stone-850/80 rounded-2xl p-6 relative overflow-hidden transition-all shadow-xl`}>
        
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Left Hand: Step Checklist Navigation */}
          <div className="lg:w-1/3 space-y-3.5 border-b lg:border-b-0 lg:border-r border-stone-100 dark:border-stone-900 pb-5 lg:pb-0 lg:pr-6">
            <div className="mb-4">
              <span className="text-[10px] font-mono text-stone-400 dark:text-stone-500 uppercase tracking-wider block">
                CONVENANT STEPS LIST:
              </span>
              <h4 className="text-sm font-heading font-semibold text-stone-850 dark:text-stone-150">
                {selectedGroup.name}
              </h4>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {steps.map((step, idx) => {
                const isActive = activeStepIdx === idx;
                const isChecked = completedStepIds[step.id] || false;

                return (
                  <div
                    key={step.id}
                    onClick={() => setActiveStepIdx(idx)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      isActive 
                        ? "bg-amber-50/15 dark:bg-amber-950/10 border-amber-500/50 text-stone-950 dark:text-stone-50"
                        : "border-stone-150 dark:border-stone-900 bg-stone-50/40 dark:bg-stone-900/10 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900/50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                      <span className="text-[10px] font-mono font-bold text-stone-400 dark:text-stone-500 self-center shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="text-xs font-sans truncate font-medium">
                        {step.title}
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={isChecked}
                      onClick={(e) => e.stopPropagation()}
                      onChange={() => handleToggleStepCheckbox(step.id)}
                      className="rounded text-amber-600 focus:ring-amber-500 h-4.5 w-4.5 cursor-pointer flex-shrink-0"
                    />
                  </div>
                );
              })}
            </div>

            {isGroupFullyCompleted ? (
              <div className="mt-4 p-3 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 rounded-xl text-xs flex items-center justify-center gap-1.5 font-medium">
                <CheckCircle className="h-4 w-4 shrink-0" />
                No remaining routine duties today!
              </div>
            ) : (
              <button
                onClick={handleCompleteEntireRoutine}
                className="w-full mt-4 py-2.5 px-3 bg-stone-900 hover:bg-stone-850 dark:bg-stone-850 dark:hover:bg-stone-820 text-white hover:text-white dark:text-stone-100 text-xs font-semibold rounded-xl transition-all cursor-pointer border border-stone-800 dark:border-stone-750"
              >
                ✓ Mark Entire Routine Complete
              </button>
            )}
          </div>

          {/* Right Hand: Interactive Stage with prayer guidelines, timer and controls */}
          <div className="lg:w-2/3 flex flex-col justify-between min-h-[300px]">
            
            <div className="space-y-4">
              
              {/* Header Info */}
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-900 pb-3 gap-3">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-mono text-stone-400 uppercase tracking-widest block">
                    STEP {activeStepIdx + 1} OF {steps.length}
                  </span>
                  <h4 className="font-heading font-medium text-base text-stone-900 dark:text-stone-50 flex items-center gap-1.5">
                    {currentStep.title}
                  </h4>
                </div>
                
                {/* Visual Status Indicator Sparkle */}
                {completedStepIds[currentStep.id] ? (
                  <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
                    ✓ DONE
                  </span>
                ) : (
                  <span className="text-[9px] font-mono bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20 px-2.5 py-0.5 rounded-full font-semibold animate-pulse">
                    READY
                  </span>
                )}
              </div>

              {/* Central Text Box */}
              <div className="p-8 rounded-2xl bg-stone-50 dark:bg-stone-900/45 border border-stone-150 dark:border-stone-850/60 leading-relaxed min-h-[190px] flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-tr from-amber-500/[0.03] to-transparent pointer-events-none" />
                <div className="text-amber-500/30 dark:text-amber-500/20 text-center text-[10px] font-mono tracking-widest uppercase mb-4 select-none">
                  ✦ CONTEMPLATION Fiat ✦
                </div>
                <p className="text-sm md:text-base text-stone-800 dark:text-stone-105 text-center italic max-w-lg font-sans select-text whitespace-pre-line leading-relaxed">
                  "{currentStep.prayer}"
                </p>
                <div className="text-stone-300 dark:text-stone-800 text-lg font-serif mt-4 select-none">†</div>
              </div>

              {/* {selectedGroupId === "night" && activeStepIdx === steps.length - 1 && (
                <div className="p-3.5 bg-violet-500/10 border border-violet-500/20 rounded-xl text-xs flex justify-between items-center gap-4">
                  <span className="text-violet-700 dark:text-violet-300 font-sans font-medium">Ready for bed? Play highly soothing Bible Soundscapes.</span>
                  <button
                    onClick={onNavigateToStories}
                    className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 dark:bg-violet-500 dark:hover:bg-violet-440 text-white font-sans text-[11px] font-bold rounded-lg cursor-pointer transition-all shrink-0 flex items-center gap-1.5"
                  >
                    <span>Go to Stories</span> <ChevronRight className="h-3 w-3" />
                  </button>
                </div>
              )} */}
            </div>

            {/* Micro Timer Actions & Page buttons section */}
            <div className="pt-6 border-t border-stone-100 dark:border-stone-900 mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              
              {/* Meditation Stopwatch */}
              <div className="flex items-center gap-3">
                <div className="text-xs font-mono text-stone-500 dark:text-stone-400 font-bold">
                  FOCUS TIMER:
                </div>
                <div className="flex items-center bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-850/80 p-1.5 px-3 rounded-xl gap-2.5">
                  <span className="text-xs font-mono font-bold font-semibold text-stone-800 dark:text-stone-100 min-w-[32px] text-right">
                    {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </span>
                  
                  <div className="h-4 w-px bg-stone-200 dark:bg-stone-800" />
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setTimerRunning(!timerRunning)}
                      className="p-1 text-stone-500 hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer rounded-full transition-colors"
                      title={timerRunning ? "Pause Contemplation" : "Begin Contemplation timer"}
                    >
                      {timerRunning ? <Pause className="h-4 w-4 fill-current text-amber-500" /> : <Play className="h-4 w-4 fill-current text-stone-500" />}
                    </button>
                    <button
                      onClick={handleRestartTimer}
                      className="p-1 text-stone-400 hover:text-red-500 dark:text-stone-550 dark:hover:text-red-400 cursor-pointer rounded-full transition-colors"
                      title="Reset countdown"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Prev / Next controls */}
              <div className="flex items-center gap-2 self-end md:self-auto">
                <button
                  disabled={activeStepIdx === 0}
                  onClick={handlePrevStep}
                  className="px-3.5 py-2 bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-xs font-semibold cursor-pointer text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
                >
                  ◀ Previous
                </button>
                
                {activeStepIdx === steps.length - 1 ? (
                  <button
                    onClick={() => {
                      const stepId = currentStep.id;
                      setCompletedStepIds(prev => ({ ...prev, [stepId]: true }));
                      handleCompleteEntireRoutine();
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-550 dark:hover:bg-emerald-450 text-white dark:text-stone-950 font-sans text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1"
                  >
                    <CheckCircle className="h-3.5 w-3.5" /> Complete Routine
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      // auto mark step checked on Next
                      const stepId = currentStep.id;
                      setCompletedStepIds(prev => ({ ...prev, [stepId]: true }));
                      handleNextStep();
                    }}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 dark:bg-amber-550 dark:hover:bg-amber-450 text-white dark:text-stone-950 font-sans text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Next step</span> <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
