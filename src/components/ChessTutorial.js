import React, { useState, useEffect } from 'react';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import './ChessTutorial.css';

const tutorials = [
  {
    id: 1,
    title: "Peças de Xadrez e Movimentos",
    description: "Conheça cada peça e como ela se move no tabuleiro.",
    steps: [
      {
        title: "O Peão",
        content: "Os peões se movem para frente uma casa por vez. Na primeira jogada, podem avançar duas casas. Eles capturam peças diagonalmente.",
        position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        highlights: ["e2", "e3", "e4", "d3", "f3"],
        arrows: [["e2", "e3"], ["e2", "e4"], ["e2", "d3"], ["e2", "f3"]]
      },
      {
        title: "A Torre",
        content: "A torre se move em linha reta - horizontal ou verticalmente - quantas casas quiser.",
        position: "8/8/8/8/8/8/8/R7 w - - 0 1",
        highlights: ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "b1", "c1", "d1", "e1", "f1", "g1", "h1"],
        arrows: [["a1", "a8"], ["a1", "h1"]]
      },
      {
        title: "O Cavalo",
        content: "O cavalo se move em formato de L: duas casas em uma direção e uma casa em ângulo reto. Ele pode pular sobre outras peças.",
        position: "8/8/8/8/8/8/8/1N6 w - - 0 1",
        highlights: ["b1", "a3", "c3", "d2"],
        arrows: [["b1", "a3"], ["b1", "c3"], ["b1", "d2"]]
      },
      {
        title: "O Bispo",
        content: "O bispo se move em diagonal, quantas casas quiser. Cada bispo permanece em casas da mesma cor durante todo o jogo.",
        position: "8/8/8/8/8/8/8/2B5 w - - 0 1",
        highlights: ["c1", "b2", "a3", "d2", "e3", "f4", "g5", "h6"],
        arrows: [["c1", "a3"], ["c1", "h6"]]
      },
      {
        title: "A Rainha",
        content: "A rainha é a peça mais poderosa. Ela combina os movimentos da torre e do bispo: pode mover-se em linha reta ou diagonal, quantas casas quiser.",
        position: "8/8/8/8/8/8/8/3Q4 w - - 0 1",
        highlights: ["d1", "a1", "h1", "a4", "d8", "h5"],
        arrows: [["d1", "d8"], ["d1", "h5"], ["d1", "a1"]]
      },
      {
        title: "O Rei",
        content: "O rei pode mover-se uma casa em qualquer direção. Proteger o rei é o objetivo do jogo - se seu rei for capturado (xeque-mate), você perde.",
        position: "8/8/8/8/8/8/8/4K3 w - - 0 1",
        highlights: ["e1", "d1", "d2", "e2", "f2", "f1"],
        arrows: [["e1", "e2"], ["e1", "d1"], ["e1", "f2"]]
      }
    ]
  },
  {
    id: 2,
    title: "Regras Especiais",
    description: "Aprenda movimentos especiais e regras importantes do xadrez.",
    steps: [
      {
        title: "Captura En Passant",
        content: "Quando um peão avança duas casas e fica ao lado de um peão adversário, este pode capturá-lo como se tivesse avançado apenas uma casa.",
        position: "8/8/8/8/5p2/8/4P3/8 w - - 0 1",
        highlights: ["e2", "e4", "f4", "e3"],
        arrows: [["e2", "e4"], ["f4", "e3"]]
      },
      {
        title: "Promoção de Peão",
        content: "Quando um peão chega até a última fileira do tabuleiro, ele pode ser promovido a qualquer outra peça (geralmente uma rainha).",
        position: "8/4P3/8/8/8/8/8/8 w - - 0 1",
        highlights: ["e7", "e8"],
        arrows: [["e7", "e8"]]
      },
      {
        title: "Roque",
        content: "Um movimento especial que envolve o rei e uma das torres. Permite proteger o rei e ativar a torre simultaneamente.",
        position: "r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1",
        highlights: ["e1", "g1", "c1", "a1", "h1"],
        arrows: [["e1", "g1"], ["e1", "c1"]]
      }
    ]
  },
  {
    id: 3,
    title: "Conceitos Básicos",
    description: "Estratégias e conceitos que todo iniciante deve conhecer.",
    steps: [
      {
        title: "Controle do Centro",
        content: "As quatro casas centrais são estratégicas. Controlar o centro dá mais mobilidade às suas peças e restringe o movimento das peças adversárias.",
        position: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
        highlights: ["d4", "e4", "d5", "e5"],
        arrows: []
      },
      {
        title: "Desenvolvimento",
        content: "Desenvolva suas peças no início do jogo. Tire seus cavalos e bispos, faça o roque e conecte suas torres.",
        position: "rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1",
        highlights: ["b1", "g1", "c1", "f1"],
        arrows: [["e2", "e4"], ["g1", "f3"], ["f1", "c4"]]
      },
      {
        title: "Proteção do Rei",
        content: "O roque é importante para proteger seu rei. Tente rocar cedo no jogo.",
        position: "r3k2r/ppp1pppp/2nqbn2/3p4/3P4/2NQBN2/PPP1PPPP/R3K2R w KQkq - 0 1",
        highlights: ["e1", "g1"],
        arrows: [["e1", "g1"]]
      }
    ]
  }
];

const ChessTutorial = ({ onClose }) => {
  const [currentTutorial, setCurrentTutorial] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [game, setGame] = useState(new Chess());
  
  // Use useEffect para atualizar o estado do jogo quando o passo ou tutorial mudar
  useEffect(() => {
    if (currentTutorial && currentTutorial.steps && currentTutorial.steps[currentStep]) {
      try {
        const newGame = new Chess();
        const position = currentTutorial.steps[currentStep].position;
        
        if (position) {
          newGame.load(position);
          setGame(newGame);
        }
      } catch (error) {
        console.error("Erro ao carregar posição:", error);
      }
    }
  }, [currentTutorial, currentStep]);
  
  // Se nenhum tutorial estiver selecionado, mostre a tela de seleção
  if (!currentTutorial) {
    return (
      <div className="tutorial-container">
        <h2>Tutorial de Xadrez</h2>
        <p className="tutorial-intro">Selecione um tópico para iniciar o tutorial:</p>
        
        <div className="tutorial-list">
          {tutorials.map((tutorial) => (
            <div 
              key={tutorial.id} 
              className="tutorial-card"
            >
              <h3>{tutorial.title}</h3>
              <p>{tutorial.description}</p>
              <button onClick={() => {
                setCurrentTutorial(tutorial);
                setCurrentStep(0); // Reinicia para o primeiro passo
              }}>
                Iniciar
              </button>
            </div>
          ))}
        </div>
        
        <button className="close-tutorial" onClick={onClose}>
          Voltar para o Jogo
        </button>
      </div>
    );
  }
  
  // Obter dados do passo atual
  const step = currentTutorial.steps[currentStep];
  
  // Verificação de segurança para evitar erros
  if (!step) {
    return (
      <div className="tutorial-container">
        <h2>Erro ao carregar tutorial</h2>
        <button className="close-tutorial" onClick={() => setCurrentTutorial(null)}>
          Voltar para os Tutoriais
        </button>
      </div>
    );
  }
  
  return (
    <div className="tutorial-container active-tutorial">
      <div className="tutorial-header">
        <h2>{currentTutorial.title}</h2>
        <div className="tutorial-navigation">
          <span>Passo {currentStep + 1} de {currentTutorial.steps.length}</span>
        </div>
      </div>
      
      <div className="tutorial-content">
        <div className="tutorial-board">
          <Chessboard
            position={game.fen()}
            boardWidth={400}
            showBoardNotation={true}
            areArrowsAllowed={true}
            customArrows={step.arrows || []}
            customSquareStyles={
              step.highlights?.reduce((styles, square) => {
                styles[square] = { backgroundColor: 'rgba(212, 175, 55, 0.4)' };
                return styles;
              }, {}) || {}
            }
          />
        </div>
        
        <div className="tutorial-lesson">
          <h3>{step.title}</h3>
          <p>{step.content}</p>
          
          <div className="tutorial-buttons">
            <button 
              disabled={currentStep === 0} 
              onClick={() => setCurrentStep(currentStep - 1)}
            >
              Anterior
            </button>
            
            {currentStep < currentTutorial.steps.length - 1 ? (
              <button onClick={() => setCurrentStep(currentStep + 1)}>
                Próximo
              </button>
            ) : (
              <button onClick={() => setCurrentTutorial(null)}>
                Concluir
              </button>
            )}
          </div>
        </div>
      </div>
      
      <button className="close-tutorial" onClick={onClose}>
        Sair do Tutorial
      </button>
    </div>
  );
};

export default ChessTutorial; 