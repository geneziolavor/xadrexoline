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
import RegistrationForm from './components/RegistrationForm';
import ChallengeRoom from './components/ChallengeRoom';
import RankingTable from './components/RankingTable';
import { AuthProvider } from './firebase/auth';

function App() {
  const [game, setGame] = useState(new Chess());
  const [gameSettings, setGameSettings] = useState(null);
  const [showSettings, setShowSettings] = useState(true);
  const [showTutorial, setShowTutorial] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState('w');
  const [isThinking, setIsThinking] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(true);
  const [currentPage, setCurrentPage] = useState('landing'); // 'landing', 'game', 'register', 'challenges', 'ranking'
  
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
    setCurrentPage('game');
  }

  // Function to return to landing page
  function backToLandingPage() {
    setShowLandingPage(true);
    setCurrentPage('landing');
  }
  
  // Funções para navegação entre páginas
  function goToRegistration() {
    setCurrentPage('register');
    setShowLandingPage(false);
  }
  
  function goToChallenges() {
    setCurrentPage('challenges');
    setShowLandingPage(false);
  }
  
  function goToRanking() {
    setCurrentPage('ranking');
    setShowLandingPage(false);
  }
  
  function goToGame() {
    setCurrentPage('game');
    setShowLandingPage(false);
    setShowSettings(true);
  }

  // If showing landing page, render only that
  if (showLandingPage) {
    return (
      <AuthProvider>
        <LandingPage 
          onStart={startApp} 
          onRegister={goToRegistration}
          onChallenges={goToChallenges}
          onRanking={goToRanking}
        />
      </AuthProvider>
    );
  }
  
  // Renderizar a página conforme a seleção atual
  let pageContent;
  
  if (currentPage === 'register') {
    pageContent = (
      <div className="page-container">
        <RegistrationForm />
        <div className="navigation-buttons">
          <button onClick={goToGame}>Voltar ao Jogo</button>
          <button onClick={goToChallenges}>Ir para Desafios</button>
          <button onClick={goToRanking}>Ver Ranking</button>
          <button onClick={backToLandingPage}>Voltar à Tela Inicial</button>
        </div>
      </div>
    );
  } else if (currentPage === 'challenges') {
    pageContent = (
      <div className="page-container">
        <ChallengeRoom />
        <div className="navigation-buttons">
          <button onClick={goToGame}>Voltar ao Jogo</button>
          <button onClick={goToRegistration}>Ir para Cadastro</button>
          <button onClick={goToRanking}>Ver Ranking</button>
          <button onClick={backToLandingPage}>Voltar à Tela Inicial</button>
        </div>
      </div>
    );
  } else if (currentPage === 'ranking') {
    pageContent = (
      <div className="page-container">
        <RankingTable />
        <div className="navigation-buttons">
          <button onClick={goToGame}>Voltar ao Jogo</button>
          <button onClick={goToRegistration}>Ir para Cadastro</button>
          <button onClick={goToChallenges}>Ir para Desafios</button>
          <button onClick={backToLandingPage}>Voltar à Tela Inicial</button>
        </div>
      </div>
    );
  } else {
    // Jogo (padrão)
    pageContent = (
      <>
        <header className="App-header">
          <h1>Xadrez Online</h1>
          {!showSettings && (
            <div className="header-buttons">
              <button onClick={() => setShowSettings(true)}>Mudar Modo de Jogo</button>
              <button onClick={openTutorial}>Tutorial</button>
              <button onClick={goToRegistration}>Cadastro no Campeonato</button>
              <button onClick={goToChallenges}>Sala de Desafios</button>
              <button onClick={goToRanking}>Ver Ranking</button>
              <button onClick={backToLandingPage}>Voltar à Tela Inicial</button>
            </div>
          )}
        </header>
        
        <main className="App-content">
          {showSettings ? (
            <GameSettings onStartGame={handleStartGame} />
          ) : (
            <div className="game-container">
              <FullScreenButton targetRef={boardContainerRef} />
              <div className="board-container" ref={boardContainerRef}>
                <Chessboard
                  position={game.fen()}
                  onSquareClick={handleSquareClick}
                  customSquareStyles={getCustomSquareStyles()}
                />
              </div>
              
              <div className="info-panel">
                <GameInfo
                  game={game}
                  currentPlayer={currentPlayer}
                  onNewGame={startNewGame}
                  onUndoMove={undoLastMove}
                  isThinking={isThinking}
                  gameMode={gameSettings?.mode}
                />
              </div>
            </div>
          )}
          
          {showTutorial && <ChessTutorial onClose={closeTutorial} />}
        </main>
      </>
    );
  }

  return (
    <AuthProvider>
      <div className="App">
        {pageContent}
      </div>
    </AuthProvider>
  );
}

export default App;
