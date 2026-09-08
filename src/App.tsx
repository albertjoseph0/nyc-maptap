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
      subwayRoute = calculateSubwayRoute(point, currentTarget.center, currentTarget);
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
        <span className="text-xs uppercase tracking-widest text-neutral-400 font-semibold drop-shadow-md">
          NYC MapTap
        </span>
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

      {/* Floating Prompt & Feedback (Center Top with Dynamic Safe Margin) */}
      {!isGameOver && currentTarget && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-sm px-4 pt-[calc(max(0.875rem,env(safe-area-inset-top))+2.25rem)]">
          <div className="text-center py-3.5 px-6 bg-black/85 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] ring-1 ring-white/5 transition-all duration-300">
            {!lastResult ? (
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 block mb-0.5">
                  Locate
                </span>
                <h1 className="text-2xl font-black tracking-tight text-white">
                  {currentTarget.name}
                </h1>
              </div>
            ) : lastResult.isCorrect ? (
              <div className="animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-0.5">
                  <span>🎯</span>
                  <span>Spot On</span>
                </div>
                <h1 className="text-xl font-black tracking-tight text-white">
                  {currentTarget.name}
                </h1>
              </div>
            ) : (
              <div className="space-y-1.5 animate-in fade-in duration-200">
                {/* Punchy Witty Correction */}
                <div className="flex items-center justify-center gap-1.5">
                  <span className="text-rose-400 text-xs font-semibold">✕</span>
                  <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                    {lastResult.tapped ? `That's ${lastResult.tapped.name}` : "You're in the water!"}
                  </h2>
                </div>

                {/* Single-Surface Transit Pill */}
                {lastResult.subwayRoute && (
                  <div className="flex items-center justify-center gap-2 pt-0.5 text-xs text-neutral-300 font-medium">
                    {lastResult.subwayRoute.transitType === 'subway' ? (
                      <div className="flex items-center gap-1 shrink-0">
                        {(() => {
                          const route = lastResult.subwayRoute;
                          const lines: string[] = [];
                          if (route.summary.includes('via')) {
                            const parts = route.summary.split('via')[1]?.trim().split('to') || [];
                            parts.forEach((p) => lines.push(p.trim()));
                          } else if (route.lineBullet) {
                            lines.push(route.lineBullet);
                          }
                          return lines.map((line, idx) => (
                            <React.Fragment key={idx}>
                              {idx > 0 && (
                                <span className="text-neutral-500 text-[10px] font-bold">→</span>
                              )}
                              <span
                                className="w-5 h-5 rounded-full inline-flex items-center justify-center font-black text-white text-[11px] shadow-sm leading-none"
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
                      <span className="text-neutral-200 font-semibold">{currentTarget.name}</span>
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
                : 'Keep exploring the island.'}
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
