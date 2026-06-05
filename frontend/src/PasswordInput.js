import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './PasswordInput.css';

function PasswordInput(props) {
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <span className="password-input-wrap">
      <input {...props} type={isVisible ? 'text' : 'password'} />
      <button
        type="button"
        className="password-input-toggle"
        aria-label={isVisible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
        aria-pressed={isVisible}
        onClick={() => setIsVisible((current) => !current)}
      >
        <Icon aria-hidden="true" />
      </button>
    </span>
  );
}

export default PasswordInput;
