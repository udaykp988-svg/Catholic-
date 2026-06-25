import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, AlertCircle } from "lucide-react";

interface SpeechToTextButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
  placeholder?: string;
}

export function SpeechToTextButton({ onTranscript, className = "", placeholder = "Speak your prayer" }: SpeechToTextButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    try {
      setPermissionError(false);
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          onTranscript(transcript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error", event);
        if (event.error === "not-allowed" || event.error === "service-not-allowed") {
          setPermissionError(true);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  if (!isSupported) {
    return (
      <div className={`relative group inline-block ${className}`}>
        <button
          disabled
          type="button"
          className="p-1.5 rounded-lg text-stone-300 dark:text-stone-700 cursor-not-allowed"
          title="Voice input not supported in this browser"
        >
          <Mic className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={toggleListening}
        className={`p-1.5 rounded-lg transition-all duration-300 relative flex items-center justify-center ${
          isListening 
            ? "bg-red-500/10 text-red-500 ring-2 ring-red-500/30 animate-pulse" 
            : permissionError
            ? "bg-amber-500/10 text-amber-500 ring-1 ring-amber-500/20"
            : "hover:bg-stone-100 dark:hover:bg-stone-900 text-stone-500 dark:text-stone-400 hover:text-amber-500 dark:hover:text-amber-400"
        }`}
        title={isListening ? "Stop listening" : permissionError ? "Microphone permission denied (click to retry or open in new tab)" : "Hands-free voice to text"}
      >
        {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
      </button>

      {/* Mini notification helper for iframe permission issues */}
      {permissionError && (
        <div className="absolute bottom-full right-0 mb-2 w-48 bg-stone-900 text-stone-100 text-[9px] rounded-lg p-2 shadow-xl border border-amber-500/30 z-50">
          <p className="font-sans flex items-center gap-1 font-semibold text-amber-400 mb-0.5">
            <AlertCircle className="h-3.5 w-3.5 inline text-amber-500" /> Mic Permission Needed
          </p>
          <p className="text-[8px] text-stone-300 leading-normal">
            Please allow microphone access. If within a preview iframe, you may need to **open the app in a new tab** via the top right icon to speak your prayers.
          </p>
        </div>
      )}
    </div>
  );
}
