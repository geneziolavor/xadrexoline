import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from './config';
import { onAuthStateChanged } from 'firebase/auth';
import { getPlayerProfile } from './playerService';

// Contexto de autenticação
const AuthContext = createContext();

/**
 * Hook para acessar o contexto de autenticação
 * @returns {Object} Valores e funções de autenticação
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * Componente de Provider que envolve a aplicação para fornecer o contexto de autenticação
 * @param {Object} children - Componentes filhos
 */
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efeito que monitora mudanças no estado de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setError(null);

      // Se o usuário estiver autenticado, busca os dados do jogador
      if (user) {
        try {
          const data = await getPlayerProfile(user.uid);
          setPlayerData(data);
        } catch (err) {
          console.error("Erro ao carregar dados do jogador:", err);
          setError(err.message);
          setPlayerData(null);
        }
      } else {
        setPlayerData(null);
      }

      setLoading(false);
    });

    // Limpa o listener quando o componente for desmontado
    return unsubscribe;
  }, []);

  // Valores a serem expostos pelo contexto
  const value = {
    currentUser,
    playerData,
    loading,
    error
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}; 