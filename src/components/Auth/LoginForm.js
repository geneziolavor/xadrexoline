import React, { useState } from 'react';
import { loginUser } from '../../firebase/authService';
import './AuthForms.css';

const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await loginUser(email, password);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      setError('Falha ao fazer login. Verifique seu email e senha.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      
      <form onSubmit={handleSubmit} className="auth-form">
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      
      <p className="auth-switch">
        Não tem uma conta?{' '}
        <button 
          onClick={onSwitchToRegister}
          className="switch-auth-button"
        >
          Registre-se
        </button>
      </p>
    </div>
  );
};

export default LoginForm; 