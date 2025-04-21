import React, { useState } from 'react';
import { addStudentRegistration } from '../firebase/tournamentService';
import './RegistrationForm.css';

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    grade: '',
    age: '',
    school: '',
    email: '',
    phone: '',
    guardian: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.grade || !formData.age) {
      setSubmitStatus({
        success: false,
        message: 'Por favor, preencha todos os campos obrigatórios.'
      });
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus(null);
    
    try {
      await addStudentRegistration({
        ...formData,
        registrationDate: new Date(),
        rating: 1200, // Rating inicial padrão
        wins: 0,
        losses: 0,
        draws: 0,
        status: 'active'
      });
      
      setSubmitStatus({
        success: true,
        message: 'Registro concluído com sucesso! Você foi adicionado ao campeonato.'
      });
      
      // Limpar o formulário após o sucesso
      setFormData({
        name: '',
        grade: '',
        age: '',
        school: '',
        email: '',
        phone: '',
        guardian: ''
      });
      
    } catch (error) {
      console.error('Erro ao registrar aluno:', error);
      setSubmitStatus({
        success: false,
        message: `Erro ao registrar: ${error.message}`
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="registration-container">
      <h2>Cadastro para o Campeonato de Xadrez</h2>
      <p className="registration-info">
        Complete o formulário abaixo para participar do campeonato online de xadrez.
      </p>
      
      {submitStatus && (
        <div className={`status-message ${submitStatus.success ? 'success' : 'error'}`}>
          {submitStatus.message}
        </div>
      )}
      
      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Nome Completo*</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="grade">Série/Turma*</label>
          <input
            type="text"
            id="grade"
            name="grade"
            value={formData.grade}
            onChange={handleChange}
            required
            placeholder="Ex: 7º Ano B"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="age">Idade*</label>
          <input
            type="number"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            required
            min="5"
            max="20"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="school">Escola</label>
          <input
            type="text"
            id="school"
            name="school"
            value={formData.school}
            onChange={handleChange}
            placeholder="Nome da escola (opcional)"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email de Contato</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email (opcional)"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="phone">Telefone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Telefone (opcional)"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="guardian">Nome do Responsável</label>
          <input
            type="text"
            id="guardian"
            name="guardian"
            value={formData.guardian}
            onChange={handleChange}
            placeholder="Para menores de 18 anos (opcional)"
          />
        </div>
        
        <div className="form-submit">
          <button 
            type="submit" 
            className="register-button"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Registrando...' : 'Registrar para o Campeonato'}
          </button>
        </div>
      </form>
      
      <div className="registration-footer">
        <p>* Campos obrigatórios</p>
        <p>Após o registro, você poderá acessar os desafios e partidas do campeonato.</p>
      </div>
    </div>
  );
};

export default RegistrationForm; 