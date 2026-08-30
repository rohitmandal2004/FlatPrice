import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      <Helmet>
        <title>404 Not Found - FlatPredict AI</title>
      </Helmet>
      
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-[40rem] h-[40rem] bg-emerald-100/40 rounded-full blur-3xl mix-blend-multiply" />
        <div className="absolute bottom-[10%] right-[20%] w-[35rem] h-[35rem] bg-sky-100/40 rounded-full blur-3xl mix-blend-multiply" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white/80 backdrop-blur-xl border border-white rounded-3xl p-8 md:p-16 text-center shadow-2xl relative z-10"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.2 
          }}
          className="mx-auto w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-8"
        >
          <AlertTriangle className="w-12 h-12 text-rose-500" />
        </motion.div>

        <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-4 tracking-tight">
          404
        </h1>
        
        <h2 className="text-2xl md:text-3xl font-bold text-slate-800 mb-6">
          Lost in the Matrix?
        </h2>
        
        <p className="text-slate-600 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
          The property page you are looking for doesn't exist or has been moved. 
          Let's get you back to evaluating real estate.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors w-full sm:w-auto"
            >
              <Home className="w-5 h-5" />
              Return Home
            </motion.button>
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 bg-white text-slate-700 px-8 py-4 rounded-xl font-semibold hover:bg-slate-50 border border-slate-200 transition-colors w-full sm:w-auto shadow-sm"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
