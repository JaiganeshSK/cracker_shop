import React from 'react';

const SparkleGlow = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Soft radiant ambient glow orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[45vw] h-[45vw] rounded-full bg-amber-500/5 blur-[120px] animate-pulse-glow" />
      <div className="absolute top-[30%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-rose-600/5 blur-[140px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      <div className="absolute bottom-[-10%] left-[20%] w-[50vw] h-[50vw] rounded-full bg-amber-600/5 blur-[130px] animate-pulse-glow" style={{ animationDelay: '3s' }} />

      {/* Lightweight CSS Sparkle Starlets */}
      <div className="absolute top-[15%] left-[8%] text-amber-300 text-xs animate-sparkle">✦</div>
      <div className="absolute top-[28%] right-[12%] text-amber-200 text-sm animate-sparkle" style={{ animationDelay: '0.8s' }}>✧</div>
      <div className="absolute top-[52%] left-[15%] text-rose-400 text-xs animate-sparkle" style={{ animationDelay: '1.4s' }}>✦</div>
      <div className="absolute top-[75%] right-[20%] text-amber-400 text-sm animate-sparkle" style={{ animationDelay: '2.1s' }}>✧</div>
      <div className="absolute top-[88%] left-[30%] text-yellow-200 text-xs animate-sparkle" style={{ animationDelay: '0.5s' }}>✦</div>
    </div>
  );
};

export default SparkleGlow;
