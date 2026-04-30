/**
 * Este archivo implementa el gestor de categorías del frontend.
 * Carga el catálogo, valida el formulario, permite altas, ediciones y borrados,
 * y mantiene el estado visual sincronizado con la API.
 */
import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from './config';
import { withAuthHeaders } from './utils/authFetch';
import { resolveImageUrl } from './utils/eventImages';
import './CategoryManager.css';

// Estado base del formulario de categorías.
const initialForm = { name: '', image_url: '', remove_image: false };

// Valida el nombre antes de enviarlo al backend.
function validateCategory(name) {
  const value = name.trim();
  if (!value || value.length > 100) {
    return 'El nombre es obligatorio y debe tener entre 1 y 100 caracteres.';
  }
  return null;
}

// Este componente concentra la logica CRUD de categorías.
function CategoryManager({ onCategoriesChanged }) {
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Recupera el catálogo actual de categorías desde la API.
  const loadCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/categories`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'No se pudieron cargar las categorías');
      }
      setCategories(data);
    } catch (error) {
      console.error(error);
      setMessage(error.message);
    }
  };

  // La lista se carga una sola vez al montar el componente.
  useEffect(() => {
    loadCategories();
  }, []);

  // Limpia el formulario y sale del modo edición.
  const clearSelectedImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview('');
  };

  const clearForm = () => {
    setFormData(initialForm);
    clearSelectedImage();
    setEditingId(null);
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(file);
    setImagePreview(file ? URL.createObjectURL(file) : '');
    setFormData((currentForm) => ({ ...currentForm, remove_image: false }));
  };

  // Decide si crear o actualizar en funcion de si existe un id en edición.
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

    const payload = new FormData();
    payload.append('name', formData.name.trim());

    if (imageFile) {
      payload.append('image', imageFile);
    }

    if (formData.remove_image) {
      payload.append('remove_image', '1');
    }

    const endpoint = editingId
      ? `${API_BASE_URL}/categories/${editingId}`
      : `${API_BASE_URL}/categories`;
    const method = editingId ? 'PUT' : 'POST';

    try {
      const response = await fetch(endpoint, {
        method,
        headers: withAuthHeaders(),
        body: payload
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error guardando categoría');
      }

      setMessage(editingId ? 'Categoria actualizada correctamente.' : 'Categoria creada correctamente.');
      clearForm();
      await loadCategories();
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error guardando categoría');
    } finally {
      setIsSaving(false);
    }
  };

  // El borrado pide confirmación y refresca el catálogo cuándo termina.
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Seguro que quieres eliminar esta categoría?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: withAuthHeaders()
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Error eliminando categoría');
      }

      setMessage('Categoria eliminada correctamente.');
      await loadCategories();
      if (onCategoriesChanged) onCategoriesChanged();
    } catch (error) {
      console.error(error);
      setMessage(error.message || 'Error eliminando categoría');
    }
  };

  return (
    <section className="categories-card">
      <h3 className="categories-title">Gestión de categorías</h3>

      {/* Formulario de alta y edición de categorías. */}
      <form className="categories-form" onSubmit={handleSubmit}>
        <input
          className="categories-input"
          type="text"
          name="name"
          placeholder="Nombre de la categoría"
          value={formData.name}
          onChange={(event) => setFormData((currentForm) => ({ ...currentForm, name: event.target.value }))}
          maxLength={100}
          required
        />

        <label className="categories-image-field">
          <span>Imagen</span>
          <input
            className="categories-input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleImageChange}
          />
        </label>

        {editingId && formData.image_url && (
          <label className="categories-remove-image">
            <input
              type="checkbox"
              checked={formData.remove_image}
              onChange={(event) => {
                setFormData((currentForm) => ({
                  ...currentForm,
                  remove_image: event.target.checked
                }));
                if (event.target.checked) {
                  clearSelectedImage();
                }
              }}
            />
            <span>Quitar imagen actual</span>
          </label>
        )}

        {(imagePreview || (!formData.remove_image && formData.image_url)) && (
          <div className="categories-image-preview">
            <img src={imagePreview || resolveImageUrl(formData.image_url)} alt="Vista previa de la categoria" />
          </div>
        )}

        <div className="categories-actions">
          <button className="categories-btn categories-btn-primary" type="submit" disabled={isSaving}>
            {isSaving ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear categoría'}
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
          <p>No hay categorías registradas.</p>
        ) : (
          categories.map((category) => (
            <article className="categories-item" key={category.id}>
              <div className="categories-item-image">
                {category.image_url ? (
                  <img src={resolveImageUrl(category.image_url)} alt={`Imagen de ${category.name}`} />
                ) : (
                  <span>Sin imagen</span>
                )}
              </div>
              <strong>{category.name}</strong>
              <div className="categories-item-actions">
                <button
                  className="categories-btn categories-btn-secondary"
                  onClick={() => {
                    setEditingId(category.id);
                    setFormData({
                      name: category.name,
                      image_url: category.image_url || '',
                      remove_image: false
                    });
                    clearSelectedImage();
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
