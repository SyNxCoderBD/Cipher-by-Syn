import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Unlock,
  Copy,
  Check,
  Share2,
  Trash2,
  Sparkles,
  ArrowRight,
  Code2,
  Info
} from "lucide-react";

// --- Caesar Cipher Logic ---
// English to code (Shift each letter 1 place BACKWARDS in the alphabet)
const encodeText = (text: string): string => {
  return text
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      // Uppercase A-Z: 65 - 90
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 - 1 + 26) % 26) + 65);
      }
      // Lowercase a-z: 97 - 122
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 - 1 + 26) % 26) + 97);
      }
      return char;
    })
    .join("");
};

// Code to English (Shift each letter 1 place FORWARDS in the alphabet)
const decodeText = (text: string): string => {
  return text
    .split("")
    .map((char) => {
      const code = char.charCodeAt(0);
      // Uppercase A-Z: 65 - 90
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + 1) % 26) + 65);
      }
      // Lowercase a-z: 97 - 122
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + 1) % 26) + 97);
      }
      return char;
    })
    .join("");
};

const UPPER_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

export default function App() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [direction, setDirection] = useState<"encode" | "decode">("encode");
  const [autoTranslate, setAutoTranslate] = useState(true);
  
  // Hover visual state for Alphabet Visualizer
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);

  // UI States
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  // Toast auto-dismissal
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
  };

  // Perform translation
  const handleEncode = useCallback(() => {
    setDirection("encode");
    const result = encodeText(input);
    setOutput(result);
    showToast("Encoded (shifted backwards by 1)", "success");
  }, [input]);

  const handleDecode = useCallback(() => {
    setDirection("decode");
    const result = decodeText(input);
    setOutput(result);
    showToast("Decoded (shifted forwards by 1)", "success");
  }, [input]);

  // Auto translate on input change
  useEffect(() => {
    if (autoTranslate) {
      if (direction === "encode") {
        setOutput(encodeText(input));
      } else {
        setOutput(decodeText(input));
      }
    }
  }, [input, direction, autoTranslate]);

  const handleCopy = async (text: string, isInput: boolean) => {
    if (!text) {
      showToast("No text to copy!", "error");
      return;
    }
    try {
      await navigator.clipboard.writeText(text);
      if (isInput) {
        setCopiedInput(true);
        setTimeout(() => setCopiedInput(false), 2000);
      } else {
        setCopiedOutput(true);
        setTimeout(() => setCopiedOutput(false), 2000);
      }
      showToast("Copied to clipboard!", "success");
    } catch (err) {
      showToast("Failed to copy", "error");
    }
  };

  const handlePasteInput = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setInput(text);
        showToast("Pasted from clipboard!", "success");
      }
    } catch (err) {
      showToast("Clipboard permission required to paste", "error");
    }
  };

  const loadDemo = (type: "english" | "code") => {
    if (type === "english") {
      setInput("Meet at the secret location at midnight.");
      setDirection("encode");
      showToast("Loaded English sample text", "info");
    } else {
      setInput("Ldds zs sgd rdbqds knbzshnm zs khcmhfas.");
      setDirection("decode");
      showToast("Loaded Cipher sample text", "info");
    }
  };

  const handleShareIntent = async () => {
    if (!output) {
      showToast("Process some text first before sharing!", "error");
      return;
    }

    const payloadText = output;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Caesar Cipher Shift-1 Message",
          text: payloadText,
        });
        showToast("Shared successfully!", "success");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          showToast("Failed to share via system", "error");
        }
      }
    } else {
      // Fallback: Copy to clipboard if navigator.share is unavailable
      try {
        await navigator.clipboard.writeText(payloadText);
        showToast("Copied result to clipboard!", "success");
      } catch (err) {
        showToast("Sharing not supported on this browser", "error");
      }
    }
  };

  // Determine standard shift output for a custom alphabet card hover
  const getShiftedChar = (char: string): string => {
    const code = char.charCodeAt(0);
    if (code >= 65 && code <= 90) {
      if (direction === "encode") {
        return String.fromCharCode(((code - 65 - 1 + 26) % 26) + 65);
      } else {
        return String.fromCharCode(((code - 65 + 1) % 26) + 65);
      }
    }
    return char;
  };

  return (
    <div className="relative min-h-screen bg-slate-950 overflow-x-hidden selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* Dynamic Floating Glassmorphism Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-gradient-to-br from-indigo-600/20 to-violet-600/5 blur-[50px] md:blur-[120px] pointer-events-none md:animate-float-1 z-0"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tr from-emerald-600/10 to-teal-500/10 blur-[50px] md:blur-[130px] pointer-events-none md:animate-float-2 z-0"></div>
      <div className="absolute top-[40%] left-[35%] w-[300px] h-[300px] rounded-full bg-indigo-500/5 blur-[40px] md:blur-[100px] pointer-events-none z-0"></div>

      {/* Main Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12 min-h-screen flex flex-col justify-between">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl border backdrop-blur-xl shadow-2xl glass-card border-white/10"
            >
              <div className={`w-2 h-2 rounded-full ${
                toast.type === "success" ? "bg-emerald-400 animate-pulse" :
                toast.type === "error" ? "bg-rose-500" : "bg-indigo-400"
              }`} />
              <p className="text-xs font-sans font-medium text-white tracking-wide">{toast.message}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header App Title Area */}
        <header className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card border-white/5 text-xs text-indigo-300 font-mono tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            SECURE CAESAR ALGORITHM • SHIFT DELTA = 1
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-display tracking-tight text-white mb-3">
            Simple Cipher <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">Encoder / Decoder</span>
          </h1>
          
          <p className="max-w-xl mx-auto text-sm sm:text-base text-slate-400 leading-relaxed font-sans">
            Shift each alphabet letter 1 place backwards to encode, or 1 place forwards to decode back to standard English. Styled with an exquisite liquid glass theme.
          </p>
        </header>

        {/* Live Alphabet Mapping Ribbon */}
        <section className="mb-10 max-w-4xl mx-auto w-full">
          <div className="glass-card rounded-2xl border-white/10 p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 font-display">
                  Interactive Cipher Mapping ({direction === "encode" ? "Shift -1" : "Shift +1"})
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-400 flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md">
                <Info className="w-3 h-3 text-indigo-300" />
                Hover letters to visualize shifting
              </div>
            </div>

            {/* Custom Interactive Scroll Tape */}
            <div className="overflow-x-auto custom-scrollbar pb-2">
              <div className="flex items-center gap-1 min-w-[700px] select-none">
                {UPPER_ALPHABET.map((letter) => {
                  const shifted = getShiftedChar(letter);
                  const isHovered = hoveredLetter === letter;
                  return (
                    <div
                      key={letter}
                      onMouseEnter={() => setHoveredLetter(letter)}
                      onMouseLeave={() => setHoveredLetter(null)}
                      className={`flex-1 flex flex-col items-center justify-center py-2.5 rounded-lg border transition-all duration-300 ${
                        isHovered
                          ? "bg-indigo-500/20 border-indigo-500/50 scale-105 shadow-md shadow-indigo-500/10"
                          : "bg-black/25 border-white/5 hover:border-white/20"
                      }`}
                    >
                      <span className="font-mono text-xs font-bold text-white mb-1.5">{letter}</span>
                      <ArrowRight className={`w-3.5 h-3.5 my-0.5 transition-transform duration-300 text-slate-500 ${
                        direction === "encode" ? "text-indigo-400" : "text-emerald-400"
                      }`} />
                      <span className={`font-mono text-xs font-bold mt-1.5 ${
                        direction === "encode" ? "text-indigo-300" : "text-emerald-300"
                      }`}>{shifted}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Main Side-by-Side Area */}
        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 max-w-6xl w-full mx-auto">
          
          {/* INPUT CARD */}
          <div className="glass-card rounded-2xl border-white/10 shadow-2xl p-6 flex flex-col justify-between glow-indigo relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-400/20 opacity-70"></div>
            
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base">Input Source</h3>
                    <p className="text-[10px] text-slate-400 font-sans">Type or load plain or encrypted text</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => loadDemo("english")}
                    className="text-[10px] font-semibold text-indigo-300 hover:text-indigo-200 bg-indigo-500/10 hover:bg-indigo-500/20 px-2.5 py-1 rounded transition-colors"
                  >
                    Demo English
                  </button>
                  <button
                    onClick={() => loadDemo("code")}
                    className="text-[10px] font-semibold text-emerald-300 hover:text-emerald-200 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded transition-colors"
                  >
                    Demo Cipher
                  </button>
                </div>
              </div>

              {/* Textarea Container */}
              <div className="relative mb-4">
                <textarea
                  id="cipher-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Enter text to process here..."
                  className="w-full min-h-[220px] max-h-[350px] rounded-xl p-4 text-sm font-sans text-gray-200 placeholder-slate-500 outline-none glass-input resize-y transition-all custom-scrollbar"
                />
                
                {/* Utilities Inside Input Box */}
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={handlePasteInput}
                    title="Paste from clipboard"
                    className="p-1.5 rounded-md bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 rotate-180" />
                  </button>
                  <button
                    onClick={() => {
                      setInput("");
                      if (!autoTranslate) setOutput("");
                      showToast("Input cleared", "info");
                    }}
                    title="Clear input"
                    className="p-1.5 rounded-md bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-slate-400 hover:text-rose-400 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Counters */}
              <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono mb-4 px-1">
                <div className="flex items-center gap-2">
                  <span>Chars: <strong className="text-indigo-400">{input.length}</strong></span>
                  <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                  <span>Words: <strong className="text-indigo-400">{input.trim() === "" ? 0 : input.trim().split(/\s+/).length}</strong></span>
                </div>
                
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-white transition-colors">
                  <input
                    type="checkbox"
                    checked={autoTranslate}
                    onChange={(e) => setAutoTranslate(e.target.checked)}
                    className="rounded border-white/10 bg-black/40 text-indigo-500 focus:ring-0 w-3 h-3"
                  />
                  <span>Live translate</span>
                </label>
              </div>
            </div>

            {/* Shift Actions */}
            <div className="pt-4 border-t border-white/5 flex flex-col sm:flex-row gap-3">
              <button
                id="btn-encode"
                onClick={handleEncode}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-semibold text-sm transition-all duration-300 ${
                  direction === "encode" && input !== ""
                    ? "bg-white text-black shadow-lg shadow-white/10 border border-white hover:opacity-90"
                    : "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5 hover:border-white/10"
                }`}
              >
                <Lock className="w-4 h-4" />
                Encode Backwards
              </button>
              <button
                id="btn-decode"
                onClick={handleDecode}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-display font-semibold text-sm transition-all duration-300 ${
                  direction === "decode" && input !== ""
                    ? "bg-white text-black shadow-lg shadow-white/10 border border-white hover:opacity-90"
                    : "bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5 hover:border-white/10"
                }`}
              >
                <Unlock className="w-4 h-4" />
                Decode Forwards
              </button>
            </div>
          </div>

          {/* OUTPUT CARD */}
          <div className="glass-card rounded-2xl border-white/10 shadow-2xl p-6 flex flex-col justify-between glow-emerald relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-400/20 opacity-70"></div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <Unlock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white text-base">Output Result</h3>
                    <p className="text-[10px] text-slate-400 font-sans">Copy or share the output results</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(output, false)}
                    className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 px-2.5 py-1.5 rounded-lg transition-all animate-pulse"
                  >
                    {copiedOutput ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    {copiedOutput ? "Copied!" : "Copy Output"}
                  </button>
                </div>
              </div>

              {/* Textarea Container */}
              <div className="relative mb-4">
                <textarea
                  id="cipher-output"
                  readOnly
                  value={output}
                  placeholder="Output will appear here..."
                  className="w-full min-h-[220px] max-h-[350px] rounded-xl p-4 text-sm font-mono text-emerald-300 placeholder-slate-600 outline-none glass-input resize-y transition-all custom-scrollbar bg-black/40"
                />

                {/* Info Watermark/Tag */}
                <div className="absolute bottom-3 left-3 bg-black/50 border border-white/5 backdrop-blur-md rounded-md px-2 py-1 text-[9px] font-mono text-slate-400 select-none">
                  Caesar (Shift {direction === "encode" ? "-1" : "+1"})
                </div>
              </div>

              {/* Counter details */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono mb-4 px-1">
                <span>Output size: <strong className="text-emerald-400">{output.length}</strong> characters</span>
              </div>
            </div>

            {/* Sharing & Copy Utility Footer */}
            <div className="pt-4 border-t border-white/5 flex gap-3">
              <button
                onClick={() => handleCopy(output, false)}
                disabled={!output}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5 hover:border-white/10 font-display font-semibold text-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <Copy className="w-4 h-4 text-slate-400" />
                Copy to Clipboard
              </button>
              
              <button
                onClick={handleShareIntent}
                disabled={!output}
                className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/5 hover:border-white/10 font-display font-semibold text-sm transition-all disabled:opacity-40 disabled:pointer-events-none"
              >
                <Share2 className="w-4 h-4 text-indigo-400" />
                Share Result
              </button>
            </div>
          </div>

        </main>

        {/* Footer info links */}
        <footer className="border-t border-white/5 pt-8 text-center text-[11px] font-sans text-slate-500 space-y-2 max-w-4xl mx-auto w-full">
          <p>
            Cipher rules: A ↔ Z shift | Case-sensitive | Punctuation, spaces and numbers preserved
          </p>
          <p className="font-mono text-slate-600">
            Liquid Glass UI • Powered by Secure Local Processing
          </p>
        </footer>

      </div>
    </div>
  );
}
