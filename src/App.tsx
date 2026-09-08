import React, { useState, useEffect } from 'react';
import { Neighborhood, RoundResult } from './types/game';
import { MANHATTAN_NEIGHBORHOODS } from './data/neighborhoods';
import { isPointInNeighborhood, findNeighborhoodAtPoint } from './utils/geo';
import { calculateSubwayRoute } from './utils/subwayRouting';
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
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none w-full max-w-md px-4 pt-[calc(max(0.875rem,env(safe-area-inset-top))+2.25rem)]">
          <div className="text-center py-3 px-5 bg-black/85 backdrop-blur-md rounded-2xl border border-neutral-800/80 shadow-2xl transition-all">
            {!lastResult ? (
              <div>
                <span className="text-[11px] uppercase tracking-wider text-neutral-400 font-semibold block">
                  Find
                </span>
                <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">
                  {currentTarget.name}
                </h1>
              </div>
            ) : lastResult.isCorrect ? (
              <div className="text-emerald-400">
                <span className="text-xs uppercase font-bold tracking-wider block">
                  ✓ Correct
                </span>
                <h1 className="text-xl font-bold text-white mt-0.5">
                  {currentTarget.name}
                </h1>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Header Tag */}
                <div className="flex items-center justify-center gap-2 text-rose-400 text-xs font-bold uppercase tracking-wider">
                  <span>✗ Missed</span>
                  <span className="text-neutral-500 font-normal">·</span>
                  <span className="text-neutral-300 font-medium lowercase">
                    tapped {lastResult.tapped ? lastResult.tapped.name : 'water / outskirts'}
                  </span>
                </div>

                {/* Subway Transit Route Card */}
                {lastResult.subwayRoute && (
                  <div className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-2.5 text-left text-xs space-y-1.5 shadow-inner">
                    <div className="flex items-center gap-2">
                      {lastResult.subwayRoute.transitType === 'subway' ? (
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center font-black text-white text-[11px] shadow-sm shrink-0 font-sans"
                          style={{ backgroundColor: lastResult.subwayRoute.lineColor }}
                        >
                          {lastResult.subwayRoute.lineBullet}
                        </div>
                      ) : (
                        <span className="text-base leading-none">🚶</span>
                      )}
                      <span className="font-semibold text-white text-xs">
                        {lastResult.subwayRoute.summary}
                      </span>
                    </div>

                    {lastResult.subwayRoute.boardStationName && (
                      <div className="text-[11px] text-neutral-400 pl-7 leading-tight">
                        <span>Board at </span>
                        <strong className="text-neutral-200">
                          {lastResult.subwayRoute.boardStationName}
                        </strong>
                        <span> → Exit at </span>
                        <strong className="text-neutral-200">
                          {lastResult.subwayRoute.alightStationName}
                        </strong>
                      </div>
                    )}
                  </div>
                )}

                <span className="text-[11px] text-emerald-400 font-medium block">
                  {currentTarget.name} illuminated on map
                </span>
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
