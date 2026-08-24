import React from 'react';
import { getModelInfo } from '../services/api';
import { BookOpen, BrainCircuit, ListChecks, TrendingUp, Calculator } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { useDeferredMount } from '../hooks/useDeferredMount';
import { Loader2 } from 'lucide-react';
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

  const isChartMounted = useDeferredMount(400);

  const getChartData = () => {
    if (!modelInfo) return { data: [], intercept: 0, slope: 0 };
    const m = modelInfo.coefficients['Area_Sqft'] || 0;
    // Add realistic defaults for other features so the line isn't wildly negative
    const baseOffset = (modelInfo.coefficients['Floor'] * 5) + (modelInfo.coefficients['Bedrooms'] * 2) + (modelInfo.coefficients['Car_Parking_Sqft'] * 150);
    const intercept = modelInfo.intercept + baseOffset;
    
    const data = [];
    for (let area = 0; area <= 2500; area += 500) {
      data.push({
        area: area,
        price: Number((intercept + (m * area)).toFixed(2))
      });
    }
    return { data, intercept, slope: m };
  };

  const chartInfo = getChartData();

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
          <div className="bg-white/50 border border-white p-6 rounded-2xl overflow-x-auto text-xl md:text-2xl font-black text-slate-700 font-mono mt-6 shadow-inner text-center tracking-wider">
            y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε
          </div>
          
          <div className="mt-6 bg-slate-50 border border-slate-100 rounded-xl p-5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-200 pb-2">Mathematical Annotations</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div className="flex gap-3"><strong className="text-slate-800 font-mono w-6 text-right">y</strong><span className="text-slate-600">The dependent variable (Predicted Flat Price).</span></div>
              <div className="flex gap-3"><strong className="text-slate-800 font-mono w-6 text-right">β₀</strong><span className="text-slate-600">The y-intercept (Base price when all features are 0).</span></div>
              <div className="flex gap-3"><strong className="text-slate-800 font-mono w-6 text-right">βₙ</strong><span className="text-slate-600">The coefficient for the <span className="italic">n</span>-th feature (Weight/Importance).</span></div>
              <div className="flex gap-3"><strong className="text-slate-800 font-mono w-6 text-right">xₙ</strong><span className="text-slate-600">The <span className="italic">n</span>-th independent variable (Feature like Area, Floor).</span></div>
              <div className="flex gap-3"><strong className="text-slate-800 font-mono w-6 text-right">ε</strong><span className="text-slate-600">The random error term (Unexplained variance/noise).</span></div>
            </div>
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
          
          <div className="bg-slate-900 text-slate-50 p-6 sm:p-8 rounded-[1.5rem] font-mono text-base md:text-lg shadow-2xl overflow-x-auto relative group-hover:shadow-[0_0_40px_rgba(59,130,246,0.3)] transition-shadow duration-500">
            {/* Inner subtle glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent pointer-events-none rounded-[1.5rem]"></div>
            
            <div className="text-blue-400 font-bold mb-5 flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="ml-2">Predicted Price (Lakhs) =</span>
            </div>
            <div className="pl-4 space-y-4 relative z-10">
              <div className="flex items-center">
                <span className="text-yellow-400 font-bold text-lg md:text-xl w-28 text-right pr-4">{modelInfo.intercept.toFixed(2)}</span> 
                <span className="text-slate-500 opacity-70 italic text-sm md:text-base">// Base intercept</span>
              </div>
              
              {Object.entries(modelInfo.coefficients).map(([feature, coef]) => (
                <div key={feature} className="flex items-center hover:bg-white/5 p-2 rounded-md transition-colors">
                  <span className="text-slate-300 font-bold text-lg md:text-xl w-28 text-right pr-4 tracking-wider">
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

        <section className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="flex items-center gap-3 border-b border-slate-200/50 pb-4 mb-4">
            <div className="p-2 bg-purple-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <TrendingUp className="text-purple-500 h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">4. Visualizing the Math</h2>
          </div>
          <p className="text-slate-600 font-medium mb-6">
            Let's isolate the relationship between <strong className="text-slate-800">Area</strong> and <strong className="text-slate-800">Price</strong> (assuming a 2 BHK on the 5th floor).
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 items-center">
            <div className="md:col-span-2 h-72 bg-white/50 rounded-2xl p-4 border border-slate-100 shadow-inner">
              {isChartMounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartInfo.data} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="area" tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} />
                    <YAxis tick={{ fontSize: 12, fill: '#64748b' }} tickLine={false} axisLine={{ stroke: '#cbd5e1' }} tickFormatter={(val) => `₹${val}L`} />
                    <Tooltip 
                      formatter={(val) => [`₹${val} Lakh`, 'Predicted Price']}
                      labelFormatter={(val) => `${val} Sqft`}
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#8b5cf6" strokeWidth={4} dot={{ r: 6, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} animationDuration={2000} />
                    {chartInfo.data.length > 0 && (
                      <ReferenceDot x={0} y={chartInfo.intercept} r={8} fill="#ef4444" stroke="#fff" strokeWidth={2} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white/20 rounded-2xl animate-pulse">
                  <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                </div>
              )}
            </div>
            
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-bl-full -z-0"></div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 relative z-10">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span> Intercept (Y-Axis)
                </h3>
                <p className="text-sm text-slate-600 mt-2 relative z-10 leading-relaxed">
                  The <strong className="text-red-500">red dot</strong> at Area = 0. It's the "starting point" of our line before area is factored in.
                </p>
                <div className="mt-2 text-xl font-black text-slate-800">₹{chartInfo.intercept.toFixed(2)} L</div>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-bl-full -z-0"></div>
                <h3 className="text-base font-bold text-slate-800 flex items-center gap-2 relative z-10">
                  <span className="w-4 h-1 rounded-full bg-purple-500"></span> The Slope
                </h3>
                <p className="text-sm text-slate-600 mt-2 relative z-10 leading-relaxed">
                  How steep the line is. For every 1 sqft we move to the right, the price goes UP by exactly this much.
                </p>
                <div className="mt-2 text-xl font-black text-slate-800">+ ₹{chartInfo.slope.toFixed(4)} L</div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="flex items-center gap-3 border-b border-slate-200/50 pb-4 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <Calculator className="text-amber-500 h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">5. Interactive Math: Step-by-Step</h2>
          </div>
          <p className="text-slate-600 font-medium leading-relaxed mb-6 md:text-lg">
            Let's manually calculate a prediction for a <strong className="text-slate-800">1000 sqft, 2 BHK, 5th Floor, East Facing</strong> flat with 100 sqft parking.
          </p>

          <div className="bg-slate-900 rounded-2xl p-5 sm:p-8 font-mono text-base md:text-lg shadow-xl text-slate-300">
            <div className="flex justify-between items-center border-b border-slate-700 pb-3 mb-4">
              <span className="text-slate-400 font-semibold">Step</span>
              <span className="text-slate-400 font-semibold">Calculation</span>
              <span className="text-slate-400 font-semibold">Running Total</span>
            </div>
            
            <div className="space-y-5">
              <div className="flex justify-between items-center group">
                <span className="w-1/3 text-yellow-400 font-semibold">1. Base Intercept</span>
                <span className="w-1/3 text-center opacity-50">-</span>
                <span className="w-1/3 text-right text-white font-bold">{modelInfo.intercept.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center hover:bg-white/5 p-2 -mx-2 rounded transition-colors">
                <span className="w-1/3 text-emerald-400 font-semibold">2. Add Area (1000)</span>
                <span className="w-1/3 text-center text-sm md:text-base">1000 × {modelInfo.coefficients['Area_Sqft'].toFixed(4)}</span>
                <span className="w-1/3 text-right text-white font-bold">+ {(1000 * modelInfo.coefficients['Area_Sqft']).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center hover:bg-white/5 p-2 -mx-2 rounded transition-colors">
                <span className="w-1/3 text-emerald-400 font-semibold">3. Add Floor (5)</span>
                <span className="w-1/3 text-center text-sm md:text-base">5 × {modelInfo.coefficients['Floor'].toFixed(4)}</span>
                <span className="w-1/3 text-right text-white font-bold">+ {(5 * modelInfo.coefficients['Floor']).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center hover:bg-white/5 p-2 -mx-2 rounded transition-colors">
                <span className="w-1/3 text-emerald-400 font-semibold">4. Add Bedrooms (2)</span>
                <span className="w-1/3 text-center text-sm md:text-base">2 × {modelInfo.coefficients['Bedrooms'].toFixed(4)}</span>
                <span className="w-1/3 text-right text-white font-bold">+ {(2 * modelInfo.coefficients['Bedrooms']).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center hover:bg-white/5 p-2 -mx-2 rounded transition-colors">
                <span className="w-1/3 text-emerald-400 font-semibold">5. Add Parking (100)</span>
                <span className="w-1/3 text-center text-sm md:text-base">100 × {modelInfo.coefficients['Car_Parking_Sqft'].toFixed(4)}</span>
                <span className="w-1/3 text-right text-white font-bold">+ {(100 * modelInfo.coefficients['Car_Parking_Sqft']).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center hover:bg-white/5 p-2 -mx-2 rounded transition-colors">
                <span className="w-1/3 text-blue-400 font-semibold">6. Facing East</span>
                <span className="w-1/3 text-center text-sm md:text-base">1 × {modelInfo.coefficients['Facing_East'].toFixed(4)}</span>
                <span className="w-1/3 text-right text-white font-bold">{modelInfo.coefficients['Facing_East'] > 0 ? '+' : ''} {modelInfo.coefficients['Facing_East'].toFixed(2)}</span>
              </div>
              
              <div className="border-t-2 border-slate-700 mt-6 pt-5 flex justify-between items-center">
                <span className="w-1/3 text-2xl text-white font-black tracking-wide">Final Price</span>
                <span className="w-1/3 text-center opacity-50">=</span>
                <span className="w-1/3 text-right text-3xl md:text-4xl text-emerald-400 font-black">
                  ₹{(
                    modelInfo.intercept + 
                    (1000 * modelInfo.coefficients['Area_Sqft']) +
                    (5 * modelInfo.coefficients['Floor']) +
                    (2 * modelInfo.coefficients['Bedrooms']) +
                    (100 * modelInfo.coefficients['Car_Parking_Sqft']) +
                    modelInfo.coefficients['Facing_East']
                  ).toFixed(2)} L
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* 6. Cost Functions Section */}
        <section className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 sm:p-8 shadow-lg hover:shadow-xl transition-all relative overflow-hidden group">
          <div className="flex items-center gap-3 border-b border-slate-200/50 pb-4 mb-4">
            <div className="p-2 bg-rose-500/10 rounded-xl group-hover:scale-110 transition-transform">
              <ListChecks className="text-rose-500 h-6 w-6" />
            </div>
            <h2 className="text-2xl font-black text-slate-800">6. Cost Functions & Model Performance</h2>
          </div>
          <p className="text-slate-600 font-medium leading-relaxed mb-4">
            To ensure our model accurately predicts flat prices, we use cost functions to measure the error between predicted prices (<span className="italic">ŷ</span>) and actual prices (<span className="italic">y</span>). The model aims to minimize this error during training.
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mb-6">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 border-b border-slate-200 pb-2">Common Variable Annotations</h3>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
              <div><strong className="text-slate-800 font-mono">yᵢ</strong> = Actual price of the <span className="italic">i</span>-th flat.</div>
              <div><strong className="text-slate-800 font-mono">ŷᵢ</strong> = Predicted price of the <span className="italic">i</span>-th flat.</div>
              <div><strong className="text-slate-800 font-mono">ȳ</strong> = Mean (average) price of all actual flats.</div>
              <div><strong className="text-slate-800 font-mono">n</strong> = Total number of observations (flats).</div>
              <div><strong className="text-slate-800 font-mono">Σ</strong> = Summation (add them all up).</div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* MSE */}
            <div className="bg-white/50 border border-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Mean Squared Error (MSE)</div>
              <div className="text-xs font-mono text-slate-500 bg-slate-100 p-2 rounded-lg mb-3">J = (1/n) Σ(yᵢ - ŷᵢ)²</div>
              <div className="text-2xl font-black text-slate-800">{modelInfo.mse ? modelInfo.mse.toFixed(2) : "N/A"}</div>
              <div className="text-xs text-slate-500 mt-1">Penalizes larger errors heavily.</div>
            </div>

            {/* RMSE */}
            <div className="bg-white/50 border border-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Root Mean Squared Error</div>
              <div className="text-xs font-mono text-slate-500 bg-slate-100 p-2 rounded-lg mb-3">RMSE = √MSE</div>
              <div className="text-2xl font-black text-rose-600">{modelInfo.rmse ? `₹${modelInfo.rmse.toFixed(2)} L` : "N/A"}</div>
              <div className="text-xs text-slate-500 mt-1">Average error in prediction (Lakhs).</div>
            </div>

            {/* MAE */}
            <div className="bg-white/50 border border-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Mean Absolute Error</div>
              <div className="text-xs font-mono text-slate-500 bg-slate-100 p-2 rounded-lg mb-3">MAE = (1/n) Σ|yᵢ - ŷᵢ|</div>
              <div className="text-2xl font-black text-slate-800">{modelInfo.mae ? `₹${modelInfo.mae.toFixed(2)} L` : "N/A"}</div>
              <div className="text-xs text-slate-500 mt-1">Average absolute difference.</div>
            </div>

            {/* R-Squared */}
            <div className="bg-white/50 border border-white p-5 rounded-2xl shadow-sm hover:shadow-md transition-all sm:col-span-2">
              <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">R-Squared (R²) Score</div>
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex-1 space-y-2 w-full">
                  <div className="text-sm font-mono text-slate-600 bg-slate-100/80 p-3 rounded-lg border border-slate-200/50">
                    <div className="font-bold text-slate-800 mb-1">R² = 1 - (SSR / SST)</div>
                    <div className="text-xs space-y-1 mt-2 pl-2 border-l-2 border-emerald-300">
                      <div><strong className="text-slate-700">SSR</strong> (Residual Sum of Squares) = Σ(yᵢ - ŷᵢ)²</div>
                      <div><strong className="text-slate-700">SST</strong> (Total Sum of Squares) = Σ(yᵢ - ȳ)²</div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 font-medium">
                    Measures how much of the variance in property prices is explained by our model. (<span className="italic">ȳ</span> = average price).
                  </div>
                </div>
                <div className="text-4xl md:text-5xl font-black text-emerald-600 bg-emerald-50 p-6 rounded-2xl border border-emerald-100 shadow-sm shrink-0">
                  {modelInfo.r2_score ? `${(modelInfo.r2_score * 100).toFixed(1)}%` : "N/A"}
                </div>
              </div>
            </div>
          </div>
        </section>
        </div>
      )}
    </div>
  );
}
