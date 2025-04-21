import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/auth';
import { 
  getStudentsList, 
  getStudentChallenges, 
  createChallenge, 
  updateChallengeStatus,
  getStudentDetails 
} from '../firebase/tournamentService';
import './ChallengeRoom.css';

const ChallengeRoom = () => {
  const { currentUser, playerData } = useAuth();
  const [students, setStudents] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [studentSearchTerm, setStudentSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('students');
  const [successMessage, setSuccessMessage] = useState('');

  // Carregar lista de estudantes e desafios
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Se não tiver usuário autenticado, não carregar nada
        if (!currentUser) {
          setLoading(false);
          return;
        }
        
        // Carregar estudantes e desafios simultaneamente
        const [studentsData, challengesData] = await Promise.all([
          getStudentsList(),
          getStudentChallenges(currentUser.uid)
        ]);
        
        // Remover o próprio usuário da lista de estudantes
        const filteredStudents = studentsData.filter(
          student => student.id !== currentUser.uid
        );
        
        setStudents(filteredStudents);
        setChallenges(challengesData);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
        setError('Falha ao carregar dados. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [currentUser]);
  
  // Filtra estudantes com base no termo de pesquisa
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(studentSearchTerm.toLowerCase())
  );
  
  // Função para enviar um desafio
  const handleSendChallenge = async (opponentId) => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      if (!currentUser) {
        throw new Error('Você precisa estar logado para enviar desafios');
      }
      
      // Verificar se já existe um desafio pendente para este oponente
      const existingChallenge = challenges.find(
        c => (c.opponentId === opponentId || c.challengerId === opponentId) && 
             c.status === 'pending'
      );
      
      if (existingChallenge) {
        throw new Error('Já existe um desafio pendente para este oponente');
      }
      
      // Criar o desafio
      await createChallenge(currentUser.uid, opponentId);
      
      // Atualizar a lista de desafios
      const updatedChallenges = await getStudentChallenges(currentUser.uid);
      setChallenges(updatedChallenges);
      
      setSuccessMessage('Desafio enviado com sucesso!');
      
      // Limpar a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      console.error('Erro ao enviar desafio:', err);
      setError(err.message || 'Falha ao enviar desafio. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Função para responder a um desafio (aceitar ou recusar)
  const handleRespondChallenge = async (challengeId, accept) => {
    setLoading(true);
    setError(null);
    setSuccessMessage('');
    
    try {
      const newStatus = accept ? 'accepted' : 'rejected';
      
      // Atualizar o status do desafio
      await updateChallengeStatus(challengeId, newStatus);
      
      // Atualizar a lista de desafios
      const updatedChallenges = await getStudentChallenges(currentUser.uid);
      setChallenges(updatedChallenges);
      
      setSuccessMessage(accept 
        ? 'Desafio aceito! Prepare-se para a partida.' 
        : 'Desafio recusado.'
      );
      
      // Limpar a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      console.error('Erro ao responder desafio:', err);
      setError(err.message || 'Falha ao responder ao desafio. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };
  
  // Exibir detalhes de um estudante
  const handleViewStudent = async (studentId) => {
    try {
      const studentDetails = await getStudentDetails(studentId);
      setSelectedStudent(studentDetails);
    } catch (err) {
      console.error('Erro ao obter detalhes do estudante:', err);
      setError('Falha ao carregar detalhes do estudante.');
    }
  };
  
  // Formatar data para o formato local
  const formatDate = (date) => {
    if (!date) return '';
    
    try {
      // Se for um timestamp do Firestore
      if (date.toDate) {
        date = date.toDate();
      }
      
      return new Date(date).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      console.error('Erro ao formatar data:', err);
      return '';
    }
  };
  
  // Obter nome do estudante pelo ID
  const getStudentName = (studentId) => {
    const student = students.find(s => s.id === studentId);
    return student ? student.name : 'Estudante';
  };
  
  if (!currentUser) {
    return (
      <div className="challenge-room">
        <div className="auth-message">
          <h2>Acesso Restrito</h2>
          <p>Você precisa estar logado para acessar a sala de desafios.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="challenge-room">
      <h2>Sala de Desafios de Xadrez</h2>
      
      {error && (
        <div className="error-message">{error}</div>
      )}
      
      {successMessage && (
        <div className="success-message">{successMessage}</div>
      )}
      
      <div className="tab-navigation">
        <button 
          className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          Estudantes
        </button>
        <button 
          className={`tab-button ${activeTab === 'challenges' ? 'active' : ''}`}
          onClick={() => setActiveTab('challenges')}
        >
          Meus Desafios {challenges.length > 0 && <span className="challenge-count">{challenges.length}</span>}
        </button>
      </div>
      
      {activeTab === 'students' && (
        <div className="students-tab">
          <div className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Buscar por nome ou série..."
              value={studentSearchTerm}
              onChange={(e) => setStudentSearchTerm(e.target.value)}
            />
          </div>
          
          {loading ? (
            <div className="loading">Carregando estudantes...</div>
          ) : (
            <div className="students-list">
              {filteredStudents.length === 0 ? (
                <div className="empty-list">
                  {studentSearchTerm 
                    ? 'Nenhum estudante encontrado para esta busca.'
                    : 'Não há outros estudantes cadastrados no campeonato.'}
                </div>
              ) : (
                filteredStudents.map(student => (
                  <div key={student.id} className="student-card">
                    <div className="student-info">
                      <h3>{student.name}</h3>
                      <p><strong>Série:</strong> {student.grade}</p>
                      <p><strong>Rating:</strong> {student.rating || 1200}</p>
                    </div>
                    <div className="student-actions">
                      <button 
                        className="view-button"
                        onClick={() => handleViewStudent(student.id)}
                      >
                        Detalhes
                      </button>
                      <button 
                        className="challenge-button"
                        onClick={() => handleSendChallenge(student.id)}
                        disabled={loading}
                      >
                        Desafiar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'challenges' && (
        <div className="challenges-tab">
          {loading ? (
            <div className="loading">Carregando desafios...</div>
          ) : (
            <div className="challenges-list">
              {challenges.length === 0 ? (
                <div className="empty-list">
                  Você não tem desafios ativos no momento. 
                  Desafie outros estudantes para começar a jogar!
                </div>
              ) : (
                <div>
                  <h3>Desafios Pendentes</h3>
                  {challenges
                    .filter(challenge => challenge.status === 'pending')
                    .map(challenge => (
                      <div key={challenge.id} className="challenge-card">
                        <div className="challenge-info">
                          {challenge.role === 'challenger' ? (
                            <p>Você desafiou <strong>{getStudentName(challenge.opponentId)}</strong></p>
                          ) : (
                            <p><strong>{getStudentName(challenge.challengerId)}</strong> desafiou você</p>
                          )}
                          <p><small>Enviado em: {formatDate(challenge.createdAt)}</small></p>
                        </div>
                        
                        <div className="challenge-actions">
                          {challenge.role === 'opponent' && (
                            <>
                              <button
                                className="accept-button"
                                onClick={() => handleRespondChallenge(challenge.id, true)}
                                disabled={loading}
                              >
                                Aceitar
                              </button>
                              <button
                                className="reject-button"
                                onClick={() => handleRespondChallenge(challenge.id, false)}
                                disabled={loading}
                              >
                                Recusar
                              </button>
                            </>
                          )}
                          
                          {challenge.role === 'challenger' && (
                            <span className="awaiting-response">Aguardando resposta</span>
                          )}
                        </div>
                      </div>
                    ))}
                  
                  <h3>Desafios Aceitos</h3>
                  {challenges
                    .filter(challenge => challenge.status === 'accepted')
                    .map(challenge => (
                      <div key={challenge.id} className="challenge-card accepted">
                        <div className="challenge-info">
                          {challenge.role === 'challenger' ? (
                            <p>Seu desafio para <strong>{getStudentName(challenge.opponentId)}</strong> foi aceito!</p>
                          ) : (
                            <p>Você aceitou o desafio de <strong>{getStudentName(challenge.challengerId)}</strong></p>
                          )}
                          <p><small>Aceito em: {formatDate(challenge.updatedAt)}</small></p>
                        </div>
                        
                        <div className="challenge-actions">
                          <button className="play-button">
                            Iniciar Partida
                          </button>
                        </div>
                      </div>
                    ))}
                  
                  <h3>Desafios Anteriores</h3>
                  {challenges
                    .filter(challenge => ['completed', 'rejected'].includes(challenge.status))
                    .map(challenge => (
                      <div key={challenge.id} className={`challenge-card ${challenge.status}`}>
                        <div className="challenge-info">
                          {challenge.status === 'rejected' && (
                            <>
                              {challenge.role === 'challenger' ? (
                                <p>Seu desafio para <strong>{getStudentName(challenge.opponentId)}</strong> foi recusado</p>
                              ) : (
                                <p>Você recusou o desafio de <strong>{getStudentName(challenge.challengerId)}</strong></p>
                              )}
                            </>
                          )}
                          
                          {challenge.status === 'completed' && (
                            <>
                              {challenge.result === 'draw' ? (
                                <p>Sua partida com <strong>
                                  {challenge.role === 'challenger' 
                                    ? getStudentName(challenge.opponentId) 
                                    : getStudentName(challenge.challengerId)}
                                </strong> terminou em empate</p>
                              ) : (
                                <>
                                  {(challenge.role === 'challenger' && challenge.winnerId === currentUser.uid) ||
                                   (challenge.role === 'opponent' && challenge.winnerId === currentUser.uid) ? (
                                    <p>Você venceu a partida contra <strong>
                                      {challenge.role === 'challenger' 
                                        ? getStudentName(challenge.opponentId) 
                                        : getStudentName(challenge.challengerId)}
                                    </strong></p>
                                  ) : (
                                    <p>Você perdeu a partida contra <strong>
                                      {challenge.role === 'challenger' 
                                        ? getStudentName(challenge.opponentId) 
                                        : getStudentName(challenge.challengerId)}
                                    </strong></p>
                                  )}
                                </>
                              )}
                            </>
                          )}
                          <p><small>Data: {formatDate(challenge.updatedAt)}</small></p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {/* Modal de detalhes do estudante */}
      {selectedStudent && (
        <div className="student-modal-backdrop" onClick={() => setSelectedStudent(null)}>
          <div className="student-modal" onClick={e => e.stopPropagation()}>
            <h3>{selectedStudent.name}</h3>
            <div className="student-details">
              <p><strong>Série/Turma:</strong> {selectedStudent.grade}</p>
              <p><strong>Idade:</strong> {selectedStudent.age} anos</p>
              {selectedStudent.school && <p><strong>Escola:</strong> {selectedStudent.school}</p>}
              <p><strong>Rating:</strong> {selectedStudent.rating || 1200}</p>
              <p><strong>Estatísticas:</strong></p>
              <ul className="stats-list">
                <li>Vitórias: {selectedStudent.wins || 0}</li>
                <li>Derrotas: {selectedStudent.losses || 0}</li>
                <li>Empates: {selectedStudent.draws || 0}</li>
              </ul>
            </div>
            <div className="modal-actions">
              <button className="close-button" onClick={() => setSelectedStudent(null)}>Fechar</button>
              <button 
                className="challenge-button"
                onClick={() => {
                  handleSendChallenge(selectedStudent.id);
                  setSelectedStudent(null);
                }}
                disabled={loading}
              >
                Desafiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChallengeRoom; 