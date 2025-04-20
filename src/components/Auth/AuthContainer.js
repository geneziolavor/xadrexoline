import React, { useState } from 'react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthContainer = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const handleSwitchToRegister = () => {
    setIsLogin(false);
  };

  const handleSwitchToLogin = () => {
    setIsLogin(true);
  };

  return (
    <div>
      {isLogin ? (
        <LoginForm 
          onSuccess={onAuthSuccess} 
          onSwitchToRegister={handleSwitchToRegister} 
        />
      ) : (
        <RegisterForm 
          onSuccess={onAuthSuccess} 
          onSwitchToLogin={handleSwitchToLogin} 
        />
      )}
    </div>
  );
};

export default AuthContainer; 