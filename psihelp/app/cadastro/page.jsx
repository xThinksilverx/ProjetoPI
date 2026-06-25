'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import FormCadastroPsicologo from '@/components/FormCadastroPsicologo';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from '@/styles/components.module.css';

export default function CadastroPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?callbackUrl=/cadastro');
    }
    // Admin não tem acesso ao cadastro de psicólogo
    if (!loading && user?.tipo === 'admin') {
      router.push('/admin');
    }
  }, [user, loading, router]);

  if (loading) return <><Header /><LoadingSpinner /></>;
  if (!user || user.tipo === 'admin') return null;

  return (
    <>
      <Header />
      <div className="container" style={{ maxWidth: '760px', paddingTop: '2rem', paddingBottom: '3rem' }}>
        <div className={styles.homeHeader}>
          <h1>Cadastro para Psicólogos</h1>
          <p>
            Você está cadastrando como <strong>{user.nome}</strong> ({user.email}).
            Seu perfil será revisado pelo administrador antes de aparecer no catálogo.
          </p>
        </div>
        <FormCadastroPsicologo user={user} />
      </div>
    </>
  );
}
