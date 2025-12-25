import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import App from "./App.jsx";   
import Help from "./Help.jsx";
import './theme.css';

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/help" element={<Help />} />
    </Routes>
  </BrowserRouter>
);
