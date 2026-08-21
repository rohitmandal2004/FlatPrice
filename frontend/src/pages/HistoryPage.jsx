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
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
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
        <div className="bg-card border rounded-2xl p-12 text-center shadow-sm flex flex-col items-center">
          <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <History className="h-10 w-10 text-muted-foreground opacity-50" />
          </div>
          <h3 className="text-xl font-bold mb-2">No history found</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
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
              className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => deletePrediction(item.id)}
                  className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-full transition-colors"
                  title="Delete record"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
                <Calendar className="h-4 w-4" />
                {new Date(item.created_at).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit'
                })}
              </div>

              <div className="mb-6">
                <span className="text-sm font-semibold text-primary uppercase tracking-wider">Predicted Price</span>
                <div className="text-3xl font-extrabold text-foreground mt-1">
                  ₹{item.predicted_price_lakh} Lakh
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-xl border border-muted/50">
                <div className="flex items-center gap-2">
                  <Square className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{item.area_sqft} sq ft</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium capitalize">{item.facing} Facing</span>
                </div>
                <div className="flex items-center gap-2">
                  <BedDouble className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{item.bedrooms} BHK</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Floor {item.floor}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
