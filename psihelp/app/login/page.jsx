'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/components.module.css';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        const success = await login(formData.email, formData.senha);
        if (!success) {
          setError('Email ou senha inválidos');
        }
        // Redirecionamento tratado pelo AuthContext baseado no tipo do usuário
      } else {
        if (formData.senha !== formData.confirmarSenha) {
          setError('As senhas não coincidem');
          setLoading(false);
          return;
        }
        
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nome: formData.nome,
            email: formData.email,
            senha: formData.senha
          })
        });
        
        const data = await response.json();
        
        if (data.success) {
          await login(formData.email, formData.senha);
          router.push('/');
        } else {
          setError(data.error || 'Erro ao cadastrar');
        }
      }
    } catch (err) {
      setError(err.message || 'Erro ao autenticar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.loginHeader}>
          <h2>{isLogin ? 'Bem-vindo de volta!' : 'Crie sua conta'}</h2>
          <p>
            {isLogin 
              ? 'Acesse sua conta para encontrar psicólogos' 
              : 'Cadastre-se para começar sua jornada'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.loginForm}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Nome completo</label>
              <input
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleChange}
                required
                placeholder="Seu nome completo"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Senha</label>
            <input
              type="password"
              name="senha"
              value={formData.senha}
              onChange={handleChange}
              required
              placeholder={isLogin ? "Sua senha" : "Mínimo 6 caracteres"}
              minLength={6}
            />
          </div>

          {!isLogin && (
            <div className={styles.formGroup}>
              <label>Confirmar senha</label>
              <input
                type="password"
                name="confirmarSenha"
                value={formData.confirmarSenha}
                onChange={handleChange}
                required
                placeholder="Confirme sua senha"
              />
            </div>
          )}

          {error && <div className={styles.errorBox}>{error}</div>}

          <button 
            type="submit" 
            className={styles.btnSubmit}
            disabled={loading}
          >
            {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
        </form>

        <div className={styles.loginFooter}>
          <button 
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setFormData({
                nome: '',
                email: '',
                senha: '',
                confirmarSenha: ''
              });
            }}
            className={styles.switchButton}
          >
            {isLogin 
              ? 'Não tem conta? Cadastre-se' 
              : 'Já tem conta? Faça login'}
          </button>
        </div>

        <div className={styles.ethicsInfo}>
          <p> Seus dados estão protegidos pela LGPD</p>
          <p> Plataforma em conformidade com o CFP</p>
        </div>
      </div>
    </div>
  );
}