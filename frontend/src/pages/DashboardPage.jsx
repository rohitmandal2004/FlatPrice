import React, { useEffect, useState } from 'react';
import { getDatasetStats, getModelInfo } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Loader2 } from 'lucide-react';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!stats || !modelInfo) {
    return <div className="text-center text-red-500 mt-10">Failed to load dashboard data from backend.</div>;
  }

  // Format data for Recharts
  const bedData = Object.entries(stats.bedroom_distribution).map(([k, v]) => ({ name: `${k} BHK`, value: v }));
  const facingData = Object.entries(stats.facing_distribution).map(([k, v]) => ({ name: k, value: v }));
  const coeffData = Object.entries(modelInfo.coefficients).map(([k, v]) => ({ name: k.replace('_Sqft', ''), value: v })).sort((a,b) => Math.abs(b.value) - Math.abs(a.value));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Model performance and dataset statistics.</p>
      </div>

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
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg">Feature Importance (Coefficients)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coeffData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} fontSize={12} />
                <Tooltip formatter={(val) => val.toFixed(4)} />
                <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 space-y-4">
          <h3 className="font-semibold text-lg">Dataset Facing Distribution</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={facingData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} outerRadius={100} fill="#8884d8" dataKey="value">
                  {facingData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
