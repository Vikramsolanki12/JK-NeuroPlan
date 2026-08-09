import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Navbar from "./components/Navbar";

export default function App() {
  const { user, loading } = useContext(AuthContext);

  // 🔥 Prevent flashing before auth loads
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div
        className="min-h-screen 
        bg-white dark:bg-black 
        text-black dark:text-white 
        transition-all duration-300"
      >
        {/* Navbar always visible */}
        <Navbar />

        <Routes>
          {/* Home */}
          <Route path="/" element={<Home />} />

          {/* Auth page */}
          <Route
            path="/auth"
            element={user ? <Navigate to="/dashboard" /> : <Auth />}
          />

          {/* Protected Dashboard */}
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/auth" />}
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
