import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { predictPrice } from '../services/api';
import { supabase } from '../services/supabase';
import { Calculator, AlertCircle, Loader2, Copy, Download, TrendingUp, TrendingDown, Info, IndianRupee, PieChart, LineChart as LineChartIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../hooks/useStore';
import toast from 'react-hot-toast';

export default function PredictionPage() {
  const { user } = useUser();
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

  // Analytics State
  const [sliderArea, setSliderArea] = useState(1200);
  const [emiState, setEmiState] = useState({ downPayment: 20, interestRate: 8.5, tenure: 20 });
  const [roiState, setRoiState] = useState({ holdYears: 5, appreciationRate: 6 });

  // Sync slider with form
  React.useEffect(() => {
    setSliderArea(formData.area_sqft);
  }, [formData.area_sqft]);

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

      // Try saving to supabase if authenticated (ignoring errors if not logged in)
      if (user) {
        await supabase.from('predictions').insert([{
          user_id: user.id,
          ...formData,
          predicted_price_lakh: data.predicted_price_lakh,
          model_version: 'mlr-v1'
        }]);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to predict price';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Predicted Flat Price: ₹${result.predicted_price_lakh} Lakh\nArea: ${formData.area_sqft} sq ft\nBedrooms: ${formData.bedrooms}\nFacing: ${formData.facing}`;
    navigator.clipboard.writeText(text);
    toast.success("Result copied to clipboard!");
  };

  const handlePrint = async () => {
    const element = document.getElementById('prediction-report');
    if (!element) return;

    const toastId = toast.loading("Generating PDF Report...");

    try {
      // Dynamically import html2pdf to avoid Vite/SSR namespace issues
      const html2pdfModule = (await import('html2pdf.js')).default;

      const opt = {
        margin: 10,
        filename: 'FlatPredict_Report.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdfModule().set(opt).from(element).save();
      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error(`Failed: ${err.message || "Unknown error"}`, { id: toastId });
    }
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

  const getWhatIfPrice = () => {
    if (!result) return 0;
    const ratio = sliderArea / formData.area_sqft;
    return (result.predicted_price_lakh * ratio).toFixed(2);
  };

  const calculateEMI = () => {
    if (!result) return 0;
    const principal = (result.predicted_price_lakh * 100000) * (1 - emiState.downPayment / 100);
    const r = (emiState.interestRate / 12) / 100;
    const n = emiState.tenure * 12;
    if (r === 0) return Math.round(principal / n);
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi).toLocaleString('en-IN');
  };

  const calculateROI = () => {
    if (!result) return { futureValue: 0, profit: 0 };
    const currentVal = result.predicted_price_lakh;
    const futureVal = currentVal * Math.pow(1 + (roiState.appreciationRate / 100), roiState.holdYears);
    return {
      futureValue: futureVal.toFixed(2),
      profit: (futureVal - currentVal).toFixed(2)
    };
  };

  const generateHistoricalData = () => {
    if (!result) return [];
    const currentPrice = result.predicted_price_lakh;
    const data = [];
    const currentYear = new Date().getFullYear();
    for (let i = 5; i >= 0; i--) {
      const randomFluctuation = 1 - (Math.random() * 0.05); // simulate market variation
      const pastPrice = currentPrice / Math.pow(1.06, i) * randomFluctuation;
      data.push({
        year: currentYear - i,
        price: Number(pastPrice.toFixed(2))
      });
    }
    data[data.length - 1].price = Number(currentPrice.toFixed(2));
    return data;
  };

  return (
    <div className="relative min-h-screen w-full pb-12 overflow-hidden">
      {/* Background Animated Blobs to remove blank spaces */}
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-12 relative z-10 px-4 pt-6">
        <Helmet>
          <title>Predict Flat Price | AI Lab</title>
          <meta name="description" content="Get an ML-based price estimate for your flat instantly." />
        </Helmet>
        
        {/* Header */}
        <div className="text-center space-y-4">

          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground"
          >
            Discover True Property Value
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl font-medium"
          >
            Enter your flat details to get an instant, machine-learning based valuation tailored to current market trends.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          {/* Form Section */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-5 bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2rem] p-6 sm:p-8 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="space-y-5">
                <div className="group/input">
                  <label className="block text-sm font-bold mb-2 text-foreground/80 group-hover/input:text-primary transition-colors">Area (sq ft)</label>
                  <input
                    type="number"
                    name="area_sqft"
                    value={formData.area_sqft}
                    onChange={handleChange}
                    min="100"
                    required
                    className="w-full h-12 rounded-xl border border-input/60 bg-white/50 px-4 py-2 text-base font-medium shadow-sm transition-all focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="group/input">
                    <label className="block text-sm font-bold mb-2 text-foreground/80 group-hover/input:text-primary transition-colors">Facing</label>
                    <select
                      name="facing"
                      value={formData.facing}
                      onChange={handleChange}
                      className="w-full h-12 rounded-xl border border-input/60 bg-white/50 px-4 py-2 text-base font-medium shadow-sm transition-all focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none appearance-none cursor-pointer"
                    >
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                    </select>
                  </div>

                  <div className="group/input">
                    <label className="block text-sm font-bold mb-2 text-foreground/80 group-hover/input:text-primary transition-colors">Floor</label>
                    <input
                      type="number"
                      name="floor"
                      value={formData.floor}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full h-12 rounded-xl border border-input/60 bg-white/50 px-4 py-2 text-base font-medium shadow-sm transition-all focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                    />
                  </div>
                </div>

                <div className="group/input">
                  <label className="block text-sm font-bold mb-2 text-foreground/80 group-hover/input:text-primary transition-colors">Car Parking Area (sq ft)</label>
                  <input
                    type="number"
                    name="car_parking_sqft"
                    value={formData.car_parking_sqft}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full h-12 rounded-xl border border-input/60 bg-white/50 px-4 py-2 text-base font-medium shadow-sm transition-all focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none"
                  />
                </div>

                <div className="group/input">
                  <label className="block text-sm font-bold mb-2 text-foreground/80 group-hover/input:text-primary transition-colors">Bedrooms</label>
                  <select
                    name="bedrooms"
                    value={formData.bedrooms}
                    onChange={handleChange}
                    className="w-full h-12 rounded-xl border border-input/60 bg-white/50 px-4 py-2 text-base font-medium shadow-sm transition-all focus:bg-white focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none appearance-none cursor-pointer"
                  >
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4 BHK</option>
                    <option value="5">5+ BHK</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full relative group/btn overflow-hidden inline-flex items-center justify-center rounded-xl text-lg font-bold text-primary-foreground shadow-[0_8px_30px_rgb(185,209,117,0.4)] transition-all hover:shadow-[0_8px_40px_rgb(185,209,117,0.6)] hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 h-14 bg-primary"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out"></div>
                <span className="relative flex items-center gap-2">
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Calculator className="h-5 w-5" />}
                  {loading ? 'Analyzing Market...' : 'Predict Property Value'}
                </span>
              </button>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-50 text-red-600 rounded-xl text-sm flex items-start gap-3 border border-red-100"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p className="font-bold">{error}</p>
                </motion.div>
              )}
            </form>
          </motion.div>

          {/* Result Area */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-7 flex flex-col h-full"
          >
            {loading ? (
              <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-10 shadow-2xl flex flex-col justify-center items-center flex-1 space-y-8 min-h-[500px]">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-400/20 rounded-full animate-ping"></div>
                  <div className="relative bg-emerald-50 p-5 rounded-full shadow-inner">
                    <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
                  </div>
                </div>
                <div className="space-y-4 w-full max-w-md text-center">
                  <h3 className="text-2xl font-black text-foreground/80 animate-pulse">Running ML Models...</h3>
                  <div className="w-full h-3 bg-white/50 rounded-full overflow-hidden shadow-inner">
                    <div className="h-full bg-gradient-to-r from-primary to-emerald-400 animate-pulse w-2/3 rounded-full"></div>
                  </div>
                </div>
              </div>
            ) : result ? (
              <motion.div
                id="prediction-report"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white/80 backdrop-blur-2xl border border-white/60 shadow-2xl rounded-[2rem] p-8 sm:p-10 flex flex-col flex-1 space-y-8 relative overflow-hidden"
              >
                {/* Decorative background glow in result */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

                {/* Header Actions */}
                <div className="flex justify-between items-center print-hide relative z-10">
                  <h3 className="text-sm font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    Valuation Report
                  </h3>
                  <div className="flex gap-3">
                    <button type="button" onClick={handleCopy} className="p-3 bg-white/60 hover:bg-white border border-white/80 rounded-xl text-foreground/70 hover:text-foreground shadow-sm transition-all hover:-translate-y-0.5" title="Copy Result">
                      <Copy className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={handlePrint} className="p-3 bg-white/60 hover:bg-white border border-white/80 rounded-xl text-foreground/70 hover:text-foreground shadow-sm transition-all hover:-translate-y-0.5" title="Save as PDF">
                      <Download className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Main Price */}
                <div className="text-center space-y-4 relative z-10 py-6">
                  <div className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Estimated Property Value</div>
                  <div className="text-6xl sm:text-7xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-emerald-700 leading-tight">
                    ₹{result.predicted_price_lakh} <span className="text-3xl text-slate-500 font-bold">Lakh</span>
                  </div>
                  <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-5 py-2 rounded-full shadow-sm">
                    <TrendingUp className="h-4 w-4" />
                    Range: ₹{getPriceRange(result.predicted_price_lakh).min}L - ₹{getPriceRange(result.predicted_price_lakh).max}L
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-6 border-y border-border/30 py-8 relative z-10">
                  <div className="bg-white/50 rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-2 tracking-wide">Price per Sq.Ft</div>
                    <div className="font-black text-3xl">₹{getPricePerSqFt()}</div>
                  </div>
                  <div className="bg-white/50 rounded-2xl p-5 border border-white/60 shadow-sm hover:shadow-md transition-shadow">
                    <div className="text-xs text-muted-foreground uppercase font-bold mb-2 tracking-wide">Market Comparison</div>
                    <div className="font-bold flex flex-col">
                      <span className={getMarketComparison().trend === 'up' ? 'text-emerald-600 text-lg' : getMarketComparison().trend === 'down' ? 'text-rose-600 text-lg' : 'text-blue-600 text-lg'}>
                        {getMarketComparison().text}
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground mt-1">{getMarketComparison().value}</span>
                    </div>
                  </div>
                </div>

                {/* Key Drivers */}
                <div className="space-y-4 relative z-10">
                  <h4 className="font-black text-slate-800 flex items-center gap-2 text-lg">
                    <Info className="h-5 w-5 text-emerald-600" />
                    Key Price Drivers
                  </h4>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {getKeyDrivers().map((driver, idx) => {
                      const DriverIcon = driver.icon;
                      return (
                        <div key={idx} className="flex items-center gap-3 text-sm bg-white/60 hover:bg-white transition-colors p-4 rounded-xl border border-white/80 shadow-sm">
                          <div className={`p-2.5 rounded-lg bg-white shadow-sm ${driver.color}`}>
                            <DriverIcon className="h-5 w-5" />
                          </div>
                          <span className="font-bold">{driver.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* What-If Simulator */}
                <div className="w-full bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6 sm:p-8 space-y-6 print-hide relative z-10 shadow-inner">
                  <div className="flex justify-between items-center">
                    <h4 className="font-black text-slate-800 text-lg">Area Simulator</h4>
                    <div className="text-2xl font-black text-emerald-700">₹{getWhatIfPrice()} L</div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <span>{Math.max(500, formData.area_sqft - 500)} sq ft</span>
                      <span className="text-slate-800 bg-white px-4 py-1.5 rounded-full shadow-sm border border-slate-200">{sliderArea} sq ft</span>
                      <span>{formData.area_sqft + 1000} sq ft</span>
                    </div>
                    <input
                      type="range"
                      min={Math.max(500, formData.area_sqft - 500)}
                      max={formData.area_sqft + 1000}
                      value={sliderArea}
                      onChange={(e) => setSliderArea(Number(e.target.value))}
                      className="w-full h-3 bg-white/80 border border-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600 shadow-inner"
                    />
                  </div>
                </div>

              </motion.div>
            ) : (
              <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-8 text-center flex flex-col justify-center items-center flex-1 text-slate-500 min-h-[500px] shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110 pointer-events-none"></div>
                <div className="w-28 h-28 mb-6 rounded-full bg-emerald-50 flex items-center justify-center shadow-inner">
                  <Calculator className="h-12 w-12 text-emerald-600 opacity-60" />
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-3">Ready to Predict</h3>
                <p className="max-w-sm font-medium text-lg">Fill in the property details and hit predict to see a detailed valuation report.</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Advanced Analytics Section */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full space-y-8 pt-12 print-hide relative z-10"
          >
            <div className="text-center space-y-3 mb-12">
              <span className="px-5 py-2 rounded-full bg-emerald-500/10 text-emerald-600 text-sm font-bold tracking-wide border border-emerald-500/20 inline-block backdrop-blur-md">
                Investment Insights
              </span>
              <h2 className="text-4xl font-black tracking-tight">Advanced Analytics</h2>
              <p className="text-muted-foreground text-xl font-medium">Deep dive into EMIs, returns, and historical performance.</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* EMI Calculator */}
              <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-emerald-100 rounded-2xl text-emerald-700 shadow-inner">
                    <IndianRupee className="h-7 w-7" />
                  </div>
                  <h3 className="font-black text-2xl text-slate-800">EMI Calculator</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider">Down Payment</span>
                      <span className="font-black">{emiState.downPayment}% <span className="text-muted-foreground font-semibold">(₹{((result.predicted_price_lakh * emiState.downPayment) / 100).toFixed(2)}L)</span></span>
                    </div>
                    <input type="range" min="10" max="90" step="5" value={emiState.downPayment} onChange={(e) => setEmiState({ ...emiState, downPayment: Number(e.target.value) })} className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider">Interest Rate</span>
                      <span className="font-black">{emiState.interestRate}%</span>
                    </div>
                    <input type="range" min="5" max="15" step="0.1" value={emiState.interestRate} onChange={(e) => setEmiState({ ...emiState, interestRate: Number(e.target.value) })} className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider">Loan Tenure</span>
                      <span className="font-black">{emiState.tenure} Years</span>
                    </div>
                    <input type="range" min="5" max="30" step="1" value={emiState.tenure} onChange={(e) => setEmiState({ ...emiState, tenure: Number(e.target.value) })} className="w-full h-2 bg-primary/20 rounded-lg appearance-none cursor-pointer accent-primary" />
                  </div>
                  <div className="pt-6 border-t border-slate-200 text-center space-y-2">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">Estimated Monthly EMI</div>
                    <div className="text-4xl font-black text-emerald-700">₹{calculateEMI()}</div>
                  </div>
                </div>
              </div>

              {/* ROI Projector */}
              <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-emerald-500/10 rounded-2xl text-emerald-600 shadow-inner">
                    <PieChart className="h-7 w-7" />
                  </div>
                  <h3 className="font-black text-2xl">Investment ROI</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider">Holding Period</span>
                      <span className="font-black">{roiState.holdYears} Years</span>
                    </div>
                    <input type="range" min="1" max="20" step="1" value={roiState.holdYears} onChange={(e) => setRoiState({ ...roiState, holdYears: Number(e.target.value) })} className="w-full h-2 bg-emerald-500/20 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="font-bold text-muted-foreground uppercase tracking-wider">Expected Growth</span>
                      <span className="font-black">{roiState.appreciationRate}% / yr</span>
                    </div>
                    <input type="range" min="2" max="15" step="0.5" value={roiState.appreciationRate} onChange={(e) => setRoiState({ ...roiState, appreciationRate: Number(e.target.value) })} className="w-full h-2 bg-emerald-500/20 rounded-lg appearance-none cursor-pointer accent-emerald-500" />
                  </div>
                  <div className="pt-12 border-t border-border/30 text-center space-y-3">
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Future Est. Value</div>
                    <div className="text-4xl font-black text-emerald-600 drop-shadow-sm">₹{calculateROI().futureValue} L</div>
                    <div className="text-sm font-bold text-emerald-700 bg-emerald-100/80 inline-block px-5 py-2 rounded-full border border-emerald-200/50 shadow-sm">
                      + ₹{calculateROI().profit} L Profit
                    </div>
                  </div>
                </div>
              </div>

              {/* Historical Trend Chart */}
              <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-[2rem] p-8 shadow-xl hover:shadow-2xl transition-all duration-300 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="p-3.5 bg-blue-500/10 rounded-2xl text-blue-600 shadow-inner">
                    <LineChartIcon className="h-7 w-7" />
                  </div>
                  <h3 className="font-black text-2xl">Price Trend</h3>
                </div>
                <div className="h-[280px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generateHistoricalData()} margin={{ top: 10, right: 20, bottom: 5, left: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.5} />
                      <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 600 }} dy={15} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#64748b', fontWeight: 600 }} dx={-10} domain={['dataMin - 5', 'dataMax + 5']} />
                      <Tooltip
                        formatter={(value) => [`₹${value} L`, 'Price']}
                        contentStyle={{ borderRadius: '16px', border: '1px solid rgba(255,255,255,0.6)', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', fontWeight: 'bold' }}
                      />
                      <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={5} dot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#fff' }} activeDot={{ r: 9, fill: '#2563eb' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

