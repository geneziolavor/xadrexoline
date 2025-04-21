import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc,
  updateDoc, 
  deleteDoc,
  query, 
  where,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './config';

/**
 * Adiciona um novo registro de estudante para o campeonato
 * @param {Object} studentData - Dados do estudante
 * @returns {Promise<string>} - ID do documento criado
 */
export const addStudentRegistration = async (studentData) => {
  try {
    const studentsRef = collection(db, 'tournament_students');
    const docRef = await addDoc(studentsRef, {
      ...studentData,
      createdAt: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao adicionar registro de estudante:', error);
    throw error;
  }
};

/**
 * Obtém a lista de todos os estudantes cadastrados no campeonato
 * @param {string} sortBy - Campo para ordenação (default: 'name')
 * @param {boolean} descending - Se a ordenação deve ser decrescente
 * @returns {Promise<Array>} - Lista de estudantes
 */
export const getStudentsList = async (sortBy = 'name', descending = false) => {
  try {
    const studentsRef = collection(db, 'tournament_students');
    const direction = descending ? 'desc' : 'asc';
    const q = query(studentsRef, orderBy(sortBy, direction));
    
    const querySnapshot = await getDocs(q);
    const students = [];
    
    querySnapshot.forEach((doc) => {
      students.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return students;
  } catch (error) {
    console.error('Erro ao obter lista de estudantes:', error);
    throw error;
  }
};

/**
 * Obtém os detalhes de um estudante específico
 * @param {string} studentId - ID do estudante
 * @returns {Promise<Object>} - Dados do estudante
 */
export const getStudentDetails = async (studentId) => {
  try {
    const studentRef = doc(db, 'tournament_students', studentId);
    const studentDoc = await getDoc(studentRef);
    
    if (studentDoc.exists()) {
      return {
        id: studentDoc.id,
        ...studentDoc.data()
      };
    } else {
      throw new Error('Estudante não encontrado');
    }
  } catch (error) {
    console.error('Erro ao obter detalhes do estudante:', error);
    throw error;
  }
};

/**
 * Atualiza os dados de um estudante
 * @param {string} studentId - ID do estudante
 * @param {Object} updateData - Dados a serem atualizados
 * @returns {Promise<void>}
 */
export const updateStudentData = async (studentId, updateData) => {
  try {
    const studentRef = doc(db, 'tournament_students', studentId);
    await updateDoc(studentRef, {
      ...updateData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Erro ao atualizar dados do estudante:', error);
    throw error;
  }
};

/**
 * Remove um estudante do campeonato
 * @param {string} studentId - ID do estudante
 * @returns {Promise<void>}
 */
export const removeStudent = async (studentId) => {
  try {
    const studentRef = doc(db, 'tournament_students', studentId);
    await deleteDoc(studentRef);
  } catch (error) {
    console.error('Erro ao remover estudante:', error);
    throw error;
  }
};

/**
 * Cria um novo desafio entre dois estudantes
 * @param {string} challengerId - ID do estudante desafiante
 * @param {string} opponentId - ID do estudante desafiado
 * @param {string} status - Status inicial do desafio (pendente, aceito, recusado)
 * @returns {Promise<string>} - ID do desafio criado
 */
export const createChallenge = async (challengerId, opponentId, status = 'pending') => {
  try {
    const challengesRef = collection(db, 'challenges');
    const docRef = await addDoc(challengesRef, {
      challengerId,
      opponentId,
      status,
      createdAt: new Date(),
      gameId: null,
      result: null
    });
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar desafio:', error);
    throw error;
  }
};

/**
 * Obtém todos os desafios de um estudante (como desafiante ou desafiado)
 * @param {string} studentId - ID do estudante
 * @returns {Promise<Array>} - Lista de desafios
 */
export const getStudentChallenges = async (studentId) => {
  try {
    const challengesRef = collection(db, 'challenges');
    
    // Consulta para desafios como desafiante ou desafiado
    const q1 = query(challengesRef, where('challengerId', '==', studentId));
    const q2 = query(challengesRef, where('opponentId', '==', studentId));
    
    const [snapshot1, snapshot2] = await Promise.all([
      getDocs(q1),
      getDocs(q2)
    ]);
    
    const challenges = [];
    
    snapshot1.forEach((doc) => {
      challenges.push({
        id: doc.id,
        ...doc.data(),
        role: 'challenger'
      });
    });
    
    snapshot2.forEach((doc) => {
      challenges.push({
        id: doc.id,
        ...doc.data(),
        role: 'opponent'
      });
    });
    
    // Ordena os desafios pelo mais recente
    return challenges.sort((a, b) => 
      b.createdAt.toDate() - a.createdAt.toDate()
    );
  } catch (error) {
    console.error('Erro ao obter desafios do estudante:', error);
    throw error;
  }
};

/**
 * Atualiza o status de um desafio
 * @param {string} challengeId - ID do desafio
 * @param {string} newStatus - Novo status (aceito, recusado, concluído)
 * @param {Object} additionalData - Dados adicionais para atualizar
 * @returns {Promise<void>}
 */
export const updateChallengeStatus = async (challengeId, newStatus, additionalData = {}) => {
  try {
    const challengeRef = doc(db, 'challenges', challengeId);
    await updateDoc(challengeRef, {
      status: newStatus,
      ...additionalData,
      updatedAt: new Date()
    });
  } catch (error) {
    console.error('Erro ao atualizar status do desafio:', error);
    throw error;
  }
};

/**
 * Obtém ranking dos estudantes com base na pontuação
 * @param {number} limit - Limite de resultados
 * @returns {Promise<Array>} - Lista de estudantes ordenada por pontuação
 */
export const getStudentsRanking = async (limitCount = 20) => {
  try {
    const studentsRef = collection(db, 'tournament_students');
    const q = query(studentsRef, orderBy('rating', 'desc'), limit(limitCount));
    
    const querySnapshot = await getDocs(q);
    const ranking = [];
    
    querySnapshot.forEach((doc) => {
      ranking.push({
        id: doc.id,
        ...doc.data(),
        position: ranking.length + 1
      });
    });
    
    return ranking;
  } catch (error) {
    console.error('Erro ao obter ranking de estudantes:', error);
    throw error;
  }
};

/**
 * Registra o resultado de uma partida entre dois estudantes
 * @param {string} winnerId - ID do estudante vencedor (null para empate)
 * @param {string} loserId - ID do estudante perdedor
 * @param {boolean} isDraw - Se a partida foi um empate
 * @param {string} challengeId - ID do desafio relacionado
 * @returns {Promise<void>}
 */
export const registerMatchResult = async (winnerId, loserId, isDraw = false, challengeId = null) => {
  try {
    // Buscar dados dos jogadores
    const [winner, loser] = await Promise.all([
      winnerId ? getStudentDetails(winnerId) : null,
      getStudentDetails(loserId)
    ]);
    
    if (!loser || (!winner && !isDraw)) {
      throw new Error('Dados de jogadores não encontrados');
    }
    
    const K = 32; // Fator K para cálculo do rating (pode ser ajustado)
    
    if (isDraw) {
      // Caso seja empate
      const expectedWinner = 1 / (1 + Math.pow(10, (loser.rating - (winner?.rating || loser.rating)) / 400));
      const expectedLoser = 1 / (1 + Math.pow(10, ((winner?.rating || loser.rating) - loser.rating) / 400));
      
      const newWinnerRating = Math.round((winner?.rating || 0) + K * (0.5 - expectedWinner));
      const newLoserRating = Math.round(loser.rating + K * (0.5 - expectedLoser));
      
      // Atualizar estatísticas para ambos
      await Promise.all([
        winnerId ? updateStudentData(winnerId, {
          rating: newWinnerRating,
          draws: (winner.draws || 0) + 1
        }) : Promise.resolve(),
        updateStudentData(loserId, {
          rating: newLoserRating,
          draws: (loser.draws || 0) + 1
        })
      ]);
    } else {
      // Vencedor e perdedor normais
      const expectedWinner = 1 / (1 + Math.pow(10, (loser.rating - winner.rating) / 400));
      const expectedLoser = 1 / (1 + Math.pow(10, (winner.rating - loser.rating) / 400));
      
      const newWinnerRating = Math.round(winner.rating + K * (1 - expectedWinner));
      const newLoserRating = Math.round(loser.rating + K * (0 - expectedLoser));
      
      // Atualizar estatísticas
      await Promise.all([
        updateStudentData(winnerId, {
          rating: newWinnerRating,
          wins: (winner.wins || 0) + 1
        }),
        updateStudentData(loserId, {
          rating: newLoserRating,
          losses: (loser.losses || 0) + 1
        })
      ]);
    }
    
    // Se houver um desafio relacionado, atualizar seu status
    if (challengeId) {
      await updateChallengeStatus(challengeId, 'completed', {
        result: isDraw ? 'draw' : 'winner',
        winnerId: isDraw ? null : winnerId
      });
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao registrar resultado de partida:', error);
    throw error;
  }
}; 