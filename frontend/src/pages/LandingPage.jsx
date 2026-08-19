import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col items-center relative overflow-hidden bg-white">

      {/* Hero Section */}
      <section className="w-full py-16 md:py-28 lg:py-36 xl:py-48 flex flex-col items-center text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[900px] space-y-8 px-4 flex flex-col items-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary mb-2 shadow-sm backdrop-blur-sm"
          >
            {/* <Sparkles className="h-4 w-4" />
             */}
          </motion.div>
          
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl leading-[1.1]">
            Predict Your Flat's Price with{' '}
            <span className="text-primary pb-2 inline-block">
              Machine Learning
            </span>
          </h1>
          
          <p className="mx-auto max-w-[650px] text-muted-foreground md:text-xl leading-relaxed">
            Harness the power of Multiple Linear Regression. Instantly estimate property values based on key characteristics like area, floor, and facing direction.
          </p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-center gap-4 mt-8 w-full px-4 sm:px-0"
          >
            <Link 
              to="/predict" 
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-full p-4 px-8 font-semibold text-primary-foreground bg-primary shadow-lg shadow-primary/30 transition-all hover:scale-105 hover:bg-primary/90 hover:shadow-primary/50 w-full sm:w-auto"
            >
              <span className="relative flex items-center gap-2">Predict Price <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
            
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center rounded-full border-2 border-input bg-background/50 backdrop-blur-md px-8 py-3.5 font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-all hover:scale-105 w-full sm:w-auto"
            >
              Explore Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full py-16 md:py-24 mb-16 relative z-10">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto grid max-w-6xl items-start gap-8 px-4 py-12 lg:grid-cols-3"
        >
          <motion.div variants={itemVariants} className="group flex flex-col items-center space-y-4 text-center rounded-3xl bg-white border shadow-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/30 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <BrainCircuit className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mt-4">Transparent Models</h3>
            <p className="text-muted-foreground leading-relaxed">Powered by a robust scikit-learn model trained on real-world flat data for accurate insights.</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="group flex flex-col items-center space-y-4 text-center rounded-3xl bg-white border shadow-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/30 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <BarChart3 className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mt-4">Data Visualization</h3>
            <p className="text-muted-foreground leading-relaxed">Interactive, beautiful charts showing model accuracy, residuals, and rich dataset distributions.</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="group flex flex-col items-center space-y-4 text-center rounded-3xl bg-white border shadow-xl p-8 transition-all duration-300 hover:-translate-y-2 hover:shadow-primary/20">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/30 shadow-inner group-hover:scale-110 transition-transform duration-300">
              <ShieldCheck className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mt-4">Educational Design</h3>
            <p className="text-muted-foreground leading-relaxed">Expertly built to demonstrate an end-to-end Machine Learning pipeline integrated into a modern web app.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t bg-muted/30 py-12 px-4 relative z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-center md:text-left">
          <div className="space-y-2">
            <div className="font-bold text-xl text-primary flex items-center justify-center md:justify-start gap-2">
              <BrainCircuit className="h-5 w-5" />
              FlatPredict AI
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Empowering real estate decisions with transparent, accurate machine learning models.
            </p>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link to="/predict" className="hover:text-primary transition-colors">Predict Price</Link>
            <Link to="/dashboard" className="hover:text-primary transition-colors">Analytics</Link>
            <a href="https://github.com/rohitmandal2004" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">GitHub</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-8 pt-8 border-t text-sm text-muted-foreground text-center flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} FlatPredict AI Lab. All rights reserved.</p>
          <div className="flex gap-4">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
