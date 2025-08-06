// src/components/AuthServiceInitializer.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { initApiServices, getUserContact } from '../services/api';

const AuthServiceInitializer = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  const loggedInUser = useSelector((state) => state.auth.user); // Obtén el objeto de usuario

  useEffect(() => {
    initApiServices(dispatch, navigate);
  }, [dispatch, navigate]);

  useEffect(() => {
    const checkTokenValidity = async () => {
      // Solo procede si hay un token Y un objeto de usuario con un ID
      if (token && loggedInUser && loggedInUser.id) {
        try {
          // ✨✨✨ CAMBIO AQUÍ: Usa loggedInUser.id en lugar de 'me' ✨✨✨
          await getUserContact(loggedInUser.id);
          console.log('Token es válido y el usuario existe.');
        } catch (error) {
          // El interceptor ya debería manejar los errores 401.
          // Este catch es para otros errores de red o del servidor.
          console.error('Error al verificar la validez del token:', error);
        }
      } else if (!token && !loggedInUser) {
        console.log("No hay token ni usuario logueado. No se verifica la validez del token.");
      }
    };

    checkTokenValidity();
  }, [token, loggedInUser]); // Depende del token y del objeto de usuario

  return null;
};

export default AuthServiceInitializer;