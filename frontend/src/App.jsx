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
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';

function App() {
  return (
    <HelmetProvider>
      <Router>
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
        <Toaster position="top-right" />
      </Router>
    </HelmetProvider>
  );
}

export default App;
