import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BrainCircuit, BarChart3, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 flex flex-col items-center text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-[800px] space-y-4"
        >
          <div className="inline-block rounded-full bg-muted px-3 py-1 text-sm font-medium mb-4">
            AI-Powered Real Estate Analytics
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Predict Your Flat's Estimated Price with <span className="text-primary">Machine Learning</span>
          </h1>
          <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
            Estimate flat prices using Multiple Linear Regression based on property characteristics like area, floor, and facing direction.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 w-full px-4 sm:px-0">
            <Link 
              to="/predict" 
              className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors w-full sm:w-auto"
            >
              Predict Price <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center justify-center rounded-md border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors w-full sm:w-auto"
            >
              Explore Dashboard
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="w-full py-12 md:py-24 bg-muted/50 rounded-3xl p-8 mb-12">
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <BrainCircuit className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Multiple Linear Regression</h3>
            <p className="text-muted-foreground">Powered by a transparent scikit-learn model trained on real flat data.</p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Data Visualization</h3>
            <p className="text-muted-foreground">Interactive charts showing model accuracy, residuals, and dataset distribution.</p>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold">Educational Project</h3>
            <p className="text-muted-foreground">Built to demonstrate end-to-end ML pipeline integration in a modern web app.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
