import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar";
import DocumentTable from "./Components/DocumentTable";
import StartupDashboard from "./Components/StartupDashboard/StartupDashboard";
import LoginForm from "./Components/Login/LoginForm";
import ProtectedRoute from "./Components/ProtectedRoute";

import { DataProvider } from "./Components/Datafetching/DataProvider";
function App() {
  return (
    <>
      <div>
        <BrowserRouter>
          <DataProvider>
            <Routes>
              <Route path="/" element={<LoginForm />} />
              <Route
                path="/Incubation/Dashboard"
                element={
                  <ProtectedRoute>
                    <Navbar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/startup/Dashboard/:id"
                element={
                  <ProtectedRoute>
                    <StartupDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </DataProvider>
        </BrowserRouter>
      </div>
    </>
  );
}

export default App;
