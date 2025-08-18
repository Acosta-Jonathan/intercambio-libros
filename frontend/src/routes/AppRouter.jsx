// src/routes/AppRouter.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
// No necesitamos useDispatch ni useNavigate aquí directamente
// import { useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";

import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import MiPerfilPage from "../pages/MiPerfilPage";
import CrearLibroPage from "../pages/CrearLibroPage";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import AuthServiceInitializer from "../components/AuthServiceInitializer";
import UserProfilePage from "../pages/UserProfilePage";
import MensajeriaPage from "../pages/MensajeriaPage";

const AppRouter = () => {
  return (
    <BrowserRouter>
      {/* Renderiza AuthServiceInitializer como un componente React */}
      <AuthServiceInitializer />

      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/perfil/:userId" element={<UserProfilePage />} />
            <Route path="/mis-libros" element={<MiPerfilPage />} />
            <Route path="/crear-libro" element={<CrearLibroPage />} />
            <Route path="/mensajeria" element={<MensajeriaPage />} />
            <Route path="/mensajeria/:id" element={<MensajeriaPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
