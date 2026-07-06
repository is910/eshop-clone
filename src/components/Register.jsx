import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Register.css';

const EyeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const EyeOffIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const AlertIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const Register = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const clearError = () => { if (error) setError(null); };

  const passwordsMatch = confirmPassword && password === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        onAuthSuccess(data.authToken, data.role);
        navigate('/');
      } else {
        setError(data.error || 'Registration failed.');
      }
    } catch (err) {
      setError('Cannot reach backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="register-form" onSubmit={handleSubmit} noValidate>
      <div className="register-form__header">
        <h2 className="register-form__title">Create account</h2>
        <p className="register-form__subtitle">Join us and start shopping today</p>
      </div>

      {error && (
        <div className="register-form__error" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </div>
      )}

      <div className="register-form__field">
        <label htmlFor="reg-username">Username</label>
        <input
          id="reg-username"
          type="text"
          value={username}
          onChange={(e) => { setUsername(e.target.value); clearError(); }}
          placeholder="Choose a username"
          required
          autoComplete="username"
          autoFocus
        />
      </div>

      <div className="register-form__field">
        <label htmlFor="reg-password">Password</label>
        <div className="register-form__password-wrap">
          <input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError(); }}
            placeholder="At least 4 characters"
            required
            minLength={4}
            autoComplete="new-password"
          />
          <button
            type="button"
            className="register-form__eye-btn"
            onClick={() => setShowPassword(prev => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        </div>
      </div>

      <div className="register-form__field">
        <label htmlFor="reg-confirm">Confirm Password</label>
        <div className="register-form__confirm-wrap">
          <input
            id="reg-confirm"
            type={showPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
            placeholder="Re-enter your password"
            required
            autoComplete="new-password"
            className={confirmPassword && !passwordsMatch ? 'register-form__input--error' : ''}
          />
          {passwordsMatch && (
            <span className="register-form__match-icon">
              <CheckIcon />
            </span>
          )}
        </div>
        {confirmPassword && !passwordsMatch && (
          <span className="register-form__field-error">Passwords do not match</span>
        )}
      </div>

      <button
        type="submit"
        className="register-form__submit"
        disabled={isLoading || (confirmPassword && !passwordsMatch)}
      >
        {isLoading ? (
          <>
            <span className="checkout__spinner" />
            Creating account…
          </>
        ) : (
          'Create Account'
        )}
      </button>

      <p className="register-form__terms">
        By creating an account you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
};

export default Register;