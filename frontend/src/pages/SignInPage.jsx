import React from 'react';
import { SignIn } from '@clerk/clerk-react';
import { Helmet } from 'react-helmet-async';
import Logo from '../components/Logo';

export default function SignInPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background px-4">
      <Helmet>
        <title>Sign In | FlatPredict AI</title>
      </Helmet>

      {/* Decorative Animated Background */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-emerald-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[20%] w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 pointer-events-none"></div>

      <div className="mb-8 relative z-10 flex flex-col items-center text-center">
        <Logo className="scale-125 mb-6" />
        <h1 className="text-3xl font-black tracking-tight text-slate-800">Welcome Back</h1>
        <p className="text-slate-500 font-medium mt-2">Sign in to access your predictions and dashboard.</p>
      </div>

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Glassmorphism Wrapper for Clerk */}
        <div className="bg-white/60 backdrop-blur-2xl border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-[2rem] p-2 flex justify-center">
          <SignIn 
            routing="path" 
            path="/sign-in" 
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-none w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border-slate-200/60 bg-white/50 hover:bg-white text-slate-600 transition-all rounded-xl",
                dividerLine: "bg-slate-200/50",
                dividerText: "text-slate-400",
                formFieldLabel: "text-slate-700 font-bold",
                formFieldInput: "bg-white/50 border-slate-200/60 rounded-xl focus:ring-primary focus:border-primary transition-all",
                formButtonPrimary: "bg-primary hover:bg-emerald-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all border-none",
                footerActionText: "text-slate-500",
                footerActionLink: "text-primary hover:text-emerald-700 font-bold"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
