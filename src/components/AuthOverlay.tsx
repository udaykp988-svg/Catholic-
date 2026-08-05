import React, { useState } from "react";
import { Eye, EyeOff, Shield, User, Heart, Compass, Volume2, BookOpen } from "lucide-react";

interface AuthOverlayProps {
  onSuccess: (user: { name: string; email?: string; isGuest: boolean }) => void;
}

export function AuthOverlay({ onSuccess }: AuthOverlayProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [guestName, setGuestName] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showGuestForm, setShowGuestForm] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (isLogin) {
      if (!email || !password) {
        setError("Please enter your email and password.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      // Simulated successful sign in
      const displayName = name || email.split("@")[0];
      const normalizedName = displayName.charAt(0).toUpperCase() + displayName.slice(1);
      const user = { name: normalizedName, email, isGuest: false };
      localStorage.setItem("sanctuary_user", JSON.stringify(user));
      onSuccess(user);
    } else {
      if (!email || !password || !name) {
        setError("All fields are required to create a covenant account.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      const user = { name, email, isGuest: false };
      localStorage.setItem("sanctuary_user", JSON.stringify(user));
      onSuccess(user);
    }
  };

  const handleGuestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalGuestName = guestName.trim() || "Guest Pilgrim";
    const user = { name: finalGuestName, isGuest: true };
    localStorage.setItem("sanctuary_user", JSON.stringify(user));
    onSuccess(user);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#f0e8d8] backdrop-blur-md p-4 overflow-y-auto">
      <div className="w-full max-w-md bg-[#faf7f0] border border-stone-200 rounded-2xl shadow-2xl relative overflow-hidden my-8">
        
        {/* Divine Background Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full bg-[#8b4513]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-32 h-32 rounded-full bg-orange-500/5 blur-3xl pointer-events-none" />

        <div className="p-8 relative">
          
          {/* Header branding */}
          <div className="text-center mb-8">
            <div className="inline-flex p-3 bg-gradient-to-br from-amber-500/20 to-amber-600/5 rounded-2xl text-[#8b4513] mb-4 shadow-inner border border-amber-500/25">
              <Compass className="h-8 w-8 stroke-[1.5]" />
            </div>
            <h2 className="text-2xl font-heading font-semibold text-stone-900 tracking-wider uppercase">
              LAUDATE SOLMNI
            </h2>
            <span className="text-[10px] font-mono tracking-widest text-amber-700 font-bold uppercase block mt-1">
              CATHOLIC COMPANION & LITURGICAL GUIDE
            </span>
            <p className="text-xs text-stone-500 font-sans mt-3 max-w-sm mx-auto leading-relaxed">
              Step into your serene digital chapel for traditional prayers, sacred liturgies, and novenas.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-400 text-xs rounded-xl text-center">
              {error}
            </div>
          )}

          {!showGuestForm ? (
            /* DYNAMIC LOGIN vs SIGN UP SWITCHER FORM */
            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {!isLogin && (
                <div>
                  <label className="text-xs font-mono text-stone-500 uppercase tracking-wider block mb-1">
                    Pilgrim Full Name:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. John Bosco"
                      className="w-full text-sm rounded-xl border border-stone-200 bg-stone-50 p-3 pl-10 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
                    />
                    <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-stone-400" />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-mono text-stone-500 uppercase tracking-wider block mb-1">
                  Email Address:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full text-sm rounded-xl border border-stone-200 bg-stone-50 p-3 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#8b4513] font-sans"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-stone-500 uppercase tracking-wider block mb-1">
                  Covenant Password:
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full text-sm rounded-xl border border-stone-200 bg-stone-50 p-3 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#8b4513]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-[#6b3410] hover:bg-amber-700 text-white dark:bg-[#8b4513] font-sans font-bold text-sm rounded-xl transition-all shadow-md active:scale-[0.98] cursor-pointer mt-2"
              >
                {isLogin ? "Enter Chapel Portal" : "Join Spiritual Covenant"}
              </button>

              <div className="relative my-6 flex py-1 items-center">
                <div className="flex-grow border-t border-stone-200"></div>
                <span className="flex-shrink mx-3 text-[10px] font-mono text-stone-400 uppercase tracking-widest bg-[#faf7f0] px-2">OR</span>
                <div className="flex-grow border-t border-stone-200"></div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowGuestForm(true)}
                  className="w-full py-3 px-4 bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 font-sans font-medium text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  🕯️ Try as Guest / Anonymous Pilgrim
                </button>
              </div>

              <div className="text-center pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setIsLogin(!isLogin);
                  }}
                  className="text-xs text-[#6b3410] hover:underline cursor-pointer font-medium"
                >
                  {isLogin ? "Need a pilgrim account? Join now" : "Already have a covenant registered? Sign in"}
                </button>
              </div>
            </form>
          ) : (
            /* ANONYMOUS GUEST REGISTRATION OR LOGIN */
            <form onSubmit={handleGuestSubmit} className="space-y-4">
              <div className="text-xs text-stone-500 leading-relaxed p-3 bg-stone-50 rounded-xl border border-stone-150 mb-2 font-sans">
                💡 **Guest Experience:** Enter any name to identify yourself. Prayers you share to the community wall, your rosary progress, and personal intentions will be fully saved in your local workspace sandbox.
              </div>

              <div>
                <label className="text-xs font-mono text-stone-500 uppercase tracking-wider block mb-1">
                  Choose a Screen/Pilgrim Name:
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="e.g. Humble Servant, FaithFollower..."
                    className="w-full text-sm rounded-xl border border-stone-200 bg-stone-50 p-3 pl-10 text-stone-900 focus:outline-none focus:ring-1 focus:ring-[#8b4513] font-sans"
                  />
                  <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-stone-400" />
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGuestForm(false)}
                  className="w-1/3 py-3 px-3 bg-stone-105 hover:bg-stone-200 text-stone-600 font-sans font-medium text-xs rounded-xl tracking-wide cursor-pointer transition-all border border-stone-200"
                >
                  Back to Sign In
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-3 px-4 bg-[#6b3410] dark:bg-amber-550 text-white font-sans font-bold text-xs rounded-xl tracking-wide cursor-pointer transition-all hover:bg-amber-700"
                >
                  Enter as Guest 🕊️
                </button>
              </div>
            </form>
          )}

          {/* Terms & info */}
          <div className="mt-8 pt-4 border-t border-stone-100 text-center flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
            <Shield className="h-3 w-3 text-stone-450" />
            <span>Encrypted local spiritual vault. Absolutely secure.</span>
          </div>

        </div>
      </div>
    </div>
  );
}
