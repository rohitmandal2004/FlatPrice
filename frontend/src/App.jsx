import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import PredictionPage from './pages/PredictionPage';
import DashboardPage from './pages/DashboardPage';
import MLExplorerPage from './pages/MLExplorerPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="predict" element={<PredictionPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="explore" element={<MLExplorerPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
