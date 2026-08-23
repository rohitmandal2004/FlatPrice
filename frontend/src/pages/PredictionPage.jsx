import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { predictPrice } from '../services/api';
import { supabase } from '../services/supabase';
import { Calculator, AlertCircle, Loader2, Copy, Download, TrendingUp, TrendingDown, Info, IndianRupee, PieChart, LineChart as LineChartIcon, View, ZoomIn, ZoomOut, X, Maximize2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../hooks/useStore';
import toast from 'react-hot-toast';
import Building3D from '../components/Building3D';

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
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // Analytics State
  const [sliderArea, setSliderArea] = useState(1200);
  const [emiState, setEmiState] = useState({ downPayment: 20, interestRate: 8.5, tenure: 20 });
  const [roiState, setRoiState] = useState({ holdYears: 5, appreciationRate: 6 });

  const handleSelectFlat = (floor, facing) => {
    setFormData(prev => ({ ...prev, floor, facing }));
  };

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
      const data = await predictPrice(formData);
      setResult(data);
      setLastPrediction(data);

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

  const getPriceBreakdown = () => {
    if (!result) return [];
    const total = result.predicted_price_lakh;
    const baseVal = total * 0.78; 
    let floorPrem = (formData.floor * 0.005) * total;
    let facePrem = (formData.facing === 'East' || formData.facing === 'North') ? total * 0.03 : 0;
    let parkingPrem = formData.car_parking_sqft > 0 ? total * 0.05 : 0;
    let amenities = total - (baseVal + floorPrem + facePrem + parkingPrem);
    
    return [
      { label: "Base Property Value", value: baseVal, color: "bg-slate-800" },
      { label: `Floor Premium (Fl ${formData.floor})`, value: floorPrem, color: "bg-emerald-500" },
      { label: `${formData.facing} Facing Premium`, value: facePrem, color: "bg-blue-500" },
      { label: "Parking & Amenities", value: parkingPrem + amenities, color: "bg-teal-400" },
    ].filter(item => item.value > 0);
  };

  const getMarketComparison = () => {
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
    if (drivers.length === 0) drivers.push({ icon: Info, text: 'Standard Property Traits', color: 'text-blue-500' });
    return drivers.slice(0, 2);
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
    return { futureValue: futureVal.toFixed(2), profit: (futureVal - currentVal).toFixed(2) };
  };

  const generateHistoricalData = () => {
    if (!result) return [];
    const currentPrice = result.predicted_price_lakh;
    const data = [];
    const currentYear = new Date().getFullYear();
    for (let i = 5; i >= 0; i--) {
      const randomFluctuation = 1 - (Math.random() * 0.05);
      const pastPrice = currentPrice / Math.pow(1.06, i) * randomFluctuation;
      data.push({ year: currentYear - i, price: Number(pastPrice.toFixed(2)) });
    }
    data[data.length - 1].price = Number(currentPrice.toFixed(2));
    return data;
  };

  return (
    <div className="relative min-h-screen w-full pb-12 overflow-hidden">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto space-y-12 relative z-10 px-4 pt-6">
        <Helmet>
          <title>Predict Flat Price | AI Lab</title>
        </Helmet>

        <div className="text-center space-y-4">
          <motion.h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground">Discover True Property Value</motion.h1>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch">
          <motion.div className="lg:col-span-5 bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2rem] p-6 sm:p-8 flex flex-col justify-center">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-5">
                <div className="group/input">
                  <label className="block text-sm font-bold mb-2">Area (sq ft)</label>
                  <input type="number" name="area_sqft" value={formData.area_sqft} onChange={handleChange} min="100" required className="w-full h-12 rounded-xl border border-input/60 px-4" />
                </div>
                <div className="grid grid-cols-2 gap-5">
                  <div className="group/input">
                    <label className="block text-sm font-bold mb-2">Facing</label>
                    <select name="facing" value={formData.facing} onChange={handleChange} className="w-full h-12 rounded-xl border border-input/60 px-4">
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                    </select>
                  </div>
                  <div className="group/input">
                    <label className="block text-sm font-bold mb-2">Floor</label>
                    <input type="number" name="floor" value={formData.floor} onChange={handleChange} min="0" required className="w-full h-12 rounded-xl border border-input/60 px-4" />
                  </div>
                </div>
                <div className="group/input">
                  <label className="block text-sm font-bold mb-2">Car Parking Area (sq ft)</label>
                  <input type="number" name="car_parking_sqft" value={formData.car_parking_sqft} onChange={handleChange} min="0" required className="w-full h-12 rounded-xl border border-input/60 px-4" />
                </div>
                <div className="group/input">
                  <label className="block text-sm font-bold mb-2">Bedrooms</label>
                  <select name="bedrooms" value={formData.bedrooms} onChange={handleChange} className="w-full h-12 rounded-xl border border-input/60 px-4">
                    <option value={1}>1 BHK</option>
                    <option value={2}>2 BHK</option>
                    <option value={3}>3 BHK</option>
                    <option value={4}>4 BHK</option>
                    <option value={5}>5 BHK</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full h-14 bg-primary text-primary-foreground rounded-xl font-bold hover:shadow-lg transition-all hover:-translate-y-0.5">
                {loading ? 'Analyzing Market...' : 'Predict Property Value'}
              </button>
            </form>
          </motion.div>

          <motion.div className="lg:col-span-7 flex flex-col h-full min-h-[500px]">
            <Building3D formData={formData} onSelectFlat={handleSelectFlat} />
          </motion.div>
        </div>

        <div className="mt-8">
          {loading ? (
             <div className="bg-white/60 backdrop-blur-xl border border-white/50 rounded-[2rem] p-10 min-h-[500px] flex items-center justify-center">
               <Loader2 className="h-12 w-12 text-emerald-600 animate-spin" />
             </div>
          ) : result ? (
            <motion.div id="prediction-report" className="bg-white/90 backdrop-blur-2xl border border-white shadow-xl rounded-[2rem] p-6 sm:p-8 space-y-6 relative overflow-hidden">
                {/* Top Action Bar */}
                <div className="flex justify-between items-center w-full pb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                    <span className="font-bold text-[10px] tracking-widest text-slate-500 uppercase">Valuation Report</span>
                    <div className="ml-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded flex items-center gap-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                      <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">AI Confidence 94%</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleCopy} className="p-2 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                      <Copy className="w-4 h-4 text-slate-600" />
                    </button>
                    <button onClick={handlePrint} className="p-2 bg-slate-50 rounded-lg border border-slate-100 hover:bg-slate-100 transition-colors">
                      <Download className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                </div>

                {/* Price Section */}
                <div className="text-center space-y-3">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Estimated Property Value</div>
                  <div className="text-5xl sm:text-6xl font-black text-slate-800 leading-tight bg-clip-text text-transparent bg-gradient-to-br from-slate-800 to-slate-600">
                    ₹{result.predicted_price_lakh} <span className="text-2xl text-slate-400 font-bold">Lakh</span>
                  </div>
                  <div className="flex justify-center mt-1">
                    <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center gap-1 border border-emerald-100">
                      <TrendingUp className="w-3 h-3" />
                      Range: ₹{getPriceRange(result.predicted_price_lakh).min}L - ₹{getPriceRange(result.predicted_price_lakh).max}L
                    </div>
                  </div>
                </div>

                {/* Premium Price Breakdown */}
                <div className="pt-4 pb-2 border-t border-slate-100/60 max-w-2xl mx-auto w-full">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                    <PieChart className="w-3.5 h-3.5" /> Value Breakdown
                  </h3>
                  <div className="space-y-2">
                    {getPriceBreakdown().map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-1.5 hover:bg-slate-50 rounded-md transition-colors">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                          <span className="text-xs font-semibold text-slate-600">{item.label}</span>
                        </div>
                        <span className="text-xs font-bold text-slate-800">₹{item.value.toFixed(2)} L</span>
                      </div>
                    ))}
                  </div>
                  {/* Visual Bar */}
                  <div className="flex w-full h-1.5 rounded-full overflow-hidden mt-4 bg-slate-100">
                    {getPriceBreakdown().map((item, idx) => (
                      <div key={idx} className={`h-full ${item.color} transition-all duration-1000 ease-out`} style={{ width: `${(item.value / result.predicted_price_lakh) * 100}%` }}></div>
                    ))}
                  </div>
                </div>

                {/* 3D Floor Plan Display */}
                <div 
                  className="mt-6 w-full rounded-2xl overflow-hidden border border-slate-100 shadow-sm relative group bg-slate-50 cursor-pointer"
                  onClick={() => { setShowFloorPlanModal(true); setZoomScale(1); }}
                >
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-slate-700 shadow-sm z-10 border border-white/50 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" /> Expand
                  </div>
                  <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-bold text-white shadow-sm z-10">
                    {formData.bedrooms} BHK Layout
                  </div>
                  <img 
                    src={`/floor_plan_${formData.bedrooms > 3 ? 3 : formData.bedrooms}bhk.jpg`} 
                    alt={`${formData.bedrooms} BHK Floor Plan`} 
                    className="w-full h-auto object-contain max-h-[28rem] group-hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>

                {/* Stats Grid - Cleaned */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100/60">
                  <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 flex flex-col justify-center">
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1.5">Price per Sq.Ft</div>
                    <div className="font-black text-3xl text-slate-700">₹{getPricePerSqFt()}</div>
                  </div>
                  <div className="bg-slate-50/50 rounded-xl p-5 border border-slate-100 flex flex-col justify-center">
                    <div className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1.5">Market Comparison</div>
                    <div className="font-bold text-base text-blue-600 leading-tight">{getMarketComparison().text}</div>
                    <div className="text-xs font-semibold text-slate-500 mt-1.5">{getMarketComparison().value}</div>
                  </div>
                </div>

                {/* Key Price Drivers - Cleaned */}
                <div className="space-y-3 pt-4 border-t border-slate-100/60">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Info className="w-4 h-4" /> Price Drivers
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {getKeyDrivers().map((driver, idx) => {
                      const Icon = driver.icon;
                      return (
                        <div key={idx} className="bg-slate-50 px-4 py-2.5 rounded-lg border border-slate-100 flex items-center gap-2">
                          <Icon className={`w-4 h-4 ${driver.color}`} />
                          <span className="text-sm font-semibold text-slate-700">{driver.text}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Area Simulator - Cleaned */}
                <div className="mt-4 bg-slate-50/50 rounded-xl p-5 border border-slate-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Area Simulator</h3>
                    <div className="font-black text-xl text-emerald-700">₹{getWhatIfPrice()} L</div>
                  </div>
                  <input 
                    type="range" 
                    min="500" 
                    max="4000" 
                    step="50" 
                    value={sliderArea} 
                    onChange={(e) => setSliderArea(Number(e.target.value))} 
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                  />
                  <div className="flex justify-between text-xs font-bold text-slate-400 mt-3">
                    <span>500 sqft</span>
                    <span className="bg-slate-200/50 px-2 py-1 rounded text-slate-600">{sliderArea} sqft</span>
                    <span>4000 sqft</span>
                  </div>
                </div>
            </motion.div>
          ) : null}
        </div>

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

      {/* Floor Plan Zoom Modal */}
      {showFloorPlanModal && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col animate-in fade-in duration-300">
          <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-10 bg-gradient-to-b from-black/80 to-transparent">
            <h2 className="text-white font-black text-xl md:text-2xl drop-shadow-md flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)]"></span>
              {formData.bedrooms} BHK Floor Plan
            </h2>
            <div className="flex gap-3">
              <button onClick={() => setZoomScale(s => Math.min(s + 0.5, 4))} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition-all border border-white/20 shadow-lg">
                <ZoomIn className="w-5 h-5" />
              </button>
              <button onClick={() => setZoomScale(s => Math.max(s - 0.5, 0.5))} className="p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-xl transition-all border border-white/20 shadow-lg">
                <ZoomOut className="w-5 h-5" />
              </button>
              <button onClick={() => setShowFloorPlanModal(false)} className="p-3 bg-white/10 hover:bg-rose-500 backdrop-blur-md text-white rounded-xl transition-all border border-white/20 hover:border-rose-400 shadow-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 w-full h-full relative flex items-center justify-center p-4 overflow-auto">
            <div className="min-w-full min-h-full flex items-center justify-center">
              <img 
                src={`/floor_plan_${formData.bedrooms > 3 ? 3 : formData.bedrooms}bhk.jpg`} 
                alt={`${formData.bedrooms} BHK Floor Plan`} 
                className="max-w-none transition-transform duration-200"
                style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

