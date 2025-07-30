import React from "react";
import { Link } from "react-router-dom";
import { FaBook } from "react-icons/fa";

const estadoColor = {
  "Muy bueno": "bg-green-100 text-green-700",
  "Bueno": "bg-yellow-100 text-yellow-700",
  "Nuevo": "bg-blue-100 text-blue-700",
};

const fondoColor = {
  "Muy bueno": "bg-blue-100",
  "Bueno": "bg-green-100",
  "Nuevo": "bg-pink-100",
};

const BookCard = ({ book }) => {
  return (
    <div className="flex flex-col justify-between rounded-xl shadow-md p-4 w-full max-w-xs mx-auto bg-white hover:shadow-lg transition-all">
      <div className="flex flex-col items-center text-center">
        <div className={`w-16 h-16 rounded-md flex items-center justify-center text-white text-2xl mb-4 ${fondoColor[book.estado] || "bg-gray-200"}`}>
          <FaBook />
        </div>
        <h2 className="text-lg font-semibold">{book.titulo}</h2>
        <p className="text-sm text-gray-500">{book.autor}</p>
        <p className="text-xs text-gray-400 mt-1">{book.idioma}</p>

        <div className={`text-xs px-2 py-1 mt-2 rounded-full font-medium ${estadoColor[book.estado] || "bg-gray-100 text-gray-600"}`}>
          {book.estado}
        </div>

        <div className="mt-3 text-sm text-gray-700">
          📚 {book.usuario_nombre}
        </div>
      </div>

      <Link
        to={`/libro/${book.id}`}
        className="mt-4 bg-violet-600 text-white text-sm px-4 py-2 rounded-full hover:bg-violet-700 text-center"
      >
        Ver detalles
      </Link>
    </div>
  );
};

export default BookCard;