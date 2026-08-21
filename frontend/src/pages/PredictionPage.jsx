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
        margin:       10,
        filename:     'FlatPredict_Report.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
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

              {/* What-If Simulator */}
              <div className="w-full bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-4 print-hide">
                <div className="flex justify-between items-center">
                  <h4 className="font-semibold text-sm text-primary">"What-If" Area Simulator</h4>
                  <div className="text-lg font-bold text-primary">₹{getWhatIfPrice()} L</div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{Math.max(500, formData.area_sqft - 500)} sq ft</span>
                    <span className="font-medium text-foreground">{sliderArea} sq ft</span>
                    <span>{formData.area_sqft + 1000} sq ft</span>
                  </div>
                  <input 
                    type="range" 
                    min={Math.max(500, formData.area_sqft - 500)} 
                    max={formData.area_sqft + 1000} 
                    value={sliderArea} 
                    onChange={(e) => setSliderArea(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
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

      {/* Advanced Analytics Section */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full space-y-6 pt-8 border-t print-hide"
        >
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-2xl font-bold tracking-tight">Advanced Analytics</h2>
            <p className="text-muted-foreground">Deep dive into investment potential, EMIs, and historical trends.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* EMI Calculator */}
            <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b pb-4">
                <IndianRupee className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-lg">EMI Calculator</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Down Payment</span>
                    <span className="font-medium">{emiState.downPayment}% (₹{((result.predicted_price_lakh * emiState.downPayment) / 100).toFixed(2)}L)</span>
                  </div>
                  <input type="range" min="10" max="90" step="5" value={emiState.downPayment} onChange={(e) => setEmiState({...emiState, downPayment: Number(e.target.value)})} className="w-full accent-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span className="font-medium">{emiState.interestRate}%</span>
                  </div>
                  <input type="range" min="5" max="15" step="0.1" value={emiState.interestRate} onChange={(e) => setEmiState({...emiState, interestRate: Number(e.target.value)})} className="w-full accent-primary" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Loan Tenure</span>
                    <span className="font-medium">{emiState.tenure} Years</span>
                  </div>
                  <input type="range" min="5" max="30" step="1" value={emiState.tenure} onChange={(e) => setEmiState({...emiState, tenure: Number(e.target.value)})} className="w-full accent-primary" />
                </div>
                <div className="pt-4 border-t text-center space-y-1">
                  <div className="text-sm text-muted-foreground uppercase">Estimated Monthly EMI</div>
                  <div className="text-3xl font-bold text-primary">₹{calculateEMI()}</div>
                </div>
              </div>
            </div>

            {/* ROI Projector */}
            <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b pb-4">
                <PieChart className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-lg">Investment ROI</h3>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Holding Period</span>
                    <span className="font-medium">{roiState.holdYears} Years</span>
                  </div>
                  <input type="range" min="1" max="20" step="1" value={roiState.holdYears} onChange={(e) => setRoiState({...roiState, holdYears: Number(e.target.value)})} className="w-full accent-emerald-500" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Expected Appreciation</span>
                    <span className="font-medium">{roiState.appreciationRate}% / yr</span>
                  </div>
                  <input type="range" min="2" max="15" step="0.5" value={roiState.appreciationRate} onChange={(e) => setRoiState({...roiState, appreciationRate: Number(e.target.value)})} className="w-full accent-emerald-500" />
                </div>
                <div className="pt-8 border-t text-center space-y-1">
                  <div className="text-sm text-muted-foreground uppercase">Future Est. Value</div>
                  <div className="text-3xl font-bold text-emerald-500">₹{calculateROI().futureValue} L</div>
                  <div className="text-sm font-medium text-emerald-600 bg-emerald-50 inline-block px-2 py-0.5 rounded-full mt-2">
                    + ₹{calculateROI().profit} L Profit
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Trend Chart */}
            <div className="bg-card border rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b pb-4">
                <LineChartIcon className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-lg">Historical Price Trend</h3>
              </div>
              <div className="h-[250px] w-full pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={generateHistoricalData()} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dx={-10} domain={['dataMin - 5', 'dataMax + 5']} />
                    <Tooltip 
                      formatter={(value) => [`₹${value} L`, 'Price']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

