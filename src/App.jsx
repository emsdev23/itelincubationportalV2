import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar";
import DocumentTable from "./Components/DocumentTable";
import StartupDashboard from "./Components/StartupDashboard/StartupDashboard";
import LoginForm from "./Components/Login/LoginForm";
function App() {
  return (
    <>
      <div>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LoginForm />} />
            <Route path="/Incubation/Dashboard" element={<Navbar />} />
            <Route
              path="/startup/Dashboard/:id"
              element={<StartupDashboard />}
            />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
