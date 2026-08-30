import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import { Loader2 } from 'lucide-react';

// Lazy loaded routes for massive performance boost
const PredictionPage = React.lazy(() => import('./pages/PredictionPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const MLExplorerPage = React.lazy(() => import('./pages/MLExplorerPage'));
const HistoryPage = React.lazy(() => import('./pages/HistoryPage'));
const SignInPage = React.lazy(() => import('./pages/SignInPage'));
const SignUpPage = React.lazy(() => import('./pages/SignUpPage'));

export const preloadRoute = (path) => {
  if (path === '/predict') import('./pages/PredictionPage');
  if (path === '/dashboard') import('./pages/DashboardPage');
  if (path === '/explore') import('./pages/MLExplorerPage');
};

const PageLoader = () => (
  <div className="flex h-[70vh] w-full flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="absolute inset-0 bg-emerald-400/20 blur-xl rounded-full"></div>
      <Loader2 className="h-10 w-10 animate-spin text-emerald-600 relative z-10" />
    </div>
    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Loading Application</p>
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <Router>
        <React.Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Custom Auth Routes (No MainLayout wrapper so they take full screen beautifully) */}
            <Route path="/sign-in/*" element={<SignInPage />} />
            <Route path="/sign-up/*" element={<SignUpPage />} />

            <Route path="/" element={<MainLayout />}>
              {/* Public Routes */}
              <Route index element={<LandingPage />} />
              <Route path="explore" element={<MLExplorerPage />} />

              {/* Protected Routes */}
              <Route path="predict" element={
                <>
                  <SignedIn><PredictionPage /></SignedIn>
                  <SignedOut><RedirectToSignIn /></SignedOut>
                </>
              } />
              <Route path="dashboard" element={
                <>
                  <SignedIn><DashboardPage /></SignedIn>
                  <SignedOut><RedirectToSignIn /></SignedOut>
                </>
              } />
              <Route path="history" element={
                <>
                  <SignedIn><HistoryPage /></SignedIn>
                  <SignedOut><RedirectToSignIn /></SignedOut>
                </>
              } />
            </Route>
          </Routes>
        </React.Suspense>
        <Toaster position="top-right" />
      </Router>
    </HelmetProvider>
  );
}

export default App;
