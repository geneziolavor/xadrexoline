import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import GameSettings from './components/GameSettings';
import GameInfo from './components/GameInfo';
import ChessTutorial from './components/ChessTutorial';
import ChessAI from './components/ChessAI';
import LandingPage from './components/LandingPage';
import FullScreenButton from './components/FullScreenButton';

function App() {
  const [game, setGame] = useState(new Chess());
  const [gameSettings, setGameSettings] = useState(null);
  const [showSettings, setShowSettings] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState('w');
  const [isThinking, setIsThinking] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const chessAIRef = useRef(null);
  const boardContainerRef = useRef(null);
  
  // Store move history for undo functionality
  const [gameHistory, setGameHistory] = useState([]);
  
  // Estado para rastrear a peça selecionada e os movimentos possíveis
  const [selectedPiece, setSelectedPiece] = useState(null);
  const [possibleMoves, setPossibleMoves] = useState({});
  
  // Function to make a move (for both player and AI)
  const makeAMove = useCallback(function(move) {
    try {
      const gameCopy = new Chess(game.fen());
      const result = gameCopy.move(move);
      
      if (result) {
        // Save current position to history before updating
        setGameHistory(prev => [...prev, game.fen()]);
        
        setGame(gameCopy);
        setCurrentPlayer(gameCopy.turn());
        
        // Limpar seleção após o movimento
        setSelectedPiece(null);
        setPossibleMoves({});
        
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao fazer movimento:", error);
      return false;
    }
  }, [game]);
  
  // Function to handle AI move
  const makeAIMove = useCallback(async () => {
    setIsThinking(true);
    
    try {
      // Add a slight delay for a more natural feeling
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get AI move based on current position and difficulty
      const moveString = await chessAIRef.current.makeMove(
        game.fen(), 
        gameSettings?.difficulty || 'medium'
      );
      
      if (moveString) {
        // Parse the move string (e.g., "e2e4" to {from: "e2", to: "e4"})
        const from = moveString.substring(0, 2);
        const to = moveString.substring(2, 4);
        
        // Make the AI's move
        makeAMove({
          from,
          to,
          promotion: 'q' // Always promote to a queen for simplicity
        });
      } else {
        // Se nenhum movimento for retornado, pode ter ocorrido algum erro
        console.error("A IA não conseguiu fazer um movimento");
      }
    } catch (error) {
      console.error('Erro ao fazer movimento da IA:', error);
    } finally {
      setIsThinking(false);
    }
  }, [game, gameSettings, makeAMove]);
  
  // Initialize AI if not already done
  useEffect(() => {
    if (gameSettings?.mode === 'ai' && !chessAIRef.current) {
      chessAIRef.current = new ChessAI();
    }
    
    return () => {
      // Clean up AI when component unmounts
      if (chessAIRef.current) {
        chessAIRef.current.cleanup();
      }
    };
  }, [gameSettings]);
  
  // AI move logic
  useEffect(() => {
    if (
      gameSettings?.mode === 'ai' && 
      currentPlayer === 'b' && 
      !game.isGameOver() && 
      chessAIRef.current
    ) {
      makeAIMove();
    }
  }, [currentPlayer, game, gameSettings, makeAIMove]);
  
  // Function to handle clicks on a square
  function handleSquareClick(square) {
    // Se a IA estiver pensando, não permitir movimentos
    if (isThinking) return;
    
    // Se já existe uma peça selecionada
    if (selectedPiece) {
      // Verifica se o quadrado clicado é o mesmo da peça selecionada
      if (selectedPiece === square) {
        // Desseleciona a peça
        setSelectedPiece(null);
        setPossibleMoves({});
        return;
      }
      
      // Tenta fazer o movimento da peça selecionada para o quadrado clicado
      const moveSuccess = makeAMove({
        from: selectedPiece,
        to: square,
        promotion: 'q'
      });
      
      // Limpar seleção independentemente do resultado
      setSelectedPiece(null);
      setPossibleMoves({});
      
      if (moveSuccess) {
        return;
      }
    }
    
    // Verifica se o quadrado tem uma peça e se é da cor do jogador atual
    const piece = game.get(square);
    if (!piece) {
      // Limpar seleção se não for peça
      setSelectedPiece(null);
      setPossibleMoves({});
      return;
    }
    
    // Verifica se a peça é da cor do jogador atual
    if ((piece.color === 'w' && currentPlayer === 'w') || 
        (piece.color === 'b' && currentPlayer === 'b')) {
      // Seleciona a peça e exibe movimentos possíveis
      setSelectedPiece(square);
      
      // Busca todos os movimentos válidos para a peça
      const validMoves = {};
      game.moves({ square, verbose: true }).forEach(move => {
        validMoves[move.to] = {
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.9) 25%, transparent 25%)',
          borderRadius: '50%',
          boxShadow: 'inset 0 0 8px rgba(212, 175, 55, 0.8)'
        };
      });
      
      setPossibleMoves(validMoves);
    } else {
      // Limpar seleção se não for peça do jogador atual
      setSelectedPiece(null);
      setPossibleMoves({});
    }
  }
  
  // Gera os estilos para os quadrados do tabuleiro
  function getCustomSquareStyles() {
    const styles = { ...possibleMoves };
    
    // Destaca o quadrado da peça selecionada
    if (selectedPiece) {
      styles[selectedPiece] = {
        backgroundColor: 'rgba(255, 255, 0, 0.4)',
        boxShadow: 'inset 0 0 8px rgba(255, 255, 0, 0.8)'
      };
    }
    
    return styles;
  }
  
  // Function to start a new game
  function startNewGame() {
    setGame(new Chess());
    setCurrentPlayer('w');
    setGameHistory([]);
    setSelectedPiece(null);
    setPossibleMoves({});
  }
  
  // Function to handle game settings selection
  function handleStartGame(settings) {
    setGameSettings(settings);
    setShowSettings(false);
    startNewGame();
  }
  
  // Function to undo last move
  function undoLastMove() {
    if (gameHistory.length === 0) return;
    
    // Get the last position from history
    const lastPosition = gameHistory[gameHistory.length - 1];
    
    // Load the previous position
    const gameCopy = new Chess(lastPosition);
    
    // Update the game state
    setGame(gameCopy);
    setCurrentPlayer(gameCopy.turn());
    
    // Remove the last position from history
    setGameHistory(prev => prev.slice(0, -1));
    
    // Clear selection and possible moves
    setSelectedPiece(null);
    setPossibleMoves({});
    
    // If in AI mode and we're now at black's turn, we need to undo one more move
    // to get back to the human player's turn
    if (gameSettings?.mode === 'ai' && gameCopy.turn() === 'b') {
      if (gameHistory.length > 1) {
        const previousPosition = gameHistory[gameHistory.length - 2];
        setGame(new Chess(previousPosition));
        setCurrentPlayer('w');
        setGameHistory(prev => prev.slice(0, -2));
      } else {
        // If there's only one move in history, just start a new game
        startNewGame();
      }
    }
  }
  
  // Function to open tutorial
  function openTutorial() {
    setShowTutorial(true);
  }
  
  // Function to close tutorial
  function closeTutorial() {
    setShowTutorial(false);
  }
  
  // Function to start the app from landing page
  function startApp() {
    setShowLandingPage(false);
  }

  // Function to return to landing page
  function backToLandingPage() {
    setShowLandingPage(true);
  }

  // If showing landing page, render only that
  if (showLandingPage) {
    return <LandingPage onStart={startApp} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Xadrez Online</h1>
        {!showSettings && (
          <div className="header-buttons">
            <button onClick={() => setShowSettings(true)}>Mudar Modo de Jogo</button>
            <button onClick={openTutorial}>Tutorial</button>
            <button onClick={backToLandingPage}>Voltar à Tela Inicial</button>
          </div>
        )}
      </header>
      
      <main className="App-main">
        {showSettings ? (
          <GameSettings 
            onStartGame={handleStartGame} 
            onShowTutorial={openTutorial} 
          />
        ) : (
          <>
            <div className="chessboard-container" ref={boardContainerRef}>
              <div className="board-controls">
                <FullScreenButton targetRef={boardContainerRef} />
              </div>
              
              <div className="board-and-info">
                <div className="board-wrapper">
                  <Chessboard 
                    id="mainBoard"
                    position={game.fen()} 
                    boardWidth={boardContainerRef.current?.offsetWidth > 800 ? 700 : 500}
                    areArrowsAllowed={true}
                    showBoardNotation={true}
                    customBoardStyle={{
                      borderRadius: '4px',
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.5)'
                    }}
                    customDarkSquareStyle={{ backgroundColor: '#2F2F2F' }}
                    customLightSquareStyle={{ backgroundColor: '#E8E8E8' }}
                    customSquareStyles={getCustomSquareStyles()}
                    onSquareClick={handleSquareClick}
                    arePiecesDraggable={false}
                    showPossibleMoves={false}
                  />
                  
                  {isThinking && (
                    <div className="thinking-indicator">
                      <p>IA pensando...</p>
                    </div>
                  )}
                </div>
                
                <div className="game-info-wrapper">
                  <GameInfo 
                    game={game}
                    currentPlayer={currentPlayer}
                    gameSettings={gameSettings}
                    onNewGame={startNewGame}
                    onUndoMove={undoLastMove}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </main>
      
      {showTutorial && <ChessTutorial onClose={closeTutorial} />}
    </div>
  );
}

export default App;
