import React from 'react';
import { Building, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-1 bg-[#B9D175] rounded-lg blur opacity-40 group-hover:opacity-70 transition duration-300"></div>
        <div className="relative bg-background border rounded-lg p-1.5 flex items-center justify-center">
          <Building className="h-5 w-5 text-[#B9D175]" />
          <Sparkles className="absolute -top-1 -right-1 h-3 w-3 text-emerald-500 animate-pulse" />
        </div>
      </div>
      <div className="font-extrabold tracking-tight text-xl flex flex-col justify-center">
        <span className="text-foreground leading-none">FlatPredict</span>
        <span className="text-[0.65rem] text-[#B9D175] uppercase tracking-[0.2em] leading-none mt-1 font-bold">AI Engine</span>
      </div>
    </Link>
  );
}
