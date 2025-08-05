// src/components/AuthServiceInitializer.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // Importa useSelector
import { useNavigate } from 'react-router-dom';
import { initApiServices, getUserContact } from '../services/api'; // Importa getUserContact

const AuthServiceInitializer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token); // Obtiene el token del estado de Redux

  useEffect(() => {
    // Inicializa los servicios de API con dispatch y navigate
    // Esto se ejecuta una vez que AppRouter (y su BrowserRouter) están montados
    initApiServices(dispatch, navigate);
  }, [dispatch, navigate]);

  // Nuevo useEffect para verificar la validez del token al cargar la página
  useEffect(() => {
    const checkTokenValidity = async () => {
      if (token) { // Solo si hay un token guardado
        try {
          // Intenta hacer una llamada ligera a la API que requiera autenticación
          // Si el token está vencido, el interceptor de api.js capturará el 401
          await getUserContact('me'); // Asume que 'me' es un ID válido para el usuario actual
          console.log('Token es válido.');
        } catch (error) {
          // El interceptor ya debería manejar el logout y la redirección para 401.
          // Este catch es más para otros tipos de errores de red o del servidor.
          console.error('Error al verificar la validez del token:', error);
        }
      }
    };

    checkTokenValidity();
  }, [token]); // Se ejecutará cuando el componente se monte y cada vez que el token cambie

  return null; // Este componente no renderiza nada visual
};

export default AuthServiceInitializer;