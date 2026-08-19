import React, { useState } from 'react';
import { predictPrice } from '../services/api';
import { supabase } from '../services/supabase';
import { Calculator, AlertCircle, Loader2, Copy, Download, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useStore } from '../hooks/useStore';

export default function PredictionPage() {
  const setLastPrediction = useStore((state) => state.setLastPrediction);
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
      setLastPrediction(data);
      toast.success('Prediction generated successfully!');

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
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to predict price';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Predicted Flat Price: ₹${result.predicted_price_lakh} Lakh\nArea: ${formData.area_sqft} sq ft\nBedrooms: ${formData.bedrooms}\nFacing: ${formData.facing}`;
    navigator.clipboard.writeText(text);
    toast.success("Prediction copied to clipboard!");
  };

  const handlePrint = () => {
    window.print();
  };

  const getPriceRange = (price) => {
    return {
      min: (price * 0.95).toFixed(2),
      max: (price * 1.05).toFixed(2)
    };
  };

  const getPricePerSqFt = () => {
    if (!result) return 0;
    return Math.round((result.predicted_price_lakh * 100000) / formData.area_sqft).toLocaleString('en-IN');
  };

  const getMarketComparison = () => {
    // Mock logic based on price per sqft
    const ppsqft = (result.predicted_price_lakh * 100000) / formData.area_sqft;
    if (ppsqft > 6000) return { text: "Premium Market Value", trend: "up", value: "+12% vs city avg" };
    if (ppsqft < 4000) return { text: "Below Market Average", trend: "down", value: "-8% vs city avg" };
    return { text: "Standard Market Value", trend: "stable", value: "Aligned with city avg" };
  };

  const getKeyDrivers = () => {
    const drivers = [];
    if (formData.floor > 10) drivers.push({ icon: TrendingUp, text: 'High Floor Premium', color: 'text-emerald-500' });
    if (formData.area_sqft > 2000) drivers.push({ icon: TrendingUp, text: 'Large Area Premium', color: 'text-emerald-500' });
    if (formData.car_parking_sqft === 0) drivers.push({ icon: TrendingDown, text: 'No Parking Discount', color: 'text-rose-500' });
    if (formData.facing === 'East' || formData.facing === 'North') drivers.push({ icon: TrendingUp, text: 'Vastu Compliant Facing', color: 'text-emerald-500' });
    
    // Fallback if none matched
    if (drivers.length === 0) drivers.push({ icon: Info, text: 'Standard Property Traits', color: 'text-blue-500' });
    
    return drivers.slice(0, 2); // Show max 2 drivers
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Helmet>
        <title>Predict Flat Price | AI Lab</title>
        <meta name="description" content="Get an ML-based price estimate for your flat instantly." />
      </Helmet>
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
          {loading ? (
            <div className="bg-card border rounded-xl p-8 shadow-sm flex flex-col justify-center items-center flex-1 space-y-6">
              <div className="w-48 h-6 bg-muted animate-pulse rounded"></div>
              <div className="w-64 h-16 bg-muted animate-pulse rounded"></div>
              <div className="w-32 h-6 bg-muted animate-pulse rounded"></div>
              <div className="w-full border-t pt-6 mt-4 space-y-4">
                 <div className="w-full h-4 bg-muted animate-pulse rounded"></div>
                 <div className="w-3/4 h-4 bg-muted animate-pulse rounded"></div>
                 <div className="w-full h-4 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          ) : result ? (
            <motion.div 
              id="prediction-report"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card border rounded-xl p-8 shadow-sm flex flex-col flex-1 space-y-6 relative"
            >
              {/* Header Actions */}
              <div className="flex justify-between items-center print-hide">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Prediction Report</h3>
                <div className="flex gap-2">
                  <button type="button" onClick={handleCopy} className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Copy Result">
                    <Copy className="h-4 w-4" />
                  </button>
                  <button type="button" onClick={handlePrint} className="p-2 hover:bg-muted rounded-md text-muted-foreground hover:text-foreground transition-colors cursor-pointer" title="Save as PDF">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Main Price */}
              <div className="text-center space-y-2">
                <div className="text-4xl md:text-5xl font-extrabold text-primary break-all">
                  ₹{result.predicted_price_lakh} <span className="text-2xl text-muted-foreground font-semibold">Lakh</span>
                </div>
                <div className="text-sm font-medium text-muted-foreground bg-muted inline-block px-3 py-1 rounded-full">
                  Range: ₹{getPriceRange(result.predicted_price_lakh).min}L - ₹{getPriceRange(result.predicted_price_lakh).max}L
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 border-y py-6">
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase">Price per Sq.Ft</div>
                  <div className="font-semibold text-lg">₹{getPricePerSqFt()}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-muted-foreground uppercase">Market Comparison</div>
                  <div className="font-semibold text-sm flex flex-col">
                    <span className={getMarketComparison().trend === 'up' ? 'text-emerald-500' : getMarketComparison().trend === 'down' ? 'text-rose-500' : 'text-blue-500'}>
                      {getMarketComparison().text}
                    </span>
                    <span className="text-xs text-muted-foreground">{getMarketComparison().value}</span>
                  </div>
                </div>
              </div>

              {/* Key Drivers */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Key Price Drivers</h4>
                <div className="space-y-2">
                  {getKeyDrivers().map((driver, idx) => {
                    const DriverIcon = driver.icon;
                    return (
                      <div key={idx} className="flex items-center gap-2 text-sm bg-muted/50 p-3 rounded-md border border-border/50">
                        <DriverIcon className={`h-5 w-5 ${driver.color}`} />
                        <span className="font-medium">{driver.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary & Disclaimer */}
              <div className="w-full pt-4 space-y-4">
                <h4 className="font-semibold text-sm">Input Summary</h4>
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm bg-muted/30 p-4 rounded-lg">
                  <div className="text-muted-foreground">Area:</div><div className="font-medium">{formData.area_sqft} sq ft</div>
                  <div className="text-muted-foreground">Facing:</div><div className="font-medium">{formData.facing}</div>
                  <div className="text-muted-foreground">Floor:</div><div className="font-medium">{formData.floor}</div>
                  <div className="text-muted-foreground">Parking:</div><div className="font-medium">{formData.car_parking_sqft} sq ft</div>
                  <div className="text-muted-foreground">Bedrooms:</div><div className="font-medium">{formData.bedrooms}</div>
                </div>
                <div className="text-xs text-muted-foreground bg-muted p-3 rounded-md mt-4 print-hide">
                  <span className="font-semibold block mb-1">Educational Disclaimer:</span>
                  This is a mock ML estimate generated for demonstration and should not be treated as actual market valuation.
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

