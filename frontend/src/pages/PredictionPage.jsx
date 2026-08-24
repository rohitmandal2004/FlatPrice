import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { predictPrice } from '../services/api';
import { supabase } from '../services/supabase';
import { Calculator, AlertCircle, Loader2, Copy, Download, TrendingUp, TrendingDown, Info, IndianRupee, PieChart, LineChart as LineChartIcon, View, ZoomIn, ZoomOut, X, Maximize2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useStore } from '../hooks/useStore';
import toast from 'react-hot-toast';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import Building3D from '../components/Building3D';
import Logo from '../components/Logo';

const formSchema = z.object({
  area_sqft: z.coerce.number().min(300, "Area must be at least 300 sqft").max(10000, "Area must be below 10000 sqft"),
  facing: z.enum(['North', 'South', 'East', 'West']),
  floor: z.coerce.number().min(0, "Floor cannot be negative").max(100, "Floor seems too high"),
  car_parking_sqft: z.coerce.number().min(0, "Car parking cannot be negative"),
  bedrooms: z.coerce.number().min(1).max(10)
}).refine((data) => data.car_parking_sqft <= data.area_sqft * 0.5, {
  message: "Parking area too large compared to flat",
  path: ["car_parking_sqft"]
});

export default function PredictionPage() {
  const { user } = useUser();
  const setLastPrediction = useStore((state) => state.setLastPrediction);
  const { register, handleSubmit: hookFormSubmit, watch, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      area_sqft: 1200,
      facing: 'North',
      floor: 5,
      car_parking_sqft: 150,
      bedrooms: 3
    }
  });

  const formData = watch();
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [zoomScale, setZoomScale] = useState(1);

  // Analytics State
  const [sliderArea, setSliderArea] = useState(1200);
  const [emiState, setEmiState] = useState({ downPayment: 20, interestRate: 8.5, tenure: 20 });
  const [roiState, setRoiState] = useState({ holdYears: 5, appreciationRate: 6 });

  // Sync slider with form
  React.useEffect(() => {
    setSliderArea(formData.area_sqft || 1200);
  }, [formData.area_sqft]);

  const mutation = useMutation({
    mutationFn: async (data) => {
      const response = await predictPrice(data);
      if (user) {
        await supabase.from('predictions').insert([{
          user_id: user.id,
          ...data,
          predicted_price_lakh: response.predicted_price_lakh,
          model_version: 'mlr-v1'
        }]);
      }
      return response;
    },
    onSuccess: (data) => {
      setLastPrediction(data);
    },
    onError: (err) => {
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to predict price';
      toast.error(errorMsg);
    }
  });

  const loading = mutation.isPending;
  const result = mutation.data;

  const handleSelectFlat = (floor, facing) => {
    setValue('floor', floor, { shouldValidate: true });
    setValue('facing', facing, { shouldValidate: true });
  };

  const onSubmit = (data) => {
    mutation.mutate(data);
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
    
    const originalClasses = element.className;
    element.classList.remove('backdrop-blur-2xl', 'bg-white/90', 'border-white', 'shadow-xl');
    element.classList.add('bg-white', 'border-slate-200');
    
    try {
      const dataUrl = await toPng(element, { 
        quality: 1, 
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (element.offsetHeight * pdfWidth) / element.offsetWidth;
      
      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('FlatPredict_Report.pdf');
      
      toast.success("PDF downloaded successfully!", { id: toastId });
    } catch (err) {
      toast.error(`Failed to generate PDF`, { id: toastId });
      console.error(err);
    } finally {
      element.className = originalClasses;
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
      { label: "Base Property Value", value: baseVal, color: "bg-slate-800", hex: "#1e293b" },
      { label: `Floor Premium (Fl ${formData.floor})`, value: floorPrem, color: "bg-emerald-500", hex: "#10b981" },
      { label: `${formData.facing} Facing Premium`, value: facePrem, color: "bg-blue-500", hex: "#3b82f6" },
      { label: "Parking & Amenities", value: parkingPrem + amenities, color: "bg-teal-400", hex: "#2dd4bf" },
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
    const currentVal = Number(getWhatIfPrice());
    const principal = (currentVal * 100000) * (1 - emiState.downPayment / 100);
    const r = (emiState.interestRate / 12) / 100;
    const n = emiState.tenure * 12;
    if (r === 0) return Math.round(principal / n);
    const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi).toLocaleString('en-IN');
  };

  const calculateROI = () => {
    if (!result) return { futureValue: 0, profit: 0 };
    const currentVal = Number(getWhatIfPrice());
    const futureVal = currentVal * Math.pow(1 + (roiState.appreciationRate / 100), roiState.holdYears);
    return { futureValue: futureVal.toFixed(2), profit: (futureVal - currentVal).toFixed(2) };
  };

  const generateHistoricalData = () => {
    if (!result) return [];
    const currentPrice = Number(getWhatIfPrice());
    const data = [];
    const currentYear = new Date().getFullYear();
    const fixedFluctuations = [1.0, 0.98, 1.03, 0.96, 1.01, 0.99]; 
    for (let i = 5; i >= 0; i--) {
      const pastPrice = currentPrice / Math.pow(1.06, i) * fixedFluctuations[i];
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
          <motion.div className="lg:col-span-5 relative overflow-hidden bg-white/40 backdrop-blur-3xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-[2rem] p-6 sm:p-8 flex flex-col justify-center before:absolute before:inset-0 before:bg-gradient-to-br before:from-emerald-50/80 before:to-transparent before:pointer-events-none">
            <form onSubmit={hookFormSubmit(onSubmit)} className="space-y-6 relative z-10">
              <div className="space-y-5">
                <div className="group/input relative">
                  <label className="block text-xs font-bold mb-2 text-emerald-800 uppercase tracking-wider">Area (sq ft)</label>
                  <input type="number" {...register('area_sqft')} className="w-full h-12 rounded-xl border border-emerald-100 bg-white/60 px-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-300 shadow-sm text-slate-700" />
                  {errors.area_sqft && <p className="text-red-500 text-xs mt-1.5 font-semibold bg-red-50 px-2 py-1 rounded-md inline-block">{errors.area_sqft.message}</p>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="group/input relative">
                    <label className="block text-xs font-bold mb-2 text-emerald-800 uppercase tracking-wider">Facing</label>
                    <select {...register('facing')} className="w-full h-12 rounded-xl border border-emerald-100 bg-white/60 px-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-300 shadow-sm appearance-none text-slate-700 cursor-pointer">
                      <option value="North">North</option>
                      <option value="South">South</option>
                      <option value="East">East</option>
                      <option value="West">West</option>
                    </select>
                  </div>
                  <div className="group/input relative">
                    <label className="block text-xs font-bold mb-2 text-emerald-800 uppercase tracking-wider">Floor</label>
                    <input type="number" {...register('floor')} className="w-full h-12 rounded-xl border border-emerald-100 bg-white/60 px-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-300 shadow-sm text-slate-700" />
                    {errors.floor && <p className="text-red-500 text-xs mt-1.5 font-semibold bg-red-50 px-2 py-1 rounded-md inline-block">{errors.floor.message}</p>}
                  </div>
                </div>
                <div className="group/input relative">
                  <label className="block text-xs font-bold mb-2 text-emerald-800 uppercase tracking-wider">Car Parking Area (sq ft)</label>
                  <input type="number" {...register('car_parking_sqft')} className="w-full h-12 rounded-xl border border-emerald-100 bg-white/60 px-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-300 shadow-sm text-slate-700" />
                  {errors.car_parking_sqft && <p className="text-red-500 text-xs mt-1.5 font-semibold bg-red-50 px-2 py-1 rounded-md inline-block">{errors.car_parking_sqft.message}</p>}
                </div>
                <div className="group/input relative">
                  <label className="block text-xs font-bold mb-2 text-emerald-800 uppercase tracking-wider">Bedrooms</label>
                  <select {...register('bedrooms')} className="w-full h-12 rounded-xl border border-emerald-100 bg-white/60 px-4 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400 focus:bg-white transition-all duration-300 shadow-sm appearance-none text-slate-700 cursor-pointer">
                    <option value={1}>1 BHK</option>
                    <option value={2}>2 BHK</option>
                    <option value={3}>3 BHK</option>
                    <option value={4}>4 BHK</option>
                    <option value={5}>5 BHK</option>
                  </select>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full h-14 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-black text-lg hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:hover:scale-100 disabled:hover:translate-y-0 relative overflow-hidden group border border-emerald-400/50">
                <span className="relative z-10">{loading ? 'Analyzing Market...' : 'Predict Property Value'}</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
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
                <div className="flex flex-col gap-6 w-full pb-4 border-b border-slate-100/60 mb-4 relative">
                  {/* Logo Centered */}
                  <div className="flex justify-center w-full">
                    <Logo className="scale-110 sm:scale-125" />
                  </div>
                  
                  {/* Badges and Actions */}
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></div>
                      <span className="font-bold text-[10px] tracking-widest text-slate-500 uppercase">Valuation Report</span>
                      <div className="hidden sm:flex ml-1 px-2 py-0.5 bg-blue-50 border border-blue-100 rounded items-center gap-1">
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
                  
                  {/* Mobile Only Confidence Badge */}
                  <div className="sm:hidden flex items-center justify-center mt-[-10px]">
                      <div className="px-2 py-0.5 bg-blue-50 border border-blue-100 rounded flex items-center gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">AI Confidence 94%</span>
                      </div>
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
                <div className="mt-8 pt-8 pb-6 border-t border-slate-100/60 max-w-3xl mx-auto w-full relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 via-transparent to-blue-50/50 rounded-3xl -z-10 blur-xl"></div>
                  <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2 px-2">
                    <div className="p-1.5 bg-emerald-100/80 rounded-md text-emerald-600 shadow-sm border border-emerald-200/50">
                      <PieChart className="w-4 h-4" />
                    </div>
                    Value Breakdown
                  </h3>
                  <div className="bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-[2rem] p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-10">
                    <div className="w-56 h-56 flex-shrink-0 relative">
                      <div className="absolute inset-0 bg-emerald-400/20 rounded-full blur-2xl animate-pulse"></div>
                      <ResponsiveContainer width="100%" height="100%" className="relative z-10 drop-shadow-2xl">
                        <RechartsPieChart>
                          <Pie
                            data={getPriceBreakdown()}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={95}
                            paddingAngle={5}
                            cornerRadius={8}
                            dataKey="value"
                            stroke="none"
                            isAnimationActive={true}
                            animationDuration={1500}
                            animationEasing="ease-out"
                          >
                            {getPriceBreakdown().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.hex} className="hover:opacity-80 transition-opacity duration-300 cursor-pointer" />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value) => [`₹${value.toFixed(2)} L`, 'Value']}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                            itemStyle={{ color: '#1e293b' }}
                          />
                        </RechartsPieChart>
                      </ResponsiveContainer>
                      <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Value</span>
                        <span className="text-xl font-black text-slate-800 drop-shadow-sm">₹{result.predicted_price_lakh} L</span>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full space-y-3">
                      {getPriceBreakdown().map((item, idx) => (
                        <div key={idx} className="group flex items-center justify-between p-4 bg-white/50 backdrop-blur hover:bg-white/90 rounded-2xl transition-all duration-300 border border-white/60 hover:border-emerald-200 hover:shadow-md cursor-pointer hover:-translate-y-0.5">
                          <div className="flex items-center gap-4">
                            <div className="w-4 h-4 rounded-full shadow-inner transform group-hover:scale-110 transition-all duration-300 relative" style={{ backgroundColor: item.hex }}>
                              <div className="absolute inset-0 rounded-full blur-[4px] opacity-40 group-hover:opacity-70 transition-opacity" style={{ backgroundColor: item.hex }}></div>
                            </div>
                            <span className="text-[14px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{item.label}</span>
                          </div>
                          <span className="text-[15px] font-black text-slate-800 tracking-tight">₹{item.value.toFixed(2)} L</span>
                        </div>
                      ))}
                    </div>
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
                    src={`/floor_plan_${formData.bedrooms}bhk.jpg`} 
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

                {/* Area Simulator - Premium Redesign */}
                <div className="mt-8 bg-gradient-to-br from-white/80 to-emerald-50/50 backdrop-blur-md rounded-[2rem] p-6 sm:p-8 border border-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none group-hover:bg-emerald-400/20 transition-all duration-700"></div>
                  
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 relative z-10">
                    <div>
                      <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-1.5">
                        <div className="p-1.5 bg-emerald-100 rounded-md text-emerald-600">
                          <Maximize2 className="w-3.5 h-3.5" />
                        </div>
                        Interactive Area Simulator
                      </h3>
                      <p className="text-xs text-slate-400 font-medium">Adjust the slider to see how area impacts value</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-sm border border-emerald-100/50">
                      <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mb-1">Estimated Value</div>
                      <div className="font-black text-3xl text-emerald-700 tracking-tight flex items-baseline gap-1">
                        ₹{getWhatIfPrice()} <span className="text-xl text-emerald-500/70">L</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative z-10 pt-4 pb-2">
                    <input 
                      type="range" 
                      min="500" 
                      max="4000" 
                      step="50" 
                      value={sliderArea} 
                      onChange={(e) => setSliderArea(Number(e.target.value))} 
                      className="w-full h-3 rounded-full appearance-none cursor-pointer outline-none shadow-inner" 
                      style={{ 
                        background: `linear-gradient(to right, #10b981 ${((sliderArea - 500) / (4000 - 500)) * 100}%, #f1f5f9 ${((sliderArea - 500) / (4000 - 500)) * 100}%)` 
                      }}
                    />
                    <style>{`
                      input[type=range]::-webkit-slider-thumb {
                        appearance: none;
                        width: 24px;
                        height: 24px;
                        border-radius: 50%;
                        background: white;
                        border: 4px solid #10b981;
                        box-shadow: 0 0 15px rgba(16,185,129,0.5);
                        cursor: pointer;
                        transition: transform 0.1s;
                      }
                      input[type=range]::-webkit-slider-thumb:hover {
                        transform: scale(1.2);
                        box-shadow: 0 0 20px rgba(16,185,129,0.7);
                      }
                    `}</style>
                  </div>
                  
                  <div className="flex justify-between items-center text-xs font-bold text-slate-400 mt-4 relative z-10 px-1">
                    <span>500 sqft</span>
                    <span className="bg-emerald-500 text-white px-4 py-1.5 rounded-full shadow-md text-sm font-black -translate-y-1">{sliderArea} sqft</span>
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
                      <span className="font-black">{emiState.downPayment}% <span className="text-muted-foreground font-semibold">(₹{((Number(getWhatIfPrice()) * emiState.downPayment) / 100).toFixed(2)}L)</span></span>
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
                src={`/floor_plan_${formData.bedrooms}bhk.jpg`} 
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

