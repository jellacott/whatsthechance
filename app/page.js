'use client';

import { useState, useRef, useEffect } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultNumber, setResultNumber] = useState(null);
  const [displayNumber, setDisplayNumber] = useState(0);
  const [hasSearched, setHasSearched] = useState(false);
  const inputRef = useRef(null);

  // Number count-up animation
  useEffect(() => {
    if (resultNumber === null) return;

    let start = 0;
    const duration = 1200; // ms
    const startTime = performance.now();

    const animateNumber = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.floor(easeOut * resultNumber);

      setDisplayNumber(currentVal);

      if (progress < 1) {
        requestAnimationFrame(animateNumber);
      } else {
        setDisplayNumber(resultNumber);
      }
    };

    requestAnimationFrame(animateNumber);
  }, [resultNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setHasSearched(true);
    setResultNumber(null);

    try {
      const res = await fetch('/api/chance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });

      const data = await res.json();
      if (res.ok && data.denominator) {
        setResultNumber(data.denominator);
      } else {
        setResultNumber(1000000); // Fallback
      }
    } catch (err) {
      console.error(err);
      setResultNumber(500000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#EBECEE] text-[#111111] flex flex-col items-center justify-between px-6 py-12 font-sans selection:bg-black selection:text-white">
      {/* Header */}
      <header className="w-full text-center">
        <h1 className="text-xl md:text-2xl font-medium tracking-tight opacity-90">
          whatsthechance.com
        </h1>
      </header>

      {/* Main Interaction Area */}
      <div className="w-full max-w-xl flex flex-col items-center my-auto space-y-10">
        
        {/* Input Pill Form */}
        <form 
          onSubmit={handleSubmit}
          className="w-full"
        >
          <div className="relative flex items-center w-full bg-white border-2 border-black rounded-full px-6 py-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all focus-within:shadow-[0_6px_24px_rgba(0,0,0,0.08)]">
            <span className="text-lg font-medium whitespace-nowrap text-black select-none pr-1.5">
              What’s the chance
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="that the earth will explode..."
              className="w-full bg-transparent text-lg text-black placeholder-neutral-400 focus:outline-none font-normal"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !query.trim()}
              className="ml-2 text-xs font-semibold tracking-wider uppercase px-3 py-1.5 rounded-full bg-black text-white hover:bg-neutral-800 disabled:opacity-0 transition-opacity duration-200"
            >
              Calculate
            </button>
          </div>
        </form>

        {/* Results Section */}
        <div className="text-center min-h-[160px] flex flex-col items-center justify-center transition-all duration-500">
          {isLoading && (
            <div className="flex items-center space-x-2 text-neutral-500 font-medium tracking-wide">
              <span className="inline-block w-2 h-2 rounded-full bg-black animate-ping" />
              <span>Calculating probability...</span>
            </div>
          )}

          {!isLoading && hasSearched && resultNumber !== null && (
            <div className="animate-fade-in space-y-2">
              <p className="text-lg md:text-xl font-medium text-neutral-800">
                The chance is...
              </p>
              <div className="text-5xl md:text-7xl font-bold tracking-tight text-black font-mono">
                1 in {displayNumber.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="text-xs text-neutral-400 tracking-wider uppercase">
        Statistical Probability Engine
      </footer>
    </main>
  );
}
