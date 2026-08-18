import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Home, Calculator, BarChart3, BookOpen } from 'lucide-react';
import { cn } from '../lib/utils';

export default function MainLayout() {
  const location = useLocation();

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
            <Calculator className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl hidden sm:inline-block">FlatPredict AI</span>
          </div>
          
          <nav className="flex items-center gap-6">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline-block">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>

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
