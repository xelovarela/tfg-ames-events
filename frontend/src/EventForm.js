import React, { useEffect, useState } from 'react';

const EventForm = ({ onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    location_id: ''
  });

  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('http://localhost:3001/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error('Error loading categories:', err));

    fetch('http://localhost:3001/locations')
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(err => console.error('Error loading locations:', err));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const response = await fetch('http://localhost:3001/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: formData.title,
          category_id: parseInt(formData.category_id, 10),
          location_id: parseInt(formData.location_id, 10)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creating event');
      }

      setMessage('Evento creado correctamente');

      setFormData({
        title: '',
        category_id: '',
        location_id: ''
      });

      if (onEventCreated) {
        onEventCreated();
      }
    } catch (error) {
      console.error(error);
      setMessage('Error al crear el evento');
    }
  };

  return (
    <div style={{ padding: '1rem', background: '#f5f5f5', borderRadius: '8px', marginBottom: '1rem' }}>
      <h3>Crear nuevo evento</h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '0.5rem' }}>
          <input
            type="text"
            name="title"
            placeholder="Título"
            value={formData.title}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">Selecciona una categoría</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <select
            name="location_id"
            value={formData.location_id}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          >
            <option value="">Selecciona una ubicación</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" style={{ padding: '0.6rem 1rem', cursor: 'pointer' }}>
          Crear evento
        </button>
      </form>

      {message && <p style={{ marginTop: '0.75rem' }}>{message}</p>}
    </div>
  );
};

export default EventForm;