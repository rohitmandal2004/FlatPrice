import React from 'react';
import { getModelInfo } from '../services/api';
import { BookOpen, BrainCircuit, ListChecks } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

const ExplorerSkeleton = () => (
  <div className="space-y-8 animate-pulse mt-12">
    <div className="h-64 bg-slate-200/50 rounded-[2rem]"></div>
    <div className="h-64 bg-slate-200/50 rounded-[2rem]"></div>
  </div>
);

export default function MLExplorerPage() {
  const { data: modelInfo, isLoading: loading, isError } = useQuery({
    queryKey: ['modelInfo'],
    queryFn: async () => {
      const data = await getModelInfo();
      return data;
    },
    staleTime: 1000 * 60 * 60, // Cache for an hour since model doesn't change often
  });

  if (isError) return <div className="text-center text-red-500 mt-10 font-bold">Failed to load model info from backend.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none -z-10"></div>
      <div className="absolute top-40 left-0 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none -z-10"></div>

      <div className="text-center space-y-2">
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-800">How the Model Works</h1>
        <p className="text-slate-500 font-medium md:text-lg">Understanding Multiple Linear Regression</p>
      </div>

      {loading ? (
        <ExplorerSkeleton />
      ) : (
        <div className="space-y-8">
        <section className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="flex items-center gap-3 border-b border-slate-200/50 pb-4 mb-4">
            <div className="p-2 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform">
              <BrainCircuit className="text-primary h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">1. The Algorithm</h2>
          </div>
          <p className="text-slate-600 font-medium leading-relaxed">
            This application uses <strong className="text-primary font-black">Multiple Linear Regression</strong>, a statistical technique that uses several explanatory variables (features) to predict the outcome of a response variable (target). The goal is to model the linear relationship between the explanatory (independent) variables and response (dependent) variable.
          </p>
          <div className="bg-white/50 border border-white p-4 rounded-xl overflow-x-auto text-sm font-bold text-slate-700 font-mono mt-4 shadow-inner text-center">
            y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε
          </div>
        </section>

        <section className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="flex items-center gap-3 border-b border-slate-200/50 pb-4 mb-4">
            <div className="p-2 bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <ListChecks className="text-blue-500 h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">2. Our specific Model Equation</h2>
          </div>
          <p className="text-slate-600 font-medium mb-6">
            Based on the training dataset of <strong className="text-slate-800 font-bold">{modelInfo.training_samples}</strong> records, the model learned the following equation to predict the price of a flat:
          </p>
          
          <div className="bg-slate-900 text-slate-50 p-6 sm:p-8 rounded-[1.5rem] font-mono text-sm shadow-2xl overflow-x-auto relative group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-shadow duration-500">
            {/* Inner subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none rounded-[1.5rem]"></div>
            
            <div className="text-blue-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="ml-2">Predicted Price (Lakhs) =</span>
            </div>
            <div className="pl-4 space-y-3 relative z-10">
              <div className="flex items-center">
                <span className="text-yellow-400 font-bold text-base w-24 text-right pr-4">{modelInfo.intercept.toFixed(2)}</span> 
                <span className="text-slate-500 opacity-70 italic text-xs">// Base intercept</span>
              </div>
              
              {Object.entries(modelInfo.coefficients).map(([feature, coef]) => (
                <div key={feature} className="flex items-center hover:bg-white/5 p-1 rounded-md transition-colors">
                  <span className="text-slate-300 font-bold text-base w-24 text-right pr-4 tracking-wider">
                    {coef > 0 ? '+' : '-'} {Math.abs(coef).toFixed(4)}
                  </span>
                  <span className="text-emerald-400 font-medium">× {feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="flex items-center gap-3 border-b border-slate-200/50 pb-4 mb-4">
            <div className="p-2 bg-emerald-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <BookOpen className="text-emerald-500 h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">3. How to interpret this</h2>
          </div>
          <ul className="space-y-4 text-slate-600 font-medium">
            <li className="flex gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-yellow-400 shrink-0"></div>
              <div><strong className="text-slate-800 font-black">Intercept ({modelInfo.intercept.toFixed(2)}):</strong> The theoretical baseline price when all other features are 0 (which is physically impossible, but necessary for the math).</div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-blue-400 shrink-0"></div>
              <div><strong className="text-slate-800 font-black">Area Coefficient:</strong> For every 1 sq ft increase in area, the price changes by <strong className="text-primary">₹{modelInfo.coefficients['Area_Sqft'].toFixed(4)} Lakh</strong>, assuming everything else stays constant.</div>
            </li>
            <li className="flex gap-3">
              <div className="mt-1 w-2 h-2 rounded-full bg-emerald-400 shrink-0"></div>
              <div><strong className="text-slate-800 font-black">Categorical Encoding:</strong> 'Facing' was converted into numbers using One-Hot Encoding. If a flat faces East (and North was dropped as baseline), the 'Facing_East' coefficient is added to the price.</div>
            </li>
          </ul>
        </section>
        </div>
      )}
    </div>
  );
}
