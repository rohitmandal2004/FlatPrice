import React from 'react';
import QRCode from 'react-qr-code';
import { ShieldCheck, Building, Calendar, Scale, Compass, Bath, Car, DoorOpen } from 'lucide-react';
import Logo from './Logo';

export default function ValuationCertificate({ formData, result, certificateId = "VAL-1004" }) {
  if (!formData || !result) return null;

  const date = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div 
      id="valuation-certificate" 
      className="bg-white text-slate-800 absolute -left-[9999px]" // Rendered off-screen
      style={{ 
        width: '794px', 
        height: '1123px', // Standard A4 proportions at 96dpi
        fontFamily: "'Times New Roman', Times, serif" // Formal font
      }}
    >
      {/* Outer Border */}
      <div className="absolute inset-0 p-8">
        <div className="w-full h-full border-4 border-double border-emerald-800 p-2">
          <div className="w-full h-full border border-emerald-900/40 relative flex flex-col justify-between p-12 bg-[#faf9f6]"> {/* Ivory background */}
            
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <ShieldCheck style={{ width: '400px', height: '400px' }} />
            </div>

            {/* Header */}
            <div className="text-center relative z-10 border-b-2 border-emerald-800/30 pb-8">
              <div className="flex justify-center mb-6">
                <ShieldCheck className="w-16 h-16 text-emerald-800" />
              </div>
              <h1 className="text-4xl font-bold uppercase tracking-widest text-emerald-900 mb-2">
                Certificate of Valuation
              </h1>
              <h2 className="text-xl text-emerald-700/80 tracking-widest uppercase mb-1">
                FlatPrice Analytics AI
              </h2>
              <p className="text-sm text-slate-500 italic">
                Official AI-Generated Property Valuation Estimate
              </p>
            </div>

            {/* Body */}
            <div className="flex-1 relative z-10 pt-12 space-y-10">
              <div className="text-justify leading-loose text-lg space-y-6">
                <p>
                  This is to certify that an algorithmic valuation has been conducted by the FlatPrice Machine Learning pipeline on <strong>{date}</strong>, utilizing highly robust Multiple Linear Regression models trained on expansive datasets of verified real-estate transactions.
                </p>
                <p>
                  Based on the physical characteristics and geospatial orientation provided below, the estimated fair market value of the subject property has been computationally determined as follows:
                </p>
              </div>

              {/* Property Details Grid & Floor Plan */}
              <div className="flex gap-6 items-stretch">
                <div className="bg-white border border-emerald-900/20 p-6 shadow-sm relative flex-1">
                  <div className="absolute top-0 left-0 w-full h-1 bg-emerald-800"></div>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                    <div className="flex items-center gap-3">
                      <Scale className="w-5 h-5 text-emerald-700/70" />
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500">Super Built-up Area</div>
                        <div className="text-lg font-bold">{formData.area_sqft} Sq.Ft</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <BedDoubleIcon className="w-5 h-5 text-emerald-700/70" />
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500">Configuration</div>
                        <div className="text-lg font-bold">{formData.bedrooms} BHK</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Building className="w-5 h-5 text-emerald-700/70" />
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500">Floor Level</div>
                        <div className="text-lg font-bold">Floor {formData.floor}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Compass className="w-5 h-5 text-emerald-700/70" />
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500">Orientation</div>
                        <div className="text-lg font-bold">{formData.facing} Facing</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Bath className="w-5 h-5 text-emerald-700/70" />
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500">Bathrooms</div>
                        <div className="text-lg font-bold">{formData.bathrooms || '-'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <DoorOpen className="w-5 h-5 text-emerald-700/70" />
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500">Balconies</div>
                        <div className="text-lg font-bold">{formData.balcony || '-'}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Car className="w-5 h-5 text-emerald-700/70" />
                      <div>
                        <div className="text-[10px] uppercase tracking-widest text-slate-500">Parking Area</div>
                        <div className="text-lg font-bold">{formData.car_parking_sqft || '0'} Sq.Ft</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floor Plan Image */}
                <div className="w-64 bg-white border border-emerald-900/20 p-4 shadow-sm flex flex-col items-center justify-center">
                  <img 
                    src={`/floor_plan_${Math.min(formData.bedrooms, 5)}bhk.jpg`} 
                    alt="Floor Plan Layout" 
                    className="w-full h-32 object-contain mb-3"
                    crossOrigin="anonymous"
                  />
                  <div className="text-[9px] uppercase tracking-widest text-slate-500 font-bold text-center border-t border-emerald-900/10 pt-2 w-full">
                    Authorized Layout View
                  </div>
                </div>
              </div>

              {/* Valuation Result */}
              <div className="text-center pt-4">
                <div className="text-sm uppercase tracking-widest text-slate-500 mb-2 font-bold">Assessed Valuation Value</div>
                <div className="text-6xl font-bold text-emerald-900 border-b border-t py-4 border-emerald-900/20 inline-block px-12">
                  ₹{result.predicted_price_lakh} Lakhs
                </div>
              </div>
            </div>

            {/* Footer & Signatures */}
            <div className="relative z-10 pt-16 mt-8 border-t border-emerald-800/10 flex justify-between items-end">
              
              {/* QR Code */}
              <div className="flex gap-6 items-center">
                <div className="bg-white p-2 border border-emerald-900/20 shadow-sm">
                  <QRCode 
                    value={`https://flatprice.app/verify/${certificateId}?price=${result.predicted_price_lakh}`}
                    size={90}
                    level="H"
                  />
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <div><strong>ID:</strong> {certificateId}</div>
                  <div><strong>Date:</strong> {date}</div>
                  <div className="italic">Scan to verify authenticity</div>
                </div>
              </div>

              {/* Signature */}
              <div className="text-center">
                <div className="w-48 border-b border-slate-800 mb-2"></div>
                <div className="text-sm font-bold uppercase tracking-widest text-emerald-900">FlatPrice AI</div>
                <div className="text-xs text-slate-500 italic">Automated Valuation Model</div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Inline Icon to avoid extra imports
const BedDoubleIcon = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M2 20v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8"/><path d="M4 10V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v4"/><path d="M12 4v6"/><path d="M2 18h20"/></svg>
);
