import { Chess } from 'chess.js';

// Stockfish worker para comunicar com o motor Stockfish
let stockfishWorker = null;

// Esta classe lida com a comunicação com o motor de xadrez da IA
export class ChessAI {
  constructor() {
    this.initializeEngine();
  }

  // Inicializar o motor Stockfish
  initializeEngine() {
    if (stockfishWorker) {
      return;
    }

    try {
      // Tenta criar um novo worker
      stockfishWorker = new Worker('./stockfish.js');
      stockfishWorker.postMessage('uci');
      stockfishWorker.postMessage('isready');
    } catch (error) {
      console.error('Falha ao inicializar o motor Stockfish:', error);
    }
  }

  // Gerar um movimento baseado na posição atual e dificuldade
  async makeMove(fen, difficulty) {
    return new Promise((resolve) => {
      // Se o worker do Stockfish não estiver disponível, use movimentos aleatórios
      if (!stockfishWorker) {
        console.error('Motor Stockfish não inicializado, usando movimento aleatório');
        resolve(this.makeRandomMove(fen));
        return;
      }

      // Configuração de dificuldade e profundidade
      const depthByDifficulty = {
        easy: 2,    // Fácil: Profundidade de busca muito limitada
        medium: 8,  // Médio: Profundidade de busca moderada
        hard: 15    // Difícil: Busca profunda para movimentos fortes
      };

      // Definir quantos movimentos considerar
      const multiPvByDifficulty = {
        easy: 5,    // Fácil: Considerar muitas alternativas
        medium: 3,  // Médio: Considerar algumas alternativas
        hard: 1     // Difícil: Jogar apenas o melhor movimento
      };

      const skillLevelByDifficulty = {
        easy: 5,     // Nível de habilidade baixo
        medium: 15,  // Nível de habilidade médio
        hard: 20     // Nível de habilidade alto
      };

      // Configurar Stockfish para a dificuldade atual
      const depth = depthByDifficulty[difficulty] || 10;
      const multiPv = multiPvByDifficulty[difficulty] || 1;
      const skillLevel = skillLevelByDifficulty[difficulty] || 20;

      try {
        stockfishWorker.postMessage(`setoption name Skill Level value ${skillLevel}`);
        stockfishWorker.postMessage(`setoption name MultiPV value ${multiPv}`);
        stockfishWorker.postMessage(`position fen ${fen}`);
        stockfishWorker.postMessage(`go depth ${depth}`);

        // Definir um timeout para segurança
        const timeoutId = setTimeout(() => {
          console.log("Timeout para movimento da IA - usando movimento aleatório");
          resolve(this.makeRandomMove(fen));
        }, 5000); // 5 segundos de timeout

        // Ouvir a resposta do melhor movimento do Stockfish
        stockfishWorker.onmessage = (event) => {
          const message = event.data;
          
          if (message.includes('bestmove')) {
            clearTimeout(timeoutId); // Limpar o timeout
            
            const parts = message.split(' ');
            const bestMoveIdx = parts.indexOf('bestmove');
            
            if (bestMoveIdx !== -1 && parts.length > bestMoveIdx + 1) {
              const bestMove = parts[bestMoveIdx + 1];
              
              // Se estivermos jogando na dificuldade fácil, podemos não selecionar o melhor movimento
              if (difficulty === 'easy') {
                // 50% de chance de escolher um movimento legal aleatório em vez do melhor
                if (Math.random() < 0.5) {
                  resolve(this.makeRandomMove(fen));
                  return;
                }
              }
              
              resolve(bestMove);
            } else {
              // Fallback para movimento aleatório se o melhor movimento não for encontrado
              resolve(this.makeRandomMove(fen));
            }
          }
        };
      } catch (error) {
        console.error("Erro ao comunicar com Stockfish:", error);
        resolve(this.makeRandomMove(fen));
      }
    });
  }

  // Fazer um movimento legal aleatório quando o Stockfish não estiver disponível ou para dificuldade fácil
  makeRandomMove(fen) {
    try {
      const game = new Chess(fen);
      const legalMoves = game.moves({ verbose: true });
      
      if (legalMoves.length === 0) {
        return null; // Nenhum movimento legal disponível (xeque-mate ou empate)
      }
      
      // Selecionar um movimento legal aleatório
      const randomIdx = Math.floor(Math.random() * legalMoves.length);
      const randomMove = legalMoves[randomIdx];
      
      // Retorna o movimento no formato from:to
      return randomMove.from + randomMove.to;
    } catch (error) {
      console.error("Erro ao gerar movimento aleatório:", error);
      return null;
    }
  }

  // Limpeza - terminar worker quando o componente é desmontado
  cleanup() {
    if (stockfishWorker) {
      stockfishWorker.terminate();
      stockfishWorker = null;
    }
  }
}

export default ChessAI; 