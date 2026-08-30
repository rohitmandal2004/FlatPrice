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
              className="bg-white/60 backdrop-blur-xl border border-white/60 rounded-[2rem] p-6 shadow-lg hover:bg-white/80 transition-all hover:-translate-y-1 relative overflow-hidden group"
            >
              {/* Background Layout Image */}
              <div 
                className="absolute inset-0 z-0 opacity-10 group-hover:opacity-20 transition-opacity duration-500 bg-center bg-no-repeat bg-contain"
                style={{ backgroundImage: `url(/floor_plan_${item.bedrooms}bhk.jpg)`, backgroundPosition: 'right bottom', backgroundSize: '70%' }}
              />

              <div className="relative z-10">
                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button 
                  onClick={() => handleShare(item)}
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-2xl transition-colors shadow-sm"
                  title="Share record"
                >
                  <Share2 className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => deletePrediction(item.id)}
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-2xl transition-colors shadow-sm"
                  title="Delete record"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mb-4 uppercase tracking-wider">
                <Calendar className="h-4 w-4" />
                {new Date(item.created_at).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                })}
              </div>

              <div className="mb-6">
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-100/50 px-2 py-1 rounded-md">Predicted Price</span>
                <div className="text-4xl font-black text-slate-800 mt-2">
                  ₹{item.predicted_price_lakh} <span className="text-2xl text-slate-400">L</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-white/50 p-4 rounded-2xl border border-white/60 shadow-inner">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-100/80 rounded-lg text-blue-600">
                    <Square className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-slate-600">{item.area_sqft} sq ft</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-purple-100/80 rounded-lg text-purple-600">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-slate-600 capitalize">{item.facing}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-100/80 rounded-lg text-emerald-600">
                    <BedDouble className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-slate-600">{item.bedrooms} BHK</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-100/80 rounded-lg text-amber-600">
                    <AlertCircle className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-bold text-slate-600">Floor {item.floor}</span>
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
