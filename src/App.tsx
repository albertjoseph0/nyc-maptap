import React, { useState, useEffect } from 'react';
import { Neighborhood, RoundResult } from './types/game';
import { MANHATTAN_NEIGHBORHOODS } from './data/neighborhoods';
import { isPointInNeighborhood, findNeighborhoodAtPoint } from './utils/geo';
import { calculateSubwayRoute } from './utils/subwayRouting';
import { MTA_LINE_COLORS } from './data/subwayNetwork';
import { NeighborhoodMap } from './components/Map/NeighborhoodMap';

const TOTAL_ROUNDS = 10;

export const App: React.FC = () => {
  const [queue, setQueue] = useState<Neighborhood[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);

  const startNewGame = () => {
    const shuffled = [...MANHATTAN_NEIGHBORHOODS].sort(() => Math.random() - 0.5);
    setQueue(shuffled.slice(0, TOTAL_ROUNDS));
    setCurrentIndex(0);
    setScore(0);
    setLastResult(null);
    setIsGameOver(false);
  };

  useEffect(() => {
    startNewGame();
  }, []);

  const currentTarget = queue[currentIndex] || null;

  const handleMapTap = (point: [number, number]) => {
    if (!currentTarget || lastResult !== null || isGameOver) return;

    const isCorrect = isPointInNeighborhood(point, currentTarget);
    const tapped = findNeighborhoodAtPoint(point, MANHATTAN_NEIGHBORHOODS);

    let subwayRoute = undefined;
    if (isCorrect) {
      setScore((s) => s + 1);
    } else {
      // Calculate fastest subway route from user's tap to target neighborhood center
      subwayRoute = calculateSubwayRoute(point, currentTarget.center, currentTarget, tapped);
    }

    setLastResult({
      target: currentTarget,
      tapped,
      clickedPoint: point,
      isCorrect,
      subwayRoute,
    });
  };

  const handleNext = () => {
    if (currentIndex + 1 >= queue.length) {
      setIsGameOver(true);
      return;
    }
    setCurrentIndex((i) => i + 1);
    setLastResult(null);
  };

  return (
    <div className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-black font-sans text-white select-none touch-none">
      {/* Interactive Map */}
      <NeighborhoodMap
        target={currentTarget}
        lastResult={lastResult}
        onMapTap={handleMapTap}
      />

      {/* Top Status Bar (Safe Area Protected) */}
      <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between pointer-events-none px-6 pt-[max(0.875rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2 drop-shadow-md">
          <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold">
            NYC MapTap
          </span>
          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-white/10 text-neutral-400 font-medium tracking-wider">
            Metro Core
          </span>
        </div>
        {!isGameOver && (
          <div className="text-xs font-mono tracking-tight text-neutral-400 flex items-center gap-3 drop-shadow-md">
            <span>
              Round {currentIndex + 1}/{queue.length}
            </span>
            <span className="text-neutral-200 font-bold">
              {score} Correct
            </span>
          </div>
        )}
      </header>

      {/* Sleek Floating Prompt Pill (Target to find) */}
      {!isGameOver && !lastResult && currentTarget && (
        <div className="absolute top-[max(3.25rem,calc(env(safe-area-inset-top)+2.5rem))] left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in zoom-in-95 duration-200 w-[88%] max-w-sm">
          <div className="bg-neutral-900/90 backdrop-blur-xl border border-white/10 px-5 py-2.5 rounded-2xl shadow-2xl text-center">
            <span className="text-[10px] uppercase tracking-widest text-emerald-400/90 font-bold block mb-0.5">
              Locate Neighborhood
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
              {currentTarget.name}
            </h1>
            {currentTarget.regionName && (
              <p className="text-[11px] text-neutral-400 mt-0.5 font-medium">
                {currentTarget.regionName}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Apple Dynamic Island Style Floating Feedback Card */}
      {!isGameOver && lastResult && (
        <div className="absolute top-[max(3.25rem,calc(env(safe-area-inset-top)+2.5rem))] left-1/2 -translate-x-1/2 z-20 pointer-events-none animate-in fade-in slide-in-from-top-3 duration-300 w-[92%] max-w-md">
          <div className="bg-neutral-950/90 backdrop-blur-2xl border border-white/12 px-5 py-3.5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center">
            {lastResult.isCorrect ? (
              <div className="flex items-center justify-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 inline-flex items-center justify-center text-xs font-black">
                  ✓
                </span>
                <span className="text-sm font-bold text-white tracking-tight">
                  Spot on! That's {currentTarget.name}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1.5">
                {/* Line 1: What was tapped */}
                <div className="flex items-center justify-center gap-2 text-xs">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span className="text-neutral-300 font-medium">
                    {lastResult.tapped
                      ? `That's ${lastResult.tapped.name}`
                      : 'That was in the water / out of bounds'}
                  </span>
                </div>

                {/* Line 2: Transit connection route pill */}
                {lastResult.subwayRoute && (
                  <div className="flex items-center justify-center gap-2 text-[13px] flex-wrap">
                    {lastResult.subwayRoute.transitType === 'subway' ? (
                      <div className="flex items-center gap-1 shrink-0">
                        {(() => {
                          const route = lastResult.subwayRoute!;
                          const match = route.summary.match(/via (.*)$/);
                          const lines: string[] = [];
                          if (match && match[1]) {
                            match[1].split(' to ').forEach((l) => lines.push(l.trim()));
                          } else if (route.lineBullet) {
                            lines.push(route.lineBullet);
                          }
                          return lines.map((line, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && (
                                <span className="text-neutral-500 text-[10px] font-bold">→</span>
                              )}
                              <span
                                className={`h-5 inline-flex items-center justify-center font-black text-white shadow-sm leading-none ${
                                  line.length > 2
                                    ? 'px-1.5 rounded-md text-[9px] tracking-wider'
                                    : 'w-5 rounded-full text-[11px]'
                                }`}
                                style={{
                                  backgroundColor:
                                    MTA_LINE_COLORS[line] || route.lineColor || '#EE352E',
                                }}
                              >
                                {line}
                              </span>
                            </React.Fragment>
                          ));
                        })()}
                      </div>
                    ) : (
                      <span className="text-neutral-400 shrink-0 text-sm">🚶</span>
                    )}

                    <span className="text-neutral-500">·</span>

                    <span className="text-neutral-200">
                      <strong className="text-white font-bold">
                        {lastResult.subwayRoute.totalMinutes} min
                      </strong>
                      <span className="text-neutral-400"> to </span>
                      <span className="text-neutral-200 font-semibold">
                        {currentTarget.name.replace(/\s*(\/|\().*$/, '')}
                      </span>
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Minimalist Bottom "Next" Button (After Tap with Dynamic Home Indicator Margin) */}
      {!isGameOver && lastResult && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-auto pb-[max(2rem,calc(env(safe-area-inset-bottom)+1.25rem))]">
          <button
            onClick={handleNext}
            className="px-7 py-3 min-h-[48px] bg-white text-black font-semibold text-sm rounded-full shadow-2xl hover:bg-neutral-200 active:scale-95 transition-all flex items-center gap-2 cursor-pointer touch-manipulation"
          >
            <span>{currentIndex + 1 >= queue.length ? 'Finish' : 'Next'}</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Game Over Minimalist Overlay */}
      {isGameOver && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-lg flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="text-center max-w-xs w-full pb-[env(safe-area-inset-bottom)]">
            <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold block mb-2">
              Completed
            </span>
            <h2 className="text-6xl font-black text-white tracking-tighter mb-2">
              {score}
              <span className="text-2xl font-medium text-neutral-500"> / {queue.length}</span>
            </h2>
            <p className="text-sm text-neutral-400 mb-8">
              {score >= 8
                ? 'Mastery level knowledge.'
                : score >= 5
                ? 'Solid spatial instinct.'
                : 'Keep exploring the city & boroughs.'}
            </p>
            <button
              onClick={startNewGame}
              className="w-full py-3.5 min-h-[48px] bg-white text-black font-bold text-sm rounded-xl hover:bg-neutral-200 active:scale-98 transition-all shadow-xl cursor-pointer touch-manipulation"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
