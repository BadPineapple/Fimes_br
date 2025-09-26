import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navigation from "./components/Navigation";
import Footer from "./components/Footer";

import HomePage from "./pages/HomePage";
import FilmsPage from "./pages/FilmsPage";
import FilmDetailPage from "./pages/FilmDetailPage";
import ProfilePage from "./pages/ProfilePage";
import EncontrarPage from "./pages/EncontrarPage";
import ApoiePage from "./pages/ApoiePage";
import ModeratorDashboard from "./pages/ModeratorDashboard";

import "./App.css";
import "./index.css";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-white flex flex-col">
          <Navigation />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/films" element={<FilmsPage />} />
              <Route path="/films/:id" element={<FilmDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:id" element={<ProfilePage />} />
              <Route path="/encontrar" element={<EncontrarPage />} />
              <Route path="/apoie" element={<ApoiePage />} />
              <Route path="/moderator" element={<ModeratorDashboard />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
