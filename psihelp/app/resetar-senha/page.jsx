'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import styles from '@/styles/components.module.css';

export default function ResetarSenhaPage() {
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (novaSenha !== confirmar) {
      setError('As senhas não coincidem');
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError('Link inválido. Solicite um novo email de redefinição.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/resetar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, novaSenha }),
      });

      const data = await res.json();

      if (data.success) {
        setSucesso(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        setError(data.error || 'Erro ao alterar senha');
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
          {sucesso ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 56, marginBottom: '1rem' }}>✅</div>
              <h2>Senha alterada!</h2>
              <p style={{ color: '#555' }}>Redirecionando para o login...</p>
            </div>
          ) : (
            <>
              <div className={styles.loginHeader}>
                <h2>Nova senha</h2>
                <p>Digite e confirme sua nova senha.</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.loginForm}>
                <div className={styles.formGroup}>
                  <label>Nova senha</label>
                  <input
                    type="password"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    required
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>Confirmar senha</label>
                  <input
                    type="password"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    required
                    placeholder="Repita a nova senha"
                  />
                </div>

                {error && <div className={styles.errorBox}>{error}</div>}

                <button type="submit" className={styles.btnSubmit} disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar nova senha'}
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
