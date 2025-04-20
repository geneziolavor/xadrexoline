import React from 'react';
import './GameInfo.css';

const GameInfo = ({ game, currentPlayer, gameSettings, onNewGame, onUndoMove }) => {
  // Get move history from the game
  const history = game.history({ verbose: true });
  
  const getGameStatus = () => {
    if (game.isCheckmate()) return "Xeque-mate!";
    if (game.isDraw()) return "Empate!";
    if (game.isCheck()) return "Xeque!";
    return "Jogo em andamento";
  };
  
  // Format algebraic notation for display
  const formatMove = (move, index) => {
    const moveNumber = Math.floor(index / 2) + 1;
    const isWhiteMove = index % 2 === 0;
    
    // Simplify move representation
    let moveText = move.san;
    
    if (isWhiteMove) {
      return `${moveNumber}. ${moveText}`;
    } else {
      return moveText;
    }
  };

  return (
    <div className="game-info">
      <div className="status-section">
        <h3>Status do Jogo</h3>
        <p className="status">{getGameStatus()}</p>
        <p className="current-player">
          Jogador Atual: <span className={currentPlayer}>{currentPlayer === 'w' ? 'Brancas' : 'Pretas'}</span>
        </p>
        
        {gameSettings?.mode === 'ai' && (
          <p className="difficulty">
            Dificuldade da IA: 
            <span className="difficulty-level">
              {gameSettings.difficulty === 'easy' ? 'Fácil' : 
               gameSettings.difficulty === 'medium' ? 'Médio' : 'Difícil'}
            </span>
          </p>
        )}
      </div>
      
      <div className="history-section">
        <h3>Histórico de Movimentos</h3>
        {history.length === 0 ? (
          <p className="no-moves">Nenhum movimento realizado ainda.</p>
        ) : (
          <div className="move-history">
            {history.map((move, index) => (
              <span key={index} className="move">
                {formatMove(move, index)}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <div className="buttons-section">
        <button className="new-game-btn" onClick={onNewGame}>Novo Jogo</button>
        <button 
          className="undo-btn" 
          onClick={onUndoMove}
          disabled={history.length === 0}
        >
          Desfazer Último Movimento
        </button>
      </div>
    </div>
  );
};

export default GameInfo; 