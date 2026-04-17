import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../config';
import { setAuthSession } from '../utils/authStorage';
import { withAuthHeaders } from '../utils/authFetch';
import './ProfilePage.css';

function getDisplayName(user) {
  return user?.username || '';
}

function getInitial(user) {
  const source = getDisplayName(user) || user?.email || 'U';
  return source.trim().charAt(0).toUpperCase() || 'U';
}

async function readJsonOrThrow(response, fallbackMessage) {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error || fallbackMessage);
  }
  return data;
}

function ProfilePage({ session }) {
  const [profile, setProfile] = useState(() => session?.user || null);
  const [username, setUsername] = useState(() => getDisplayName(session?.user));
  const [profileMessage, setProfileMessage] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const mergedSession = useMemo(() => ({
    token: session?.token,
    user: {
      ...session?.user,
      ...profile
    }
  }), [profile, session]);

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          headers: withAuthHeaders()
        });
        const data = await readJsonOrThrow(response, 'No se pudo cargar tu perfil.');
        if (data?.user) {
          const nextUser = {
            ...data.user
          };
          setProfile(nextUser);
          setUsername(getDisplayName(nextUser));
          if (session?.token) {
            setAuthSession({ token: session.token, user: nextUser });
          }
        }
      } catch (error) {
        console.error(error);
        setProfileMessage(error.message || 'No se pudo cargar tu perfil.');
      }
    }

    loadProfile();
  }, [session?.token]);

  const handleUsernameSubmit = async (event) => {
    event.preventDefault();
    if (isProfileSaving) {
      return;
    }

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setProfileMessage('El nombre de usuario no puede estar vacio.');
      return;
    }

    setIsProfileSaving(true);
    setProfileMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'PATCH',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ username: trimmedUsername })
      });
      const data = await readJsonOrThrow(response, 'No se pudo actualizar el perfil.');
      const nextUser = {
        ...mergedSession.user,
        ...data.user,
        username: data.user?.username || trimmedUsername
      };

      setProfile(nextUser);
      setUsername(getDisplayName(nextUser));
      if (session?.token) {
        setAuthSession({ token: session.token, user: nextUser });
      }
      setProfileMessage(data.message || 'Perfil actualizado correctamente.');
    } catch (error) {
      console.error(error);
      setProfileMessage(error.message || 'No se pudo actualizar el perfil.');
    } finally {
      setIsProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    if (isPasswordSaving) {
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('Todos los campos de contrasena son obligatorios.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage('La nueva contrasena debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Las contrasenas no coinciden.');
      return;
    }

    setIsPasswordSaving(true);
    setPasswordMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/users/me/password`, {
        method: 'PATCH',
        headers: withAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      const data = await readJsonOrThrow(response, 'No se pudo cambiar la contrasena.');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage(data.message || 'Contrasena actualizada correctamente.');
    } catch (error) {
      console.error(error);
      setPasswordMessage(error.message || 'No se pudo cambiar la contrasena.');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const verifiedText = profile?.email_verified ? 'Verificado' : 'Pendiente de verificacion';

  return (
    <main>
      <h2>Mi perfil</h2>

      <section className="profile-card profile-summary">
        <div className="profile-avatar" aria-hidden="true">
          {getInitial(profile)}
        </div>
        <div>
          <h3>{getDisplayName(profile) || 'Usuario'}</h3>
          <p>{profile?.email || 'Email no disponible'}</p>
        </div>
      </section>

      <section className="profile-grid">
        <article className="profile-card">
          <h3>Informacion de la cuenta</h3>
          <dl className="profile-data-list">
            <div>
              <dt>Nombre de usuario</dt>
              <dd>{getDisplayName(profile) || 'No disponible'}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{profile?.email || 'No disponible'}</dd>
            </div>
            <div>
              <dt>Rol</dt>
              <dd>{profile?.role || 'No disponible'}</dd>
            </div>
            <div>
              <dt>Verificacion del email</dt>
              <dd>{verifiedText}</dd>
            </div>
          </dl>
        </article>

        <article className="profile-card">
          <h3>Editar nombre de usuario</h3>
          <form className="profile-form" onSubmit={handleUsernameSubmit}>
            <label htmlFor="profile-username">Nombre de usuario</label>
            <input
              id="profile-username"
              className="profile-input"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              maxLength={100}
            />
            <button className="profile-btn profile-btn-primary" type="submit" disabled={isProfileSaving}>
              {isProfileSaving ? 'Guardando...' : 'Guardar usuario'}
            </button>
          </form>
          {profileMessage && <p className="profile-message">{profileMessage}</p>}
        </article>

        <article className="profile-card">
          <h3>Cambiar contrasena</h3>
          <form className="profile-form" onSubmit={handlePasswordSubmit}>
            <label htmlFor="current-password">Contrasena actual</label>
            <input
              id="current-password"
              className="profile-input"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />

            <label htmlFor="profile-new-password">Nueva contrasena</label>
            <input
              id="profile-new-password"
              className="profile-input"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
            />

            <label htmlFor="profile-confirm-password">Confirmar nueva contrasena</label>
            <input
              id="profile-confirm-password"
              className="profile-input"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />

            <button className="profile-btn profile-btn-primary" type="submit" disabled={isPasswordSaving}>
              {isPasswordSaving ? 'Actualizando...' : 'Cambiar contrasena'}
            </button>
          </form>
          {passwordMessage && <p className="profile-message">{passwordMessage}</p>}
        </article>
      </section>
    </main>
  );
}

export default ProfilePage;
