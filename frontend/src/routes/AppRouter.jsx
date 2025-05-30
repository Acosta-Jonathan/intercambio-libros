// src/routes/AppRouter.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedLayout from '../components/layout/ProtectedLayout'; // Importamos el ProtectedLayout
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import BookDetailsPage from '../pages/BookDetailsPage';
import MensajesPage from '../pages/MensajesPage'; // Si ya la tienes
// import ProfilePage from '../pages/ProfilePage'; // Si ya la tienes

const AppRouter = () => {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Rutas protegidas - usar ProtectedLayout */}
        <Route path="/" element={<ProtectedLayout />}>
          <Route index element={<HomePage />} /> {/* La ruta raíz "/" ahora es hija de ProtectedLayout */}
          <Route path="books/:id" element={<BookDetailsPage />} />
          <Route path="messages" element={<MensajesPage />} />
          {/* <Route path="profile" element={<ProfilePage />} /> */}
          {/* Agrega aquí cualquier otra ruta que necesite estar protegida y usar el Navbar */}
        </Route>

        {/* Ruta comodín para 404 (opcional) */}
        <Route path="*" element={<h1>404: Página no encontrada</h1>} />
      </Routes>
    </Router>
  );
};

export default AppRouter;