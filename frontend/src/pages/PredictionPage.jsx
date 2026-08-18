import React, { useState } from 'react';
import { predictPrice } from '../services/api';
import { supabase } from '../services/supabase';
import { Calculator, AlertCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PredictionPage() {
  const [formData, setFormData] = useState({
    area_sqft: 1200,
    facing: 'North',
    floor: 5,
    car_parking_sqft: 150,
    bedrooms: 3
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'facing' ? value : Number(value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // API Call
      const data = await predictPrice(formData);
      setResult(data);

      // Try saving to supabase if authenticated (ignoring errors if not logged in)
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        await supabase.from('predictions').insert([{
          user_id: userData.user.id,
          ...formData,
          predicted_price_lakh: data.predicted_price_lakh,
          model_version: 'mlr-v1'
        }]);
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Failed to predict price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Price Prediction</h1>
        <p className="text-muted-foreground">Enter flat details to get an ML-based price estimate.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Area (sq ft)</label>
                <input 
                  type="number" 
                  name="area_sqft" 
                  value={formData.area_sqft} 
                  onChange={handleChange}
                  min="100"
                  required
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Facing</label>
                <select 
                  name="facing" 
                  value={formData.facing} 
                  onChange={handleChange}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Floor</label>
                <input 
                  type="number" 
                  name="floor" 
                  value={formData.floor} 
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Car Parking Area (sq ft)</label>
                <input 
                  type="number" 
                  name="car_parking_sqft" 
                  value={formData.car_parking_sqft} 
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Bedrooms</label>
                <select 
                  name="bedrooms" 
                  value={formData.bedrooms} 
                  onChange={handleChange}
                  className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                  <option value="5">5+</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4"
            >
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
              Predict Flat Price
            </button>

            {error && (
              <div className="p-3 bg-red-100 text-red-800 rounded-md text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </form>
        </div>

        {/* Result Area */}
        <div className="flex flex-col h-full">
          {result ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border rounded-xl p-8 shadow-sm text-center flex flex-col justify-center items-center flex-1 space-y-6"
            >
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Estimated Flat Price</h3>
                <div className="text-5xl font-extrabold text-primary">
                  ₹{result.predicted_price_lakh} Lakh
                </div>
                <div className="text-muted-foreground font-medium">
                  ₹{(result.predicted_price_lakh * 100000).toLocaleString('en-IN')}
                </div>
              </div>

              <div className="w-full border-t pt-6 text-left space-y-4">
                <h4 className="font-semibold text-sm">Input Summary</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-muted-foreground">Area:</div><div>{formData.area_sqft} sq ft</div>
                  <div className="text-muted-foreground">Facing:</div><div>{formData.facing}</div>
                  <div className="text-muted-foreground">Floor:</div><div>{formData.floor}</div>
                  <div className="text-muted-foreground">Parking:</div><div>{formData.car_parking_sqft} sq ft</div>
                  <div className="text-muted-foreground">Bedrooms:</div><div>{formData.bedrooms}</div>
                </div>
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md mt-4">
                  <span className="font-semibold block mb-1">Educational Disclaimer:</span>
                  This is an ML-based estimate generated from a small sample dataset and should not be treated as an actual market valuation.
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-muted/50 border border-dashed rounded-xl p-8 text-center flex flex-col justify-center items-center flex-1 text-muted-foreground h-full min-h-[400px]">
              <Calculator className="h-12 w-12 mb-4 opacity-20" />
              <p>Enter flat details and submit to see the prediction result here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
