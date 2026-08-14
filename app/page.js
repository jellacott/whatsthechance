'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [denominator, setDenominator] = useState(null);
  const [displayValue, setDisplayValue] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showPercentage, setShowPercentage] = useState(false);

  useEffect(() => {
    if (!denominator) return;

    let start = 1;
    const duration = 1200;
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

  const getPercentageString = (val) => {
    if (!val) return '0%';
    const pct = (1 / val) * 100;
    
    if (pct < 0.0001) {
      return `${pct.toExponential(4)}%`;
    }
    return `${pct.toFixed(6).replace(/\.?0+$/, '')}%`;
  };

  return (
    <main className="min-h-screen bg-[#1e1e1e] text-white flex flex-col items-center justify-center p-6 font-semibold">
      {/* Animated gradient stroke matching rounded corners perfectly */}
      <style jsx global>{`
        @keyframes border-glow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .loading-border {
          position: relative;
          border-radius: 1rem;
          padding: 2px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6);
          background-size: 300% 300%;
          animation: border-glow 2s linear infinite;
        }
        .loading-inner {
          position: relative;
          z-index: 1;
          background: #18181b;
          border-radius: calc(1rem - 2px);
          overflow: hidden;
        }
      `}</style>

      <div className="w-full max-w-xl text-center space-y-8">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-300">
          whatsthechance
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full">
          <div className={loading ? 'loading-border' : ''}>
            <div className={loading ? 'loading-inner' : 'bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden focus-within:border-zinc-500 transition'}>
              <div className="flex items-center px-4 py-2">
                <span className="text-white font-semibold whitespace-nowrap select-none mr-2">
                  What's the chance
                </span>
                <input
                  type="text"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="I get struck by lightning?"
                  className="w-full bg-transparent py-2.5 text-white focus:outline-none font-semibold placeholder-zinc-500"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="ml-2 px-5 py-2.5 bg-white text-black font-bold rounded-xl hover:bg-zinc-200 transition disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? 'Thinking...' : 'Calculate'}
                </button>
              </div>
            </div>
          </div>
        </form>

        {/* Results */}
        {denominator && (
          <div className="mt-10 animate-fade-in">
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
