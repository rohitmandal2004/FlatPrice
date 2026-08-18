import React, { useEffect, useState } from 'react';
import { getModelInfo } from '../services/api';
import { Loader2, BookOpen, BrainCircuit, ListChecks } from 'lucide-react';

export default function MLExplorerPage() {
  const [modelInfo, setModelInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getModelInfo();
        setModelInfo(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <div className="flex justify-center mt-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!modelInfo) return <div className="text-center text-red-500 mt-10">Failed to load model info.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">How the Model Works</h1>
        <p className="text-muted-foreground">Understanding Multiple Linear Regression</p>
      </div>

      <div className="space-y-8">
        <section className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-4">
            <BrainCircuit className="text-primary h-6 w-6" />
            <h2 className="text-xl font-semibold">1. The Algorithm</h2>
          </div>
          <p className="text-muted-foreground leading-relaxed">
            This application uses <strong>Multiple Linear Regression</strong>, a statistical technique that uses several explanatory variables (features) to predict the outcome of a response variable (target). The goal is to model the linear relationship between the explanatory (independent) variables and response (dependent) variable.
          </p>
          <div className="bg-muted p-4 rounded-md overflow-x-auto text-sm font-mono mt-4">
            y = β₀ + β₁x₁ + β₂x₂ + ... + βₙxₙ + ε
          </div>
        </section>

        <section className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-4">
            <ListChecks className="text-primary h-6 w-6" />
            <h2 className="text-xl font-semibold">2. Our specific Model Equation</h2>
          </div>
          <p className="text-muted-foreground mb-4">
            Based on the training dataset of {modelInfo.training_samples} records, the model learned the following equation to predict the price of a flat:
          </p>
          
          <div className="bg-slate-900 text-slate-50 p-6 rounded-lg font-mono text-sm shadow-inner overflow-x-auto">
            <div className="text-blue-400 font-bold mb-4">Predicted Price (Lakhs) = </div>
            <div className="pl-4 space-y-2">
              <div><span className="text-yellow-400">{modelInfo.intercept.toFixed(2)}</span> <span className="text-slate-400 opacity-70"> // Base intercept</span></div>
              
              {Object.entries(modelInfo.coefficients).map(([feature, coef]) => (
                <div key={feature}>
                  <span className="text-slate-300">{coef > 0 ? '+' : '-'} {Math.abs(coef).toFixed(4)}</span>
                  <span className="text-green-400"> × {feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b pb-4">
            <BookOpen className="text-primary h-6 w-6" />
            <h2 className="text-xl font-semibold">3. How to interpret this</h2>
          </div>
          <ul className="space-y-3 text-muted-foreground list-disc pl-5">
            <li><strong>Intercept ({modelInfo.intercept.toFixed(2)}):</strong> The theoretical baseline price when all other features are 0 (which is physically impossible, but necessary for the math).</li>
            <li><strong>Area Coefficient:</strong> For every 1 sq ft increase in area, the price changes by ₹{modelInfo.coefficients['Area_Sqft'].toFixed(4)} Lakh, assuming everything else stays constant.</li>
            <li><strong>Categorical Encoding:</strong> 'Facing' was converted into numbers using One-Hot Encoding. If a flat faces East (and North was dropped as baseline), the 'Facing_East' coefficient is added to the price.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
