import React, { useState, useEffect } from 'react';
import { getCurrentUser } from '../../firebase/authService';
import { getPlayerProfile } from '../../firebase/playerService';
import { getPlayerGames } from '../../firebase/gameService';
import './PlayerProfile.css';

const PlayerProfile = () => {
  const [profile, setProfile] = useState(null);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPlayerData = async () => {
      const currentUser = getCurrentUser();
      
      if (!currentUser) {
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }
      
      try {
        const playerData = await getPlayerProfile(currentUser.uid);
        setProfile(playerData);
        
        const playerGames = await getPlayerGames(currentUser.uid, 5); // Últimas 5 partidas
        setGames(playerGames);
      } catch (err) {
        console.error('Erro ao carregar perfil:', err);
        setError('Erro ao carregar dados do jogador.');
      } finally {
        setLoading(false);
      }
    };
    
    loadPlayerData();
  }, []);

  if (loading) {
    return <div className="player-profile loading">Carregando perfil...</div>;
  }

  if (error) {
    return <div className="player-profile error">{error}</div>;
  }

  return (
    <div className="player-profile">
      <div className="profile-header">
        <h2>{profile?.displayName}</h2>
        <div className="rating">
          <span className="rating-label">Rating:</span>
          <span className="rating-value">{profile?.rating || 1200}</span>
        </div>
      </div>
      
      <div className="profile-stats">
        <div className="stat-item">
          <div className="stat-value">{profile?.wins || 0}</div>
          <div className="stat-label">Vitórias</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{profile?.draws || 0}</div>
          <div className="stat-label">Empates</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{profile?.losses || 0}</div>
          <div className="stat-label">Derrotas</div>
        </div>
      </div>
      
      <div className="recent-games">
        <h3>Partidas Recentes</h3>
        {games.length === 0 ? (
          <p className="no-games">Nenhuma partida jogada ainda.</p>
        ) : (
          <ul className="games-list">
            {games.map((game) => (
              <li key={game.id} className="game-item">
                <div className="game-result">
                  {game.result === 'white' && game.whitePlayerId === profile.uid && <span className="win">Vitória</span>}
                  {game.result === 'black' && game.blackPlayerId === profile.uid && <span className="win">Vitória</span>}
                  {game.result === 'white' && game.blackPlayerId === profile.uid && <span className="loss">Derrota</span>}
                  {game.result === 'black' && game.whitePlayerId === profile.uid && <span className="loss">Derrota</span>}
                  {game.result === 'draw' && <span className="draw">Empate</span>}
                </div>
                <div className="game-date">
                  {game.endTime ? new Date(game.endTime.seconds * 1000).toLocaleDateString() : 'Data desconhecida'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PlayerProfile; 