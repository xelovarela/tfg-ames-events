import React, { useCallback, useEffect, useState } from 'react';
import EventList from '../EventList';
import { addFavorite, listFavorites, removeFavorite } from '../utils/favoritesApi';

function FavoritesPage({ session }) {
  const [favorites, setFavorites] = useState([]);
  const [loadError, setLoadError] = useState('');
  const isAuthenticated = Boolean(session?.token);

  const loadFavorites = useCallback(async () => {
    if (!isAuthenticated) {
      setFavorites([]);
      return;
    }

    try {
      const data = await listFavorites();
      setFavorites(Array.isArray(data) ? data : []);
      setLoadError('');
    } catch (error) {
      console.error(error);
      setFavorites([]);
      setLoadError(error.message || 'No se pudieron cargar tus favoritos');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleToggleFavorite = async (eventId, isFavorite) => {
    if (isFavorite) {
      await removeFavorite(eventId);
      setFavorites((current) => current.filter((event) => Number(event.id) !== Number(eventId)));
      return;
    }

    await addFavorite(eventId);
    await loadFavorites();
  };

  return (
    <main>
      <h2>Mis Favoritos</h2>

      {loadError && <p className="event-filters-feedback event-filters-feedback-error">{loadError}</p>}

      <EventList
        events={favorites}
        favoriteEventIds={favorites.map((event) => Number(event.id))}
        onToggleFavorite={handleToggleFavorite}
        showFavoriteButton
        canManageEvents={false}
        emptyMessage="Aun no tienes eventos favoritos."
        showEmptyState={!loadError}
      />
    </main>
  );
}

export default FavoritesPage;
