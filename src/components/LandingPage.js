import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onStart, onRegister, onChallenges, onRanking }) => {
  return (
    <div className="landing-page">
      <div className="landing-content">
        <div className="landing-header">
          <h1>Bem-vindo ao <span className="accent">Xadrez Online</span></h1>
          <h2 className="school-name">EEB PROFESSOR PEDRO TEIXEIRA BARROSO</h2>
          <h3 className="teacher-name">PROJETO DESENVOLVIDO PELO PROFESSOR: GENEZIO DE LAVOR OLIVEIRA</h3>
          <p className="subtitle">Uma plataforma educativa para aprender e jogar xadrez</p>
        </div>
        
        <div className="features-section">
          <h2>Recursos</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">♟️</div>
              <h3>Tabuleiro Interativo</h3>
              <p>Jogue xadrez com interface amigável e movimentos intuitivos</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">🤖</div>
              <h3>Jogue contra a IA</h3>
              <p>Desafie nosso computador em diferentes níveis de dificuldade</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Jogo Local</h3>
              <p>Jogue com amigos no mesmo dispositivo</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <h3>Tutorial Completo</h3>
              <p>Aprenda os fundamentos do xadrez com nosso tutorial interativo</p>
            </div>
          </div>
        </div>
        
        <div className="new-features-section">
          <h2>Campeonato de Xadrez Online</h2>
          <p>Participe do nosso campeonato escolar de xadrez online!</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Competição</h3>
              <p>Desafie outros estudantes e conquiste o título de mestre do xadrez</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Ranking</h3>
              <p>Acompanhe sua posição no ranking e evolua seus pontos</p>
            </div>
          </div>
        </div>
        
        <div className="benefits-section">
          <h2>Plataforma Educacional</h2>
          <p>
            Este aplicativo foi desenvolvido com foco educacional para ajudar estudantes a 
            aprender e praticar xadrez. O xadrez desenvolve diversas habilidades importantes:
          </p>
          <ul className="benefits-list">
            <li>Pensamento estratégico e planejamento</li>
            <li>Capacidade de concentração</li>
            <li>Tomada de decisão sob pressão</li>
            <li>Visualização espacial e raciocínio lógico</li>
            <li>Paciência e persistência</li>
          </ul>
        </div>
        
        <div className="start-section">
          <button className="start-button primary" onClick={onStart}>
            Jogar Xadrez
          </button>
          
          <div className="secondary-buttons">
            <button className="start-button secondary" onClick={onRegister}>
              Registrar no Campeonato
            </button>
            <button className="start-button secondary" onClick={onChallenges}>
              Sala de Desafios
            </button>
            <button className="start-button secondary" onClick={onRanking}>
              Ver Ranking
            </button>
          </div>
        </div>
      </div>
      
      <footer className="landing-footer">
        <p>CLUBE DE ROBÓTICA CRIATIVA DE ITAPIPOCA CE</p>
        <p>&copy; 2025 Xadrez Online - Todos os direitos reservados</p>
      </footer>
    </div>
  );
};

export default LandingPage; 