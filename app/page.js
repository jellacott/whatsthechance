'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [denominator, setDenominator] = useState(null);
  const [displayValue, setDisplayValue] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPercentage, setShowPercentage] = useState(false);

  // Animated counter effect when a new denominator arrives
  useEffect(() => {
    if (!denominator) return;

    let start = 1;
    const duration = 1200; // 1.2 seconds animation
    const steps = 40;
    const stepTime = duration / steps;
    const increment = (denominator - start) / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= denominator) {
        setDisplayValue(denominator);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [denominator]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || loading) return;

    setLoading(true);
    setDenominator(null);

    try {
      const res = await fetch('/api/chance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.denominator) {
        setDenominator(data.denominator);
      } else {
        setDenominator(1000000);
      }
    } catch (err) {
      console.error(err);
      setDenominator(1000000);
    } finally {
      setLoading(false);
    }
  };

  // Convert "1 in N" into exact percentage string
  const getPercentageString = (val) => {
    if (!val) return '0%';
    const pct = (1 / val) * 100;
    
    if (pct < 0.0001) {
      return `${pct.toExponential(4)}%`;
    }
    return `${pct.toFixed(6).replace(/\.?0+$/, '')}%`;
  };

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-semibold">
      {/* Animated glowing stroke effect styles */}
      <style jsx global>{`
        @keyframes border-glow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .loading-border {
          position: relative;
          background: #111;
          border-radius: 0.75rem;
          padding: 2px;
        }
        .loading-border::before {
          content: '';
          position: absolute;
          inset: -2px;
          border-radius: 0.85rem;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
          background-size: 300% 300%;
          animation: border-glow 2s linear infinite;
          z-index: 0;
        }
        .loading-inner {
          position: relative;
          z-index: 1;
          background: #000;
          border-radius: 0.7rem;
        }
      `}</style>

      <div className="w-full max-w-xl text-center space-y-8">
        {/* Title */}
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
          What's the chance...
        </h1>

        {/* Form with animated border loading state */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className={loading ? 'loading-border' : ''}>
            <div className={loading ? 'loading-inner p-1' : ''}>
              <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden focus-within:border-zinc-500 transition">
                <span className="pl-4 text-zinc-400 font-semibold select-none">
                  What's the chance
                </span>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="I get struck by lightning today?"
                  className="w-full bg-transparent px-3 py-4 text-white focus:outline-none font-semibold placeholder-zinc-600"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="mr-2 px-5 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-zinc-200 transition disabled:opacity-50"
                >
                  {loading ? 'Thinking...' : 'Calculate'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Results Display */}
        {denominator && (
          <div className="mt-10 space-y-2 animate-fade-in">
            <p className="text-zinc-400 text-sm font-semibold">
              Click result to toggle format
            </p>
            <button
              onClick={() => setShowPercentage(!showPercentage)}
              className="text-5xl md:text-7xl font-extrabold tracking-tight text-white hover:text-blue-400 transition-colors cursor-pointer select-none"
            >
              {showPercentage
                ? getPercentageString(displayValue)
                : `1 in ${displayValue.toLocaleString()}`}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
