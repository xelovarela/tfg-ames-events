import React, { useState } from 'react';

const EventForm = ({ onEventCreated }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    lat: '',
    lng: ''
  });

  const [message, setMessage] = useState('');

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
          category: formData.category,
          lat: parseFloat(formData.lat),
          lng: parseFloat(formData.lng)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error creating event');
      }

      setMessage('Evento creado correctamente');

      setFormData({
        title: '',
        category: '',
        lat: '',
        lng: ''
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
          <input
            type="text"
            name="category"
            placeholder="Categoría"
            value={formData.category}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <input
            type="number"
            step="any"
            name="lat"
            placeholder="Latitud"
            value={formData.lat}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>

        <div style={{ marginBottom: '0.5rem' }}>
          <input
            type="number"
            step="any"
            name="lng"
            placeholder="Longitud"
            value={formData.lng}
            onChange={handleChange}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
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