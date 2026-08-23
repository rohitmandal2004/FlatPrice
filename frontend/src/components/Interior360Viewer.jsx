import React, { useState } from 'react';

export default function Interior360Viewer({ bhk, onClose }) {
  const [currentBhk, setCurrentBhk] = useState(bhk > 3 ? 3 : bhk);

  const getImageUrl = (b) => {
    switch (b) {
      case 1:
        return "/floor_plan_1bhk.jpg";
      case 2:
        return "/floor_plan_2bhk.jpg";
      case 3:
      default:
        return "/floor_plan_3bhk.jpg";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col animate-in fade-in duration-300">
      <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black/90 to-transparent">
        <div>
          <h2 className="text-white font-black text-3xl drop-shadow-md mb-4 flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"></span>
            3D Floor Plan
          </h2>
          
          {/* BHK Choosing Option */}
          <div className="flex gap-2 bg-black/40 p-2 rounded-xl backdrop-blur-md border border-white/10">
            {[1, 2, 3].map(num => (
              <button 
                key={num}
                onClick={() => setCurrentBhk(num)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                  currentBhk === num 
                    ? 'bg-emerald-500 text-white shadow-lg scale-105' 
                    : 'bg-transparent text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {num} BHK
              </button>
            ))}
          </div>
        </div>
        
        <button 
          onClick={onClose}
          className="px-6 py-3 bg-white/10 hover:bg-rose-500 backdrop-blur-md text-white font-bold rounded-xl transition-all shadow-lg border border-white/20 hover:border-rose-400"
        >
          Close
        </button>
      </div>

      <div className="flex-1 w-full h-full relative flex items-center justify-center p-12 md:p-24 pt-32">
        <img 
          src={getImageUrl(currentBhk)} 
          alt={`${currentBhk} BHK Floor Plan`} 
          className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl border border-white/20"
        />
      </div>
    </div>
  );
}
