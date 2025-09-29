import { useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import Navbar from "./Components/Navbar";
import DocumentTable from "./Components/DocumentTable";
import StartupDashboard from "./Components/StartupDashboard/StartupDashboard";
import LoginForm from "./Components/Login/LoginForm";
import ProtectedRoute from "./Components/ProtectedRoute";
import { DataProvider } from "./Components/Datafetching/DataProvider";
import DocumentManagementPage from "./Components/DocumentUpload/DocumentManagementPage";
import { InactivityHandler } from "./Components/Datafetching/InactivityHandler";

function App() {
  return (
    <BrowserRouter>
      <DataProvider>
        <InactivityHandler>
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
            <Route
              path="/Incubation/Dashboard/AddDocuments"
              element={
                <ProtectedRoute>
                  <DocumentManagementPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </InactivityHandler>
      </DataProvider>
    </BrowserRouter>
  );
}

export default App;
