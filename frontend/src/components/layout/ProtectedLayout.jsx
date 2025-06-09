// src/components/layout/ProtectedLayout.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import Navbar from './Navbar'; // Importamos Navbar desde el mismo directorio

const ProtectedLayout = () => {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);

  // Si no está autenticado, redirige al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza el Navbar y el contenido de la ruta anidada
  return (
    <>
      <Navbar /> {/* El Navbar se muestra en todas las rutas protegidas */}
      <div style={{ paddingTop: '70px' }}> {/* Padding para que el contenido no quede debajo del Navbar fijo */}
        <Outlet /> {/* Aquí se renderizará el contenido de la ruta hija */}
      </div>
    </>
  );
};

export default ProtectedLayout;