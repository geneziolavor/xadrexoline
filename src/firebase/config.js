// Configuração do Firebase para a aplicação de xadrez online
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Verificar se as variáveis de ambiente estão definidas
const checkEnvVariables = () => {
  const requiredVars = [
    'REACT_APP_FIREBASE_API_KEY',
    'REACT_APP_FIREBASE_AUTH_DOMAIN',
    'REACT_APP_FIREBASE_PROJECT_ID',
    'REACT_APP_FIREBASE_STORAGE_BUCKET',
    'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
    'REACT_APP_FIREBASE_APP_ID'
  ];
  
  const missingVars = requiredVars.filter(
    varName => !process.env[varName]
  );
  
  if (missingVars.length > 0) {
    console.error('ERRO: Variáveis de ambiente ausentes:', missingVars);
    console.error('Por favor, verifique seu arquivo .env');
  }
  
  return missingVars.length === 0;
};

// Configuração do Firebase - usando variáveis de ambiente
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

// Verificar variáveis de ambiente antes de inicializar
checkEnvVariables();

// Inicializar o Firebase
const app = initializeApp(firebaseConfig);

// Exportar as instâncias de autenticação e Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;

 