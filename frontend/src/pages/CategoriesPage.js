/**
 * Este archivo define la pagina de gestion de categorias.
 * Actua como contenedor ligero para el componente que implementa el CRUD completo.
 */
import React from 'react';
import CategoryManager from '../CategoryManager';

// Esta pagina muestra el gestor de categorias dentro de la estructura comun.
function CategoriesPage() {
  return (
    <main>
      <h2>Gestion de Categorias</h2>
      <CategoryManager />
    </main>
  );
}

export default CategoriesPage;
