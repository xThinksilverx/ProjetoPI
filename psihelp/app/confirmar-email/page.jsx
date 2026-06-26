'use client';

import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Link from 'next/link';

export default function ConfirmarEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  return (
    <>
      <Header />
      <div style={{
        maxWidth: 480,
        margin: '80px auto',
        textAlign: 'center',
        padding: '0 1.5rem',
      }}>
        <div style={{ fontSize: 64, marginBottom: '1rem' }}>📧</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Verifique seu email</h2>
        <p style={{ color: '#555', lineHeight: 1.6 }}>
          Enviamos um link de confirmação para{' '}
          {email ? <strong>{email}</strong> : 'seu email'}.
          <br />
          Clique no link para ativar sua conta.
        </p>

        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: 8,
          padding: '1rem 1.25rem',
          margin: '1.5rem 0',
          fontSize: 14,
          color: '#0369a1',
          textAlign: 'left',
        }}>
          <strong>Não recebeu?</strong>
          <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.25rem', lineHeight: 1.8 }}>
            <li>Verifique a pasta de spam ou lixo eletrônico</li>
            <li>O email pode demorar alguns minutos</li>
          </ul>
        </div>

        <Link href="/login" style={{ color: '#4f46e5', textDecoration: 'underline', fontSize: 14 }}>
          Voltar para o login
        </Link>
      </div>
    </>
  );
}
