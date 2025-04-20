import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile
} from 'firebase/auth';
import { auth, db } from './config';
import { doc, setDoc } from 'firebase/firestore';

// Registrar um novo usuário
export const registerUser = async (email, password, displayName) => {
  try {
    // Criar usuário na autenticação do Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Atualizar o perfil do usuário com o nome de exibição
    await updateProfile(auth.currentUser, { displayName });
    
    // Adicionar informações do usuário ao Firestore
    await setDoc(doc(db, 'players', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      rating: 1200, // Rating inicial padrão (sistema Elo)
      wins: 0,
      losses: 0,
      draws: 0,
      createdAt: new Date().toISOString()
    });
    
    return user;
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
};

// Login de usuário
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    throw error;
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};

// Obter o usuário atual
export const getCurrentUser = () => {
  return auth.currentUser;
}; 