import React, { useState, useEffect } from 'react';
import { getStudentsRanking } from '../firebase/tournamentService';
import './RankingTable.css';

const RankingTable = () => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [limitCount, setLimitCount] = useState(20);

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const rankingData = await getStudentsRanking(limitCount);
        setRanking(rankingData);
      } catch (err) {
        console.error('Erro ao carregar ranking:', err);
        setError('Não foi possível carregar o ranking. Por favor, tente novamente.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRanking();
  }, [limitCount]);
  
  const handleLoadMore = () => {
    setLimitCount(prev => prev + 20);
  };
  
  if (loading && ranking.length === 0) {
    return <div className="loading-container">Carregando ranking...</div>;
  }
  
  if (error) {
    return <div className="error-container">{error}</div>;
  }
  
  return (
    <div className="ranking-table-container">
      <h2>Ranking do Campeonato de Xadrez</h2>
      
      {ranking.length === 0 ? (
        <div className="empty-ranking">
          <p>Nenhum jogador registrado no campeonato ainda.</p>
        </div>
      ) : (
        <>
          <div className="ranking-description">
            <p>Confira a classificação atual dos alunos participantes do campeonato de xadrez.</p>
          </div>
          
          <div className="table-container">
            <table className="ranking-table">
              <thead>
                <tr>
                  <th className="position-column">Posição</th>
                  <th className="name-column">Nome</th>
                  <th className="grade-column">Série</th>
                  <th className="rating-column">Rating</th>
                  <th className="wins-column">V</th>
                  <th className="losses-column">D</th>
                  <th className="draws-column">E</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((player, index) => (
                  <tr key={player.id} className={index < 3 ? `top-${index + 1}` : ''}>
                    <td className="position-column">
                      {index < 3 && (
                        <span className={`medal medal-${index + 1}`}>
                          {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                        </span>
                      )}
                      {index + 1}
                    </td>
                    <td className="name-column">{player.name}</td>
                    <td className="grade-column">{player.grade}</td>
                    <td className="rating-column">{player.rating}</td>
                    <td className="wins-column">{player.wins || 0}</td>
                    <td className="losses-column">{player.losses || 0}</td>
                    <td className="draws-column">{player.draws || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {ranking.length >= limitCount && (
            <div className="load-more-container">
              <button className="load-more-button" onClick={handleLoadMore}>
                Carregar Mais
              </button>
            </div>
          )}
          
          <div className="ranking-legend">
            <p><strong>V</strong>: Vitórias | <strong>D</strong>: Derrotas | <strong>E</strong>: Empates</p>
            <p><strong>Rating</strong>: Pontuação baseada no sistema ELO. Todos os jogadores começam com 1200 pontos.</p>
          </div>
        </>
      )}
    </div>
  );
};

export default RankingTable; 