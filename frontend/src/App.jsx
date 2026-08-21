import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import PredictionPage from './pages/PredictionPage';
import DashboardPage from './pages/DashboardPage';
import MLExplorerPage from './pages/MLExplorerPage';
import HistoryPage from './pages/HistoryPage';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <SignedIn>
          <Routes>
            <Route path="/" element={<MainLayout />}>
              <Route index element={<LandingPage />} />
              <Route path="predict" element={<PredictionPage />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="explore" element={<MLExplorerPage />} />
              <Route path="history" element={<HistoryPage />} />
            </Route>
          </Routes>
        </SignedIn>
        <SignedOut>
          <RedirectToSignIn />
        </SignedOut>
        <Toaster position="top-right" />
      </Router>
    </HelmetProvider>
  );
}

export default App;
