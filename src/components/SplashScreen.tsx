/**
 * SplashScreen — shown once on cold launch for ~2.5s, then fades out.
 * Drop this into App.tsx: wrap root content with it and pass onComplete.
 *
 * Usage in App.tsx:
 *   const [splashDone, setSplashDone] = useState(false);
 *   if (!splashDone) return <SplashScreen onComplete={() => setSplashDone(true)} />;
 */
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface Props {
  onComplete: () => void;
}

const QUOTES = [
  { text: "Ora et Labora", sub: "Pray and Work — St. Benedict" },
  { text: "Fiat Voluntas Tua", sub: "Thy will be done — Matthew 6:10" },
  { text: "Soli Deo Gloria", sub: "Glory to God alone" },
];

export function SplashScreen({ onComplete }: Props) {
  const [visible, setVisible] = useState(true);
  const quote = QUOTES[new Date().getDay() % QUOTES.length];

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 600);
    }, 2400);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "#0b090f",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 0,
          }}
        >
          {/* Ambient glow */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse at 50% 45%, rgba(212,175,55,0.07) 0%, transparent 65%)",
            pointerEvents: "none",
          }} />

          {/* Cross icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ marginBottom: 28 }}
          >
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="32" cy="32" r="30" stroke="#d4af37" strokeWidth="0.75" opacity={0.3} />
              <rect x="28" y="8" width="8" height="48" rx="2" fill="#d4af37" />
              <rect x="12" y="22" width="40" height="8" rx="2" fill="#d4af37" />
              <rect x="30" y="8" width="3" height="48" rx="1" fill="#e5c353" opacity={0.5} />
              <rect x="12" y="24" width="40" height="3" rx="1" fill="#e5c353" opacity={0.5} />
            </svg>
          </motion.div>

          {/* App name */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            style={{
              fontFamily: "'Cinzel', serif",
              fontSize: 22,
              fontWeight: 600,
              color: "#f0ede6",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Catholic Prayer
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0, opacity: 0 }}
            animate={{ scaleX: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.45, ease: "easeOut" }}
            style={{
              width: 120,
              height: 1,
              background: "linear-gradient(90deg, transparent, #d4af37, transparent)",
              marginBottom: 16,
            }}
          />

          {/* Latin quote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.65 }}
            style={{ textAlign: "center" }}
          >
            <div style={{
              fontFamily: "'Cormorant Garant', serif",
              fontStyle: "italic",
              fontSize: 15,
              color: "#d4af37",
              marginBottom: 4,
            }}>
              {quote.text}
            </div>
            <div style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: 11,
              color: "rgba(240,237,230,0.4)",
              letterSpacing: "0.08em",
            }}>
              {quote.sub}
            </div>
          </motion.div>

          {/* Bottom loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            style={{
              position: "absolute",
              bottom: 56,
              display: "flex",
              gap: 6,
            }}
          >
            {[0, 1, 2].map(i => (
              <motion.div
                key={i}
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: "50%",
                  background: "#d4af37",
                }}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
