import React from 'react';
import Navbar from '../components/layout/Navbar'; // Ajustá la ruta si es necesario

const HomePage = () => {
  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Página de Inicio</h1>
        <p>Bienvenido a la página de inicio de la aplicación de intercambio de libros.</p>
        {/* Aquí irán los componentes para mostrar la lista de libros */}
      </div>
    </>
  );
};

export default HomePage;
