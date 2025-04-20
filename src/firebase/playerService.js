import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { db } from './config';

// Obter perfil do jogador
export const getPlayerProfile = async (playerId) => {
  try {
    const playerRef = doc(db, 'players', playerId);
    const playerSnap = await getDoc(playerRef);
    
    if (playerSnap.exists()) {
      return playerSnap.data();
    } else {
      console.error('Jogador não encontrado!');
      return null;
    }
  } catch (error) {
    console.error('Erro ao obter perfil do jogador:', error);
    throw error;
  }
};

// Atualizar estatísticas do jogador
export const updatePlayerStats = async (playerId, stats) => {
  try {
    const playerRef = doc(db, 'players', playerId);
    await updateDoc(playerRef, stats);
    return true;
  } catch (error) {
    console.error('Erro ao atualizar estatísticas do jogador:', error);
    throw error;
  }
};

// Atualizar rating após uma partida (usando sistema Elo simplificado)
export const updatePlayerRating = async (winnerId, loserId, isDraw = false) => {
  try {
    // Obter ratings atuais
    const winnerData = await getPlayerProfile(winnerId);
    const loserData = await getPlayerProfile(loserId);
    
    if (!winnerData || !loserData) {
      throw new Error('Não foi possível obter dados dos jogadores');
    }
    
    const K = 32; // Fator K do sistema Elo (pode ser ajustado)
    const winnerRating = winnerData.rating;
    const loserRating = loserData.rating;
    
    // Calcular probabilidade esperada
    const expectedWinner = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    const expectedLoser = 1 / (1 + Math.pow(10, (winnerRating - loserRating) / 400));
    
    let newWinnerRating, newLoserRating;
    
    if (isDraw) {
      // Caso seja empate, ambos recebem 0.5
      newWinnerRating = Math.round(winnerRating + K * (0.5 - expectedWinner));
      newLoserRating = Math.round(loserRating + K * (0.5 - expectedLoser));
      
      // Atualizar estatísticas para ambos
      await updatePlayerStats(winnerId, { 
        rating: newWinnerRating,
        draws: winnerData.draws + 1
      });
      
      await updatePlayerStats(loserId, { 
        rating: newLoserRating,
        draws: loserData.draws + 1
      });
      
    } else {
      // Vencedor recebe 1, perdedor recebe 0
      newWinnerRating = Math.round(winnerRating + K * (1 - expectedWinner));
      newLoserRating = Math.round(loserRating + K * (0 - expectedLoser));
      
      // Atualizar estatísticas
      await updatePlayerStats(winnerId, { 
        rating: newWinnerRating,
        wins: winnerData.wins + 1
      });
      
      await updatePlayerStats(loserId, { 
        rating: newLoserRating,
        losses: loserData.losses + 1
      });
    }
    
    return {
      winner: { oldRating: winnerRating, newRating: newWinnerRating },
      loser: { oldRating: loserRating, newRating: newLoserRating }
    };
    
  } catch (error) {
    console.error('Erro ao atualizar ratings:', error);
    throw error;
  }
};

// Obter ranking de jogadores
export const getPlayersRanking = async (limit = 10) => {
  try {
    const playersRef = collection(db, 'players');
    const q = query(playersRef, orderBy('rating', 'desc'), limit(limit));
    const querySnapshot = await getDocs(q);
    
    const ranking = [];
    querySnapshot.forEach((doc) => {
      ranking.push(doc.data());
    });
    
    return ranking;
  } catch (error) {
    console.error('Erro ao obter ranking:', error);
    throw error;
  }
}; 