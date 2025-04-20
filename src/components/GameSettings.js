import React from 'react';
import './GameSettings.css';

const GameSettings = ({ onStartGame, onShowTutorial }) => {
  const handleModeSelect = (mode, difficulty) => {
    onStartGame({ 
      mode, 
      difficulty: mode === 'ai' ? difficulty : null 
    });
  };

  return (
    <div className="game-settings">
      <h2>Escolha o Modo de Jogo</h2>
      
      <div className="game-modes">
        <div className="game-mode-card" onClick={() => handleModeSelect('local')}>
          <h3>Jogo Local</h3>
          <p>Jogue com um amigo no mesmo dispositivo</p>
          <button>Jogar</button>
        </div>
        
        <div className="game-mode-card">
          <h3>Jogar contra IA</h3>
          <p>Selecione a dificuldade:</p>
          <div className="difficulty-buttons">
            <button onClick={() => handleModeSelect('ai', 'easy')}>Fácil</button>
            <button onClick={() => handleModeSelect('ai', 'medium')}>Médio</button>
            <button onClick={() => handleModeSelect('ai', 'hard')}>Difícil</button>
          </div>
        </div>
      </div>
      
      <div className="tutorial-section">
        <h3>Novo no Xadrez?</h3>
        <button className="tutorial-button" onClick={onShowTutorial}>Iniciar Tutorial</button>
      </div>
    </div>
  );
};

export default GameSettings; 