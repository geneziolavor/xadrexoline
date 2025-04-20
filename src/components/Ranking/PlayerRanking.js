import React, { useState, useEffect } from 'react';
import { getPlayersRanking } from '../../firebase/playerService';
import './PlayerRanking.css';

const PlayerRanking = () => {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRanking = async () => {
      try {
        const ranking = await getPlayersRanking(20); // Top 20 jogadores
        setPlayers(ranking);
      } catch (err) {
        console.error('Erro ao carregar ranking:', err);
        setError('Não foi possível carregar o ranking dos jogadores.');
      } finally {
        setLoading(false);
      }
    };
    
    loadRanking();
  }, []);

  if (loading) {
    return <div className="player-ranking loading">Carregando ranking...</div>;
  }

  if (error) {
    return <div className="player-ranking error">{error}</div>;
  }

  return (
    <div className="player-ranking">
      <h2>Ranking dos Jogadores</h2>
      
      {players.length === 0 ? (
        <p className="no-players">Nenhum jogador registrado ainda.</p>
      ) : (
        <div className="ranking-table-container">
          <table className="ranking-table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Jogador</th>
                <th>Rating</th>
                <th>V</th>
                <th>E</th>
                <th>D</th>
              </tr>
            </thead>
            <tbody>
              {players.map((player, index) => (
                <tr key={player.uid} className={index < 3 ? 'top-rank' : ''}>
                  <td className="position">{index + 1}</td>
                  <td className="player-name">{player.displayName}</td>
                  <td className="rating">{player.rating}</td>
                  <td className="wins">{player.wins}</td>
                  <td className="draws">{player.draws}</td>
                  <td className="losses">{player.losses}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PlayerRanking; 