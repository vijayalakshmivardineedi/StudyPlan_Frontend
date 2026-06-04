import { Route, Routes, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import "../style.css";
import WelcomePage from "../welcomePage/WelcomePage.jsx";
import Login from "../auth/login.jsx";
import Signup from "../auth/signup.jsx";
import Home from "../home/Home.jsx";
import AppLayout from "./AppLayout.jsx";
import Text from "../text/Text.jsx";
import Profile from "../auth/Profile.jsx";
import JourneyDetail from "../journey/JourneyDetail.jsx";
import History from "../history/History.jsx";

const Layout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    // If user has token, redirect to profile immediately
    if (token && window.location.pathname === "/") {
      navigate("/profile");
      return;
    }

    // If on home page and no token, show welcome page then redirect to login
    if (window.location.pathname === "/") {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return (
    <div className="layout">
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Routes with Navbar */}
        <Route element={<AppLayout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/text" element={<Text />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/journey/:roadmapId" element={<JourneyDetail />} />
          <Route path="/history" element={<History />} />
        </Route>
      </Routes>
    </div>
  );
};

export default Layout;
