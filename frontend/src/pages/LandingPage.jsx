import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { ArrowRight, BrainCircuit, BarChart3, ShieldCheck, Database, Cog, LineChart, FileOutput } from 'lucide-react';
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
    <div className="flex flex-col items-center relative overflow-hidden bg-background">
      {/* Decorative Background Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] opacity-40 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-72 h-72 bg-[#B9D175] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] right-[-10%] w-72 h-72 bg-[#D9EFBD] rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-[20%] left-[30%] w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

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
            <span className="bg-[#B9D175] text-slate-800 px-4 py-1 rounded-xl pb-2 inline-block shadow-sm">
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

      {/* How It Works Section */}
      <section className="w-full py-16 md:py-24 bg-muted/30 border-y relative z-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our prediction engine uses a transparent, 4-step Machine Learning pipeline to calculate the true value of your property.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                icon: Database,
                title: "1. Data Collection",
                desc: "We gathered a robust dataset of real-world flat prices, including crucial features like area, facing direction, and floor level."
              },
              {
                icon: Cog,
                title: "2. Preprocessing",
                desc: "Raw data is cleaned. Categorical data (like 'Facing') is One-Hot Encoded, and numerical data is scaled using StandardScaler."
              },
              {
                icon: LineChart,
                title: "3. Model Training",
                desc: "A Multiple Linear Regression model learns the mathematical relationship between these features and the final price."
              },
              {
                icon: FileOutput,
                title: "4. Instant Prediction",
                desc: "When you enter your flat's details, the trained model instantly computes the estimated market value in Lakhs."
              }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative flex flex-col items-center text-center p-6 bg-background rounded-2xl shadow-sm border hover:shadow-md transition-all hover:-translate-y-1"
              >
                <div className="h-14 w-14 rounded-full bg-[#D9EFBD] flex items-center justify-center mb-6">
                  <step.icon className="h-7 w-7 text-slate-800" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
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
            <div className="flex items-center justify-center md:justify-start mb-2">
              <Logo />
            </div>
            <p className="text-muted-foreground text-sm max-w-sm">
              Empowering real estate decisions with transparent, accurate machine learning models.
            </p>
          </div>
          
          <div className="flex gap-8 text-sm font-medium text-muted-foreground">
            <Link to="/predict" className="hover:text-primary transition-colors">Predict Price</Link>
            <Link to="/dashboard" className="hover:text-primary transition-colors">Analytics</Link>
            <a href="https://github.com/rohitmandal2004/FlatPrice" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">GitHub</a>
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
