/**
 * Pagina de perfil.
 * Permite consultar la cuenta, cambiar el nombre visible y actualizar la contrasena.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { API_BASE_URL } from '../config';
import PasswordInput from '../PasswordInput';
import { setAuthSession } from '../utils/authStorage';
import { withAuthHeaders } from '../utils/authFetch';
import { validatePasswordChange, validateProfileUsername } from '../utils/accountValidation';
import { readJsonResponse } from '../utils/http';
import './ProfilePage.css';

function getDisplayName(user) {
  return user?.username || '';
}

function getInitial(user) {
  const source = getDisplayName(user) || user?.email || 'U';
  return source.trim().charAt(0).toUpperCase() || 'U';
}

async function readJsonOrThrow(response, fallbackMessage) {
  return readJsonResponse(response, fallbackMessage);
}

function ProfilePage({ session }) {
  // Separamos datos de perfil y contrasena para validar cada formulario por su cuenta.
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

    const usernameValidationError = validateProfileUsername(username);
    if (usernameValidationError) {
      setProfileMessage(usernameValidationError);
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

    const passwordValidationError = validatePasswordChange({ currentPassword, newPassword, confirmPassword });
    if (passwordValidationError) {
      setPasswordMessage(passwordValidationError);
      return;
    }

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordMessage('Todos los campos de contraseña son obligatorios.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordMessage('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage('Las contraseñas no coinciden.');
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
      const data = await readJsonOrThrow(response, 'No se pudo cambiar la contraseña.');

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage(data.message || 'Contrasena actualizada correctamente.');
    } catch (error) {
      console.error(error);
      setPasswordMessage(error.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const verifiedText = profile?.email_verified ? 'Verificado' : 'Pendiente de verificación';

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
          <h3>Cambiar contraseña</h3>
          <form className="profile-form" onSubmit={handlePasswordSubmit}>
            <label htmlFor="current-password">Contrasena actual</label>
            <PasswordInput
              id="current-password"
              className="profile-input"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              autoComplete="current-password"
            />

            <label htmlFor="profile-new-password">Nueva contraseña</label>
            <PasswordInput
              id="profile-new-password"
              className="profile-input"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password"
            />

            <label htmlFor="profile-confirm-password">Confirmar nueva contraseña</label>
            <PasswordInput
              id="profile-confirm-password"
              className="profile-input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password"
            />

            <button className="profile-btn profile-btn-primary" type="submit" disabled={isPasswordSaving}>
              {isPasswordSaving ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </form>
          {passwordMessage && <p className="profile-message">{passwordMessage}</p>}
        </article>
      </section>
    </main>
  );
}

export default ProfilePage;
