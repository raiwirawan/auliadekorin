import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import CreatePage from './pages/CreatePage';
import PublicWeddingPage from './pages/PublicWeddingPage';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/create" element={<CreatePage />} />
        <Route path="/w/:slug" element={<PublicWeddingPage />} />
      </Routes>
    </Router>
  );
}
