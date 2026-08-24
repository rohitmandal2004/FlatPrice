import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, Outlet, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { Home, Calculator, BarChart3, BookOpen, History } from 'lucide-react';
import { cn } from '../lib/utils';
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import Logo from '../components/Logo';
import { Dock } from '../components/ui/dock-two';

export default function MainLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentOutlet = useOutlet();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Predict Price', href: '/predict', icon: Calculator },
    { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
    { name: 'How It Works', href: '/explore', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo />
          </div>
          
          <div className="flex items-center">
            <nav className="hidden md:flex items-center gap-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "relative flex items-center gap-2 text-sm font-bold px-4 py-2 transition-colors duration-300 rounded-full",
                      isActive ? "text-emerald-700" : "text-slate-500 hover:text-emerald-600"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="desktopNavBubble"
                        className="absolute inset-0 bg-emerald-50 rounded-full -z-10 shadow-sm border border-emerald-100/50"
                        transition={{ type: "spring", stiffness: 350, damping: 30, mass: 0.8 }}
                      />
                    )}
                    <Icon className={cn("h-4 w-4 transition-colors", isActive ? "text-emerald-600" : "")} />
                    <span className="relative z-10">{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="ml-4 flex items-center">
              <SignedIn>
                <UserButton afterSignOutUrl="/" />
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="bg-primary text-primary-foreground px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
                    Sign In
                  </button>
                </SignInButton>
              </SignedOut>
            </div>
          </div>
        </div>
      </header>

      <AnimatePresence mode="wait">
        <motion.main 
          key={location.pathname}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.02, y: -10 }}
          transition={{ 
            duration: 0.4, 
            ease: [0.22, 1, 0.36, 1] 
          }}
          style={{ willChange: 'transform, opacity' }}
          className="flex-1 container mx-auto px-4 pt-8 pb-24 md:pb-8 flex flex-col"
        >
          {currentOutlet}
        </motion.main>
      </AnimatePresence>

      {/* Mobile Bottom Navigation (Replaced with Dock) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]">
        <Dock 
          items={navigation.map(item => ({
            icon: item.icon,
            label: item.name,
            isActive: location.pathname === item.href,
            onClick: () => navigate(item.href)
          }))}
        />
      </div>

      <footer className="border-t py-6 md:py-0">
        <div className="container mx-auto px-4 flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row">
          <p className="text-sm text-muted-foreground text-center">
            Educational ML Project - Not for actual market valuation.
          </p>
        </div>
      </footer>
    </div>
  );
}
