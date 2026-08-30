import React from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../services/supabase';
import { Helmet } from 'react-helmet-async';
import { History, Trash2, Calendar, MapPin, Square, BedDouble, AlertCircle, Loader2, Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// --- Skeleton Component ---
const HistorySkeleton = () => (
  <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-sm relative overflow-hidden animate-pulse">
    <div className="flex items-center gap-2 mb-4">
      <div className="w-4 h-4 bg-slate-200 rounded-md"></div>
      <div className="w-32 h-3 bg-slate-200 rounded-md"></div>
    </div>
    <div className="mb-6">
      <div className="w-24 h-4 bg-emerald-100/50 rounded-md mb-3"></div>
      <div className="w-40 h-10 bg-slate-200 rounded-lg"></div>
    </div>
    <div className="grid grid-cols-2 gap-4">
      {[1, 2, 3, 4].map(i => (
        <div key={i} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl">
          <div className="w-6 h-6 bg-slate-200 rounded-lg shrink-0"></div>
          <div className="w-16 h-3 bg-slate-200 rounded-md"></div>
        </div>
      ))}
    </div>
  </div>
);

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const queryClient = useQueryClient();

  const { data: history = [], isLoading: loading } = useQuery({
    queryKey: ['history', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('predictions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        toast.error("Failed to load prediction history.");
        throw new Error(error.message);
      }
      return data || [];
    },
    enabled: isLoaded && !!user,
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('predictions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw new Error(error.message);
      return id;
    },
    onSuccess: (deletedId) => {
      toast.success("Record deleted successfully.");
      queryClient.setQueryData(['history', user.id], (old) => 
        old ? old.filter((item) => item.id !== deletedId) : []
      );
    },
    onError: () => {
      toast.error("Failed to delete record.");
    }
  });

  const deletePrediction = (id) => {
    deleteMutation.mutate(id);
  };

  const handleShare = (item) => {
    const text = `I just valued a ${item.bedrooms} BHK flat on Floor ${item.floor} facing ${item.facing} at ₹${item.predicted_price_lakh} Lakhs using AI! Check out FlatPrice.`;
    if (navigator.share) {
      navigator.share({ title: 'FlatPrice AI', text })
        .catch(console.error);
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex justify-center min-h-[50vh] items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Calculate personal analytics
  const totalPredictions = history.length;
  const averagePrice = totalPredictions > 0 
    ? (history.reduce((sum, item) => sum + item.predicted_price_lakh, 0) / totalPredictions).toFixed(2)
    : 0;
  const highestPrice = totalPredictions > 0 
    ? Math.max(...history.map(item => item.predicted_price_lakh)).toFixed(2)
    : 0;
  
  const bhkCounts = history.reduce((acc, item) => {
    acc[item.bedrooms] = (acc[item.bedrooms] || 0) + 1;
    return acc;
  }, {});
  const mostCommonBHK = totalPredictions > 0 
    ? Object.keys(bhkCounts).reduce((a, b) => bhkCounts[a] > bhkCounts[b] ? a : b)
    : '-';

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 relative z-10">
      <Helmet>
        <title>My History | FlatPredict AI</title>
      </Helmet>
      
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold flex items-center gap-3">
          <History className="h-8 w-8 text-primary" />
          Prediction History
        </h1>
        <p className="text-muted-foreground mt-2">
          View and manage all your past flat price estimates.
        </p>
      </div>

      {!loading && history.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Predictions</span>
            <span className="text-3xl font-black text-slate-800">{totalPredictions}</span>
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Average Value</span>
            <span className="text-2xl font-black text-emerald-600">₹{averagePrice}L</span>
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Highest Value</span>
            <span className="text-2xl font-black text-emerald-600">₹{highestPrice}L</span>
          </div>
          <div className="bg-white/60 backdrop-blur-xl rounded-[1.5rem] p-4 border border-white/60 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Top Config</span>
            <span className="text-3xl font-black text-blue-600">{mostCommonBHK} <span className="text-base text-blue-400">BHK</span></span>
          </div>
        </motion.div>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <HistorySkeleton />
          <HistorySkeleton />
          <HistorySkeleton />
        </div>
      ) : history.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-12 text-center shadow-lg flex flex-col items-center">
          <div className="h-20 w-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
            <History className="h-10 w-10 text-slate-400" />
          </div>
          <h3 className="text-xl font-black mb-2 text-slate-800">No history found</h3>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            You haven't made any predictions yet. Head over to the predictor to get started!
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {history.map((item, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              key={item.id}
              className="bg-white/80 backdrop-blur-xl border border-slate-100 rounded-[2rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative group flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100 shadow-inner">
                    <Calendar className="h-3 w-3" />
                    {new Date(item.created_at).toLocaleDateString(undefined, {
                      year: 'numeric', month: 'short', day: 'numeric'
                    })}
                  </div>
                  
                  <div className="flex gap-1.5">
                    <button 
                      onClick={() => handleShare(item)}
                      className="p-1.5 bg-slate-50 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-xl transition-colors border border-slate-100"
                      title="Share record"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                    <button 
                      onClick={() => deletePrediction(item.id)}
                      className="p-1.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors border border-slate-100"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mb-6 flex flex-col">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1 drop-shadow-sm">Predicted Value</span>
                  <div className="text-4xl font-black text-slate-800 tracking-tight">
                    ₹{item.predicted_price_lakh} <span className="text-xl text-slate-400 font-bold">L</span>
                  </div>
                  <div className="text-xs font-bold text-slate-400 mt-1 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                    ₹{Math.round((item.predicted_price_lakh * 100000) / item.area_sqft).toLocaleString('en-IN')} / sq.ft
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100/80">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-600">
                      <Square className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-700 text-xs">{item.area_sqft} <span className="font-medium text-slate-500">sqft</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-600">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-700 text-xs capitalize">{item.facing}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-600">
                      <BedDouble className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-700 text-xs">{item.bedrooms} <span className="font-medium text-slate-500">BHK</span></span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-600">
                      <AlertCircle className="h-4 w-4" />
                    </div>
                    <span className="font-bold text-slate-700 text-xs">Floor {item.floor}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
