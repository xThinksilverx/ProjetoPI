'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function VerificarEmailPage() {
  const [status, setStatus] = useState('carregando');
  const [mensagem, setMensagem] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const chamado = useRef(false);

  useEffect(() => {
    if (chamado.current) return;
    chamado.current = true;

    const token = searchParams.get('token');

    if (!token) {
      setStatus('erro');
      setMensagem('Link inválido. Verifique o email recebido.');
      return;
    }

    fetch(`/api/auth/verificar-email?token=${token}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.success) {
          if (refreshUser) await refreshUser();
          setStatus('sucesso');
          setTimeout(() => router.push('/'), 3000);
        } else {
          setStatus('erro');
          setMensagem(data.error || 'Erro ao verificar email.');
        }
      })
      .catch(() => {
        setStatus('erro');
        setMensagem('Erro de conexão. Tente novamente.');
      });
  }, [searchParams, router, refreshUser]);

  return (
    <>
      <Header />
      <div style={{ maxWidth: 480, margin: '80px auto', textAlign: 'center', padding: '0 1rem' }}>
        {status === 'carregando' && (
          <>
            <LoadingSpinner />
            <p>Verificando seu email...</p>
          </>
        )}

        {status === 'sucesso' && (
          <>
            <div style={{ fontSize: 64 }}>✅</div>
            <h2>Email verificado!</h2>
            <p>Sua conta foi ativada com sucesso. Redirecionando...</p>
          </>
        )}

        {status === 'erro' && (
          <>
            <div style={{ fontSize: 64 }}>❌</div>
            <h2>Verificação falhou</h2>
            <p>{mensagem}</p>
            <a href="/login" style={{ color: '#4f46e5', textDecoration: 'underline' }}>
              Ir para o login
            </a>
          </>
        )}
      </div>
    </>
  );
}
