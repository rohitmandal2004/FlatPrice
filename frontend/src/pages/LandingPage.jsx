import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { ArrowRight, BrainCircuit, BarChart3, ShieldCheck, Database, Cog, LineChart, FileOutput, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Hero3D from '../components/Hero3D';

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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col items-center relative overflow-hidden bg-background">
      {/* 3D Background */}
      <Hero3D />

      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-40 flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[1000px] space-y-10 px-4 flex flex-col items-center"
        >
          <h1 className="text-4xl font-black tracking-tight sm:text-5xl md:text-6xl lg:text-8xl leading-[1.1] text-foreground">
            Predict Flat Prices with{' '}
            <span className="relative inline-block mt-2 sm:mt-0">
              <span className="absolute -inset-2 bg-gradient-to-r from-primary to-emerald-400 opacity-20 blur-2xl rounded-full"></span>
              <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-primary to-emerald-600 drop-shadow-sm">
                Machine Learning
              </span>
            </span>
          </h1>

          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl leading-relaxed font-medium">
            Harness the power of Multiple Linear Regression. Instantly estimate property values based on key characteristics with AI-driven accuracy.
          </p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="flex flex-col sm:flex-row justify-center gap-5 mt-10 w-full px-4 sm:px-0"
          >
            <Link
              to="/predict"
              className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl p-4 px-8 font-bold text-lg text-primary-foreground bg-primary shadow-[0_8px_30px_rgb(185,209,117,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_8px_40px_rgb(185,209,117,0.6)] w-full sm:w-auto"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
              <span className="relative flex items-center gap-2">Get Started <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" /></span>
            </Link>

            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-input/50 bg-white/40 backdrop-blur-xl px-8 py-4 font-semibold text-lg shadow-sm hover:bg-white/60 transition-all hover:-translate-y-1 w-full sm:w-auto"
            >
              Explore Dashboard
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-20 md:py-32 relative z-10 overflow-hidden">
        {/* Subtle background separation */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl md:text-5xl font-black">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg md:text-xl font-medium">
              A transparent, 4-step Machine Learning pipeline calculating the true value of your property.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connecting Line for desktop */}
            <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 -translate-y-1/2 z-0"></div>

            {[
              {
                icon: Database,
                title: "1. Data Collection",
                desc: "We gather robust datasets of real-world flat prices, capturing crucial features like area and facing."
              },
              {
                icon: Cog,
                title: "2. Preprocessing",
                desc: "Data is cleaned, One-Hot Encoded, and scaled to prepare it perfectly for our predictive algorithms."
              },
              {
                icon: LineChart,
                title: "3. Model Training",
                desc: "Multiple Linear Regression learns complex mathematical relationships to determine final price weights."
              },
              {
                icon: FileOutput,
                title: "4. Prediction",
                desc: "Instantly computes estimated market value in Lakhs when you input flat characteristics."
              }
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative z-10 flex flex-col items-center text-center p-8 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 transition-all hover:-translate-y-2 hover:shadow-2xl hover:border-primary/30 group"
              >
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed font-medium">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full py-20 md:py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Why Choose FlatPredict</h2>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto grid max-w-6xl items-start gap-8 px-4 lg:grid-cols-3"
        >
          <motion.div variants={itemVariants} className="group relative flex flex-col items-start space-y-5 rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 shadow-sm relative z-10 text-primary">
              <BrainCircuit className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black relative z-10">Transparent Models</h3>
            <p className="text-muted-foreground leading-relaxed relative z-10 font-medium">Powered by robust scikit-learn models trained on real-world flat data for accurate, explainable insights.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="group relative flex flex-col items-start space-y-5 rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-400/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-400/20 shadow-sm relative z-10 text-emerald-600 dark:text-emerald-400">
              <BarChart3 className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black relative z-10">Data Visualization</h3>
            <p className="text-muted-foreground leading-relaxed relative z-10 font-medium">Interactive, beautiful charts showing model accuracy, residuals, and rich dataset distributions.</p>
          </motion.div>

          <motion.div variants={itemVariants} className="group relative flex flex-col items-start space-y-5 rounded-[2rem] bg-white/60 backdrop-blur-xl border border-white/60 shadow-xl p-10 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-400/20 shadow-sm relative z-10 text-blue-600 dark:text-blue-400">
              <ShieldCheck className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-black relative z-10">Educational Design</h3>
            <p className="text-muted-foreground leading-relaxed relative z-10 font-medium">Expertly built to demonstrate an end-to-end Machine Learning pipeline integrated into a modern web app.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-20 relative z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-gradient-to-br from-primary/90 to-emerald-600 rounded-[3rem] p-12 md:p-20 text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjE1KSIvPjwvc3ZnPg==')] opacity-50 mix-blend-overlay"></div>
            <div className="relative z-10 space-y-8">
              <h2 className="text-3xl md:text-5xl font-black text-white">Ready to value your property?</h2>
              <p className="text-primary-foreground/80 md:text-xl max-w-2xl mx-auto font-medium">
                Get an instant estimate powered by our trained machine learning models. No registration required.
              </p>
              <Link
                to="/predict"
                className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-5 font-bold text-primary shadow-xl hover:scale-105 transition-all text-lg"
              >
                Try the Predictor <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-white/40 backdrop-blur-md border-t border-white/20 mt-10 py-12 px-4 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div className="space-y-4">
            <div className="flex items-center justify-center md:justify-start">
              <Logo />
            </div>
            <p className="text-muted-foreground text-sm max-w-sm font-medium leading-relaxed">
              Empowering real estate decisions with transparent, accurate machine learning models.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-bold text-muted-foreground">
            <Link to="/predict" className="hover:text-primary transition-colors">Predict Price</Link>
            <Link to="/dashboard" className="hover:text-primary transition-colors">Analytics</Link>
            <a href="https://github.com/rohitmandal2004/FlatPrice" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">GitHub Repository</a>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-8 border-t border-border/50 text-sm font-medium text-muted-foreground text-center flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} FlatPredict AI Lab. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-primary cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-primary cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
