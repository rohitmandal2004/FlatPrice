import React from 'react';
import { Building, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-1 bg-[#B9D175] rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-300"></div>
        <div className="relative bg-background border rounded-lg p-2 flex items-center justify-center shadow-sm">
          <Building className="h-7 w-7 text-[#B9D175]" />
          <Sparkles className="absolute -top-1.5 -right-1.5 h-4 w-4 text-emerald-500 animate-pulse" />
        </div>
      </div>
      <div className="font-extrabold tracking-tight text-3xl flex flex-col justify-center">
        <span className="text-foreground leading-none text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/80">FlatPredict</span>
        <span className="text-[0.8rem] text-emerald-600 uppercase tracking-[0.25em] leading-none mt-1 font-black">AI Engine</span>
      </div>
    </Link>
  );
}
