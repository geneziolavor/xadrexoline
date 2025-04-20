import { 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  doc, 
  query, 
  where, 
  orderBy,
  updateDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import { updatePlayerRating } from './playerService';

// Criar uma nova partida
export const createGame = async (whitePlayerId, blackPlayerId) => {
  try {
    const gameData = {
      whitePlayerId,
      blackPlayerId,
      moves: [],
      result: 'ongoing', // 'ongoing', 'white', 'black', 'draw'
      startTime: serverTimestamp(),
      endTime: null,
      pgn: '',
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1' // Posição inicial
    };
    
    const docRef = await addDoc(collection(db, 'games'), gameData);
    return { id: docRef.id, ...gameData };
  } catch (error) {
    console.error('Erro ao criar partida:', error);
    throw error;
  }
};

// Obter uma partida específica
export const getGame = async (gameId) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (gameSnap.exists()) {
      return { id: gameSnap.id, ...gameSnap.data() };
    } else {
      console.error('Partida não encontrada!');
      return null;
    }
  } catch (error) {
    console.error('Erro ao obter partida:', error);
    throw error;
  }
};

// Atualizar movimentos da partida
export const updateGameMoves = async (gameId, moves, fen, pgn) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    await updateDoc(gameRef, {
      moves,
      fen,
      pgn
    });
    return true;
  } catch (error) {
    console.error('Erro ao atualizar movimentos:', error);
    throw error;
  }
};

// Finalizar uma partida
export const finishGame = async (gameId, result, finalFen, finalPgn) => {
  try {
    const gameRef = doc(db, 'games', gameId);
    const gameSnap = await getDoc(gameRef);
    
    if (!gameSnap.exists()) {
      throw new Error('Partida não encontrada');
    }
    
    const gameData = gameSnap.data();
    const whitePlayerId = gameData.whitePlayerId;
    const blackPlayerId = gameData.blackPlayerId;
    
    // Atualizar dados da partida
    await updateDoc(gameRef, {
      result,
      endTime: serverTimestamp(),
      fen: finalFen,
      pgn: finalPgn
    });
    
    // Atualizar ratings dos jogadores
    if (result === 'white') {
      await updatePlayerRating(whitePlayerId, blackPlayerId, false);
    } else if (result === 'black') {
      await updatePlayerRating(blackPlayerId, whitePlayerId, false);
    } else if (result === 'draw') {
      await updatePlayerRating(whitePlayerId, blackPlayerId, true);
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao finalizar partida:', error);
    throw error;
  }
};

// Obter histórico de partidas de um jogador
export const getPlayerGames = async (playerId, limit = 10) => {
  try {
    const gamesRef = collection(db, 'games');
    const q = query(
      gamesRef,
      where('result', '!=', 'ongoing'),
      orderBy('result'),
      orderBy('endTime', 'desc'),
      where('whitePlayerId', '==', playerId),
      orderBy('startTime', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    
    const playerGamesAsWhite = [];
    querySnapshot.forEach((doc) => {
      playerGamesAsWhite.push({ id: doc.id, ...doc.data() });
    });
    
    // Obter jogos como preto
    const q2 = query(
      gamesRef,
      where('result', '!=', 'ongoing'),
      orderBy('result'),
      orderBy('endTime', 'desc'),
      where('blackPlayerId', '==', playerId),
      orderBy('startTime', 'desc'),
      limit(limit)
    );
    
    const querySnapshot2 = await getDocs(q2);
    
    const playerGamesAsBlack = [];
    querySnapshot2.forEach((doc) => {
      playerGamesAsBlack.push({ id: doc.id, ...doc.data() });
    });
    
    // Combinar e ordenar por data
    const allGames = [...playerGamesAsWhite, ...playerGamesAsBlack];
    allGames.sort((a, b) => b.startTime - a.startTime);
    
    return allGames.slice(0, limit);
    
  } catch (error) {
    console.error('Erro ao obter histórico de partidas:', error);
    throw error;
  }
}; 