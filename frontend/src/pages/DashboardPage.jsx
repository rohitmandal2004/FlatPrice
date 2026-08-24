import React, { useState } from 'react';
import { getDatasetStats, getModelInfo, getDatasetDownloadUrl } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Scatter, Line, ZAxis } from 'recharts';
import { Loader2, Download, History, Trash2, Database, IndianRupee, Activity, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useStore } from '../hooks/useStore';
import { useDeferredMount } from '../hooks/useDeferredMount';
import HistoryPage from './HistoryPage';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeDistribution, setActiveDistribution] = useState('facing');
  const [coeffView, setCoeffView] = useState('absolute');
  const history = useStore(state => state.history);
  const clearHistory = useStore(state => state.clearHistory);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['datasetStats'],
    queryFn: getDatasetStats,
    staleTime: Infinity,
  });

  const { data: modelInfo, isLoading: modelLoading } = useQuery({
    queryKey: ['modelInfo'],
    queryFn: getModelInfo,
    staleTime: Infinity,
  });

  const loading = statsLoading || modelLoading;
  
  // Only mount heavy SVGs after the page transition has finished
  const isChartMounted = useDeferredMount(400);

  // Use real scatter data from the backend and calculate best fit line
  const scatterData = React.useMemo(() => {
    if (!stats || !stats.scatter_data) return [];
    
    // Sort by area for the line chart to render properly from left to right
    const data = [...stats.scatter_data].sort((a, b) => a.area - b.area);
    
    // Calculate linear regression
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    const n = data.length;
    
    data.forEach(p => {
      sumX += p.area;
      sumY += p.price;
      sumXY += (p.area * p.price);
      sumX2 += (p.area * p.area);
    });

    const m = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const c = (sumY - m * sumX) / n;

    return data.map(p => ({
      ...p,
      bestFitPrice: m * p.area + c
    }));
  }, [stats]);

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!stats || !modelInfo) {
    return <div className="text-center text-red-500 mt-10">Failed to load dashboard data from backend.</div>;
  }

  // Format data for Recharts
  const bedData = Object.entries(stats.bedroom_distribution).map(([k, v]) => ({ name: `${k} BHK`, value: v }));
  const facingData = Object.entries(stats.facing_distribution).map(([k, v]) => ({ name: k, value: v }));

  const coeffData = Object.entries(modelInfo.coefficients)
    .map(([k, v]) => ({
      name: k.replace('_Sqft', ''),
      value: coeffView === 'absolute' ? Math.abs(v) : v,
      originalValue: v
    }))
    .sort((a, b) => Math.abs(b.originalValue) - Math.abs(a.originalValue));

  const activePieData = activeDistribution === 'facing' ? facingData : bedData;

  const handleDownloadDataset = () => {
    window.location.href = getDatasetDownloadUrl();
  };

  return (
    <div className="space-y-8 relative z-10">
      {/* Decorative Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none -z-10"></div>
      <div className="absolute top-40 left-0 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-4000 pointer-events-none -z-10"></div>

      <div className="flex justify-between items-center flex-wrap gap-4 bg-white/40 backdrop-blur-md p-6 rounded-[2rem] border border-white/60 shadow-sm">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Analytics Dashboard</h1>
          <p className="text-muted-foreground font-medium mt-1">Model performance, dataset statistics, and history.</p>
        </div>
        <button onClick={handleDownloadDataset} className="inline-flex items-center justify-center rounded-xl text-sm font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border-2 border-primary/20 hover:border-primary/50 bg-white/80 hover:bg-white text-primary hover:text-emerald-700 shadow-sm h-11 py-2 px-6 cursor-pointer hover:-translate-y-0.5">
          <Download className="mr-2 h-4 w-4" /> Export Dataset (.xlsx)
        </button>
      </div>

      <div className="flex bg-white/50 backdrop-blur-xl border border-white/60 p-1.5 rounded-2xl w-full max-w-sm shadow-sm">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'overview' ? 'bg-white shadow-md text-primary' : 'text-slate-500 hover:text-slate-800'}`}
        >
          Model Overview
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'history' ? 'bg-white shadow-md text-primary' : 'text-slate-500 hover:text-slate-800'}`}
        >
          My History
        </button>
      </div>

      {activeTab === 'history' ? (
        <div className="mt-8">
          <HistoryPage />
        </div>
      ) : (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* KPI Cards */}
            <div className="group rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-xl shadow-lg p-6 hover:bg-white/80 transition-all hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-blue-100/80 rounded-2xl text-blue-600 group-hover:scale-110 transition-transform">
                  <Database className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Dataset Records</div>
              </div>
              <div className="text-4xl font-black text-slate-800">{stats.number_of_records}</div>
            </div>
            
            <div className="group rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-xl shadow-lg p-6 hover:bg-white/80 transition-all hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-emerald-100/80 rounded-2xl text-emerald-600 group-hover:scale-110 transition-transform">
                  <IndianRupee className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Average Price</div>
              </div>
              <div className="text-4xl font-black text-slate-800">₹{stats.average_price} <span className="text-xl text-slate-400">L</span></div>
            </div>
            
            <div className="group rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-xl shadow-lg p-6 hover:bg-white/80 transition-all hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-purple-100/80 rounded-2xl text-purple-600 group-hover:scale-110 transition-transform">
                  <Activity className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">Model R² Score</div>
              </div>
              <div className="text-4xl font-black text-emerald-500">{(modelInfo.r2_score * 100).toFixed(2)}%</div>
            </div>
            
            <div className="group rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-xl shadow-lg p-6 hover:bg-white/80 transition-all hover:-translate-y-1">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-amber-100/80 rounded-2xl text-amber-600 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider">RMSE</div>
              </div>
              <div className="text-4xl font-black text-slate-800">₹{modelInfo.rmse.toFixed(2)} <span className="text-xl text-slate-400">L</span></div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Feature Importance Chart */}
            <div className="rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-xl shadow-lg p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-6 bg-blue-500 rounded-full"></div>
                  Feature Importance
                </h3>
                <div className="flex bg-white/50 border border-slate-200/50 p-1 rounded-xl shadow-sm">
                  <button onClick={() => setCoeffView('absolute')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${coeffView === 'absolute' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>Absolute</button>
                  <button onClick={() => setCoeffView('raw')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${coeffView === 'raw' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'}`}>Raw</button>
                </div>
              </div>
              <div className="h-[320px]">
                {isChartMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={coeffData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#3b82f6" />
                        <stop offset="100%" stopColor="#60a5fa" />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={true} vertical={false} />
                    <XAxis type="number" tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                    <YAxis dataKey="name" type="category" width={80} tick={{ fill: '#475569', fontSize: 13, fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <Tooltip 
                      formatter={(val, name, props) => [props?.payload?.originalValue !== undefined ? props.payload.originalValue.toFixed(4) : val, 'Coefficient']}
                      contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                    />
                      <Bar dataKey="value" fill="url(#barGradient)" radius={[0, 8, 8, 0]} barSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/20 rounded-2xl animate-pulse">
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Dataset Distribution Chart */}
            <div className="rounded-[2rem] border border-white/60 bg-white/60 backdrop-blur-xl shadow-lg p-6 sm:p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="font-black text-xl text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-6 bg-emerald-500 rounded-full"></div>
                  Dataset Distribution
                </h3>
                <div className="flex bg-white/50 border border-slate-200/50 p-1 rounded-xl shadow-sm">
                  <button onClick={() => setActiveDistribution('facing')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeDistribution === 'facing' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}>Facing</button>
                  <button onClick={() => setActiveDistribution('bedrooms')} className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${activeDistribution === 'bedrooms' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-800'}`}>Bedrooms</button>
                </div>
              </div>
              <div className="h-[320px]">
                {isChartMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                    <Pie 
                      data={activePieData} 
                      cx="50%" cy="50%" 
                      labelLine={false} 
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                      outerRadius={110} 
                      innerRadius={60}
                      paddingAngle={4}
                      fill="#8884d8" 
                      dataKey="value"
                      stroke="none"
                    >
                      {activePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="hover:opacity-80 transition-opacity cursor-pointer" />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(8px)', boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }} 
                    />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/20 rounded-2xl animate-pulse">
                    <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>

            {/* Scatter Plot Chart (Full width) */}
            <div className="rounded-[2rem] border border-emerald-200/50 bg-white/70 backdrop-blur-xl shadow-lg p-6 sm:p-8 space-y-6 md:col-span-2 relative overflow-hidden">
              {/* Decorative glow */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none z-0"></div>

              <div className="relative z-10 space-y-2">
                <h3 className="font-black text-2xl text-slate-800 flex items-center gap-2">
                  <div className="w-2 h-8 bg-purple-500 rounded-full"></div>
                  Area vs. Price Correlation
                </h3>
                <p className="text-slate-500 font-medium pl-4">Sample distribution of property sizes vs valuation with best fit trend line.</p>
              </div>

              <div className="h-[400px] w-full">
                {isChartMounted ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={scatterData} margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                    <defs>
                      <linearGradient id="scatterGlow" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                    <XAxis
                      type="number"
                      dataKey="area"
                      name="Area"
                      unit=" sqft"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#94a3b8' }}
                      tickLine={{ stroke: '#94a3b8' }}
                      dy={10}
                    />
                    <YAxis
                      type="number"
                      dataKey="price"
                      name="Price"
                      unit=" L"
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#94a3b8' }}
                      tickLine={{ stroke: '#94a3b8' }}
                      dx={-10}
                    />
                    <ZAxis type="number" dataKey="z" range={[40, 200]} />
                    <Tooltip
                      cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1', strokeWidth: 1 }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid rgba(255,255,255,0.4)',
                        background: 'rgba(255,255,255,0.85)',
                        backdropFilter: 'blur(12px)',
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        color: '#0f172a',
                        fontWeight: '500'
                      }}
                    />
                    <Scatter
                      name="Properties"
                      dataKey="price"
                      fill="url(#scatterGlow)"
                      shape="circle"
                      stroke="#ffffff"
                      strokeWidth={1.5}
                      className="drop-shadow-sm"
                    />
                    <Line
                      type="linear"
                      dataKey="bestFitPrice"
                      name="Trend"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                      activeDot={false}
                    />
                    </ComposedChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-white/20 rounded-2xl animate-pulse">
                    <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
