import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./components/Login";
import Signup from "./components/Signup";
import Profile from "./components/Profile"; 
import Onboarding from "./components/Onboarding";
import ProtectedRoute from "./components/ProtectedRoute";

// A layout wrapper to enforce full-width alignment and remove awkward centering
const DashboardLayout = ({ children }) => {
  return (
    <div className="flex justify-start items-start w-full min-h-screen m-0 p-0 bg-[#0d1117] text-white overflow-x-hidden">
      {children}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Auth Routes (No extra side-padding/alignment blocks) */}
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Onboarding Screen */}
          <Route 
            path="/onboarding" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Onboarding />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Protected Profile Dashboard */}
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Profile />
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
