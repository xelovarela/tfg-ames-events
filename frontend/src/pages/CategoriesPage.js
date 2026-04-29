/**
 * Este archivo define la página de gestión de categorías.
 * Actua como contenedor ligero para el componente que implementa el CRUD completo.
 */
import React from 'react';
import CategoryManager from '../CategoryManager';

// Esta página muestra el gestor de categorías dentro de la estructura comun.
function CategoriesPage() {
  return (
    <main>
      <h2>Gestión de Categorías</h2>
      <CategoryManager />
    </main>
  );
}

export default CategoriesPage;
