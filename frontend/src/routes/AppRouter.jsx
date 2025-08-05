// src/routes/AppRouter.js
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import BookDetailsPage from "../pages/BookDetailsPage";
import MensajesPage from "../pages/MensajesPage";
import MisLibrosPage from "../pages/MisLibrosPage";
import CrearLibroPage from "../pages/CrearLibroPage";
import ProtectedRoute from "./ProtectedRoute";
import MainLayout from "../components/layout/MainLayout";
import AuthServiceInitializer from "../components/AuthServiceInitializer"; // Import the new component

const AppRouter = () => {
  return (
    <BrowserRouter>
      {/* Render the initializer component inside BrowserRouter */}
      <AuthServiceInitializer /> 

      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/libros/:id" element={<BookDetailsPage />} />
            <Route path="/mensajes" element={<MensajesPage />} />
            <Route path="/mis-libros" element={<MisLibrosPage />} />
            <Route path="/crear-libro" element={<CrearLibroPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;