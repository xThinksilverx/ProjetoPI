'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import styles from '@/styles/components.module.css';

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/esqueci-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.success) {
        setEnviado(true);
      } else {
        setError(data.error || 'Erro ao processar solicitação');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className={styles.loginContainer}>
        <div className={styles.loginCard}>
          {enviado ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: '1rem' }}>📧</div>
              <h2>Email enviado!</h2>
              <p style={{ color: '#555', lineHeight: 1.6 }}>
                Se esse email estiver cadastrado, você receberá um link para redefinir sua senha.
                Verifique também a pasta de spam.
              </p>
              <Link href="/login" style={{ display: 'inline-block', marginTop: '1.5rem', color: '#4f46e5', textDecoration: 'underline' }}>
                Voltar para o login
              </Link>
            </div>
          ) : (
            <>
              <div className={styles.loginHeader}>
                <h2>Esqueceu a senha?</h2>
                <p>Digite seu email e enviaremos um link para criar uma nova senha.</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.loginForm}>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="seu@email.com"
                  />
                </div>

                {error && <div className={styles.errorBox}>{error}</div>}

                <button type="submit" className={styles.btnSubmit} disabled={loading}>
                  {loading ? 'Enviando...' : 'Enviar link de redefinição'}
                </button>
              </form>

              <div className={styles.loginFooter}>
                <Link href="/login" className={styles.switchButton}>
                  Voltar para o login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
