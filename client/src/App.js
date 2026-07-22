import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import Home from "./components/common/Home";
import Login from "./components/common/Login";
import SignUp from "./components/common/SignUp";
import FooterC from "./components/common/FooterC";

import HomePage from "./components/user/HomePage";
import Complaint from "./components/user/Complaint";
import Status from "./components/user/Status";

import AgentHome from "./components/agent/AgentHome";

import AdminHome from "./components/admin/AdminHome";

const roleToRoute = {
  Admin: "/dashboard",
  Agent: "/agent",
  Ordinary: "/home",
};

function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });

  const handleAuthSuccess = (loggedInUser, token) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(loggedInUser));
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const Protected = ({ roles, children }) => {
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
    return children;
  };

  return (
    <BrowserRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <div className="d-flex flex-column min-vh-100">
        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/login"
              element={
                <Login onAuthSuccess={handleAuthSuccess} roleToRoute={roleToRoute} />
              }
            />
            <Route
              path="/signup"
              element={
                <SignUp onAuthSuccess={handleAuthSuccess} roleToRoute={roleToRoute} />
              }
            />

            {/* Ordinary user routes */}
            <Route
              path="/home"
              element={
                <Protected roles={["Ordinary"]}>
                  <HomePage user={user} onLogout={handleLogout} />
                </Protected>
              }
            />
            <Route
              path="/home/new-complaint"
              element={
                <Protected roles={["Ordinary"]}>
                  <Complaint />
                </Protected>
              }
            />
            <Route
              path="/home/status/:id"
              element={
                <Protected roles={["Ordinary"]}>
                  <Status user={user} />
                </Protected>
              }
            />

            {/* Agent routes */}
            <Route
              path="/agent"
              element={
                <Protected roles={["Agent"]}>
                  <AgentHome user={user} onLogout={handleLogout} />
                </Protected>
              }
            />

            {/* Admin routes */}
            <Route
              path="/dashboard"
              element={
                <Protected roles={["Admin"]}>
                  <AdminHome onLogout={handleLogout} />
                </Protected>
              }
            />
            <Route
              path="/admin"
              element={
                <Protected roles={["Admin"]}>
                  <AdminHome onLogout={handleLogout} />
                </Protected>
              }
            />
          </Routes>
        </div>
        <FooterC />
      </div>
    </BrowserRouter>
  );
}

export default App;
