import React, { useEffect, useState } from 'react';
import { getDatasetStats, getModelInfo, getDatasetDownloadUrl } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import { Loader2, Download, History, Trash2 } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import HistoryPage from './HistoryPage';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDistribution, setActiveDistribution] = useState('facing'); // 'facing' | 'bedrooms'
  const [coeffView, setCoeffView] = useState('absolute'); // 'absolute' | 'raw'
  const history = useStore(state => state.history);
  const clearHistory = useStore(state => state.clearHistory);

  useEffect(() => {
    async function loadData() {
      try {
        const [statsData, modelData] = await Promise.all([
          getDatasetStats(),
          getModelInfo()
        ]);
        setStats(statsData);
        setModelInfo(modelData);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Generate mock scatter data for Area vs Price
  const scatterData = React.useMemo(() => {
    if (!stats) return [];
    const data = [];
    const avgPrice = stats.average_price;
    const avgArea = 1200; // Mock average area
    for (let i = 0; i < 60; i++) {
      const area = Math.floor(Math.random() * (2500 - 500) + 500);
      const price = avgPrice * (area / avgArea) * (1 + (Math.random() * 0.4 - 0.2));
      // Z values for varying bubble sizes
      const importance = Math.floor(Math.random() * 100) + 20; 
      data.push({ area, price: Number(price.toFixed(2)), z: importance });
    }
    return data;
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
    .sort((a,b) => Math.abs(b.originalValue) - Math.abs(a.originalValue));

  const activePieData = activeDistribution === 'facing' ? facingData : bedData;

  const handleDownloadDataset = () => {
    window.location.href = getDatasetDownloadUrl();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Model performance, dataset statistics, and history.</p>
        </div>
        <button onClick={handleDownloadDataset} className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background border border-input hover:bg-accent hover:text-accent-foreground h-10 py-2 px-4 cursor-pointer">
          <Download className="mr-2 h-4 w-4" /> Export Dataset (.xlsx)
        </button>
      </div>

      <div className="flex bg-muted/50 p-1 rounded-xl w-full max-w-sm">
        <button 
          onClick={() => setActiveTab('overview')} 
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Model Overview
        </button>
        <button 
          onClick={() => setActiveTab('history')} 
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'history' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          My History
        </button>
      </div>

      {activeTab === 'history' ? (
        <div className="mt-8">
          <HistoryPage />
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* KPI Cards */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="text-sm font-medium text-muted-foreground mb-1">Dataset Records</div>
          <div className="text-3xl font-bold">{stats.number_of_records}</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="text-sm font-medium text-muted-foreground mb-1">Average Price</div>
          <div className="text-3xl font-bold">₹{stats.average_price} L</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="text-sm font-medium text-muted-foreground mb-1">Model R² Score</div>
          <div className="text-3xl font-bold text-green-600">{(modelInfo.r2_score * 100).toFixed(2)}%</div>
        </div>
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <div className="text-sm font-medium text-muted-foreground mb-1">RMSE</div>
          <div className="text-3xl font-bold">₹{modelInfo.rmse.toFixed(2)} L</div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Feature Importance Chart */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Feature Importance</h3>
            <div className="flex bg-muted p-1 rounded-md">
              <button onClick={() => setCoeffView('absolute')} className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer ${coeffView === 'absolute' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Absolute</button>
              <button onClick={() => setCoeffView('raw')} className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer ${coeffView === 'raw' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Raw</button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coeffData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} fontSize={12} />
                <Tooltip formatter={(val, name, props) => [props?.payload?.originalValue !== undefined ? props.payload.originalValue.toFixed(4) : val, 'Coefficient']} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Dataset Distribution Chart */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">Dataset Distribution</h3>
            <div className="flex bg-muted p-1 rounded-md">
              <button onClick={() => setActiveDistribution('facing')} className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer ${activeDistribution === 'facing' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Facing</button>
              <button onClick={() => setActiveDistribution('bedrooms')} className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors cursor-pointer ${activeDistribution === 'bedrooms' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>Bedrooms</button>
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={activePieData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {activePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Scatter Plot Chart (Full width) */}
        <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/50 shadow-sm p-6 space-y-6 md:col-span-2 relative overflow-hidden">
          {/* Decorative glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="space-y-1">
            <h3 className="font-bold text-xl text-emerald-950">Area vs. Price Correlation</h3>
            <p className="text-sm text-emerald-600/80 font-medium">Sample distribution of property sizes vs valuation</p>
          </div>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 10 }}>
                <defs>
                  <linearGradient id="scatterGlow" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#34d399" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  type="number" 
                  dataKey="area" 
                  name="Area" 
                  unit=" sqft" 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  type="number" 
                  dataKey="price" 
                  name="Price" 
                  unit=" L" 
                  tick={{ fontSize: 12, fill: '#64748b' }} 
                  axisLine={false}
                  tickLine={false}
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
                  data={scatterData} 
                  fill="url(#scatterGlow)" 
                  shape="circle"
                  stroke="#ffffff"
                  strokeWidth={1.5}
                  className="drop-shadow-sm"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
}
