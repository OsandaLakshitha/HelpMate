import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import JobRecomendation from "./pages/JobRecomendation";
import PeerMaatching from "./pages/PeerMatching";

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50/30 to-teal-50/50">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/job-recommendation" element={<JobRecomendation />} />
          <Route path="/peer-matching" element={<PeerMaatching />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
