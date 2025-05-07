import { useParams } from 'react-router-dom';

const BookDetailsPage = () => {
  const { id } = useParams();

  return (
    <div className="container">
      <h1>Detalles del Libro</h1>
      <p>ID del libro: {id}</p>
      {/* Aquí irán los componentes para mostrar los detalles del libro */}
    </div>
  );
};

export default BookDetailsPage;