import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import './CategoryManager.css';

const initialForm = { name: '' };

function validateCategory(name) {
  const value = name.trim();
  if (!value || value.length > 100) {
    return 'El nombre es obligatorio y debe tener entre 1 y 100 caracteres.';
  }
  return null;
}

function CategoryManager({ onCategoriesChanged }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar las categorias');
      }
      setCategories(data);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const clearForm = () => {
    setFormData(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSaving) return;

    const validationError = validateCategory(formData.name);
    if (validationError) {
      setMessage(validationError);
      return;
    }

    setIsSaving(true);
    setMessage('');

    const payload = { name: formData.name.trim() };
    const endpoint = editingId
      ? `${API_BASE_URL}/categories/${editingId}`
      : `${API_BASE_URL}/categories`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error guardando categoria');
      }

      setMessage(editingId ? 'Categoria actualizada correctamente.' : 'Categoria creada correctamente.');
      clearForm();
      await loadCategories();
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error guardando categoria');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm('Seguro que quieres eliminar esta categoria?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error eliminando categoria');
      }

      setMessage('Categoria eliminada correctamente.');
      await loadCategories();
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error eliminando categoria');
    }
  };

  return (
    <section className="categories-card">
      <h3 className="categories-title">Gestion de categorias</h3>

      <form className="categories-form" onSubmit={handleSubmit}>
        <input
          className="categories-input"
          type="text"
          name="name"
          placeholder="Nombre de la categoria"
          value={formData.name}
          onChange={(event) => setFormData({ name: event.target.value })}
          maxLength={100}
          required
        />

        <div className="categories-actions">
          <button className="categories-btn categories-btn-primary" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear categoria'}
          </button>
          {editingId && (
            <button className="categories-btn categories-btn-secondary" type="button" onClick={clearForm}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {message && <p className="categories-message">{message}</p>}

      <div className="categories-list">
        {categories.length === 0 ? (
          <p>No hay categorias registradas.</p>
        ) : (
          categories.map((category) => (
            <article className="categories-item" key={category.id}>
              <strong>{category.name}</strong>
              <div className="categories-item-actions">
                <button
                  className="categories-btn categories-btn-secondary"
                  onClick={() => {
                    setEditingId(category.id);
                    setFormData({ name: category.name });
                    setMessage('');
                  }}
                >
                  Editar
                </button>
                <button className="categories-btn categories-btn-danger" onClick={() => handleDelete(category.id)}>
                  Eliminar
                </button>
              </div>
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default CategoryManager;
