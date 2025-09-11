import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar";
import DocumentTable from "./Components/DocumentTable";
import StartupDashboard from "./Components/StartupDashboard/StartupDashboard";
function App() {
  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navbar />} />
            <Route path="/startup/Dashboard" element={<StartupDashboard />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
