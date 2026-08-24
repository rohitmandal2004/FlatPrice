import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../services/supabase';
import { Helmet } from 'react-helmet-async';
import { History, Trash2, Calendar, MapPin, Square, BedDouble, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const { user, isLoaded } = useUser();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && user) {
      fetchHistory();
    }
  }, [isLoaded, user]);

  const fetchHistory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('predictions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching history:", error);
      toast.error("Failed to load prediction history.");
    } else {
      setHistory(data || []);
    }
    setLoading(false);
  };

  const deletePrediction = async (id) => {
    const { error } = await supabase
      .from('predictions')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      toast.error("Failed to delete record.");
    } else {
      toast.success("Record deleted successfully.");
      setHistory(history.filter((item) => item.id !== id));
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse">Loading your history...</p>
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

      {history.length === 0 ? (
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
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
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
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
