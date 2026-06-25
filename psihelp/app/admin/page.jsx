'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from '@/styles/components.module.css';

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [psicologos, setPsicologos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aba, setAba] = useState('pendentes');
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.tipo !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.tipo === 'admin') carregarPsicologos();
  }, [user]);

  const carregarPsicologos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/psicologos');
      const data = await res.json();
      if (data.success) setPsicologos(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const alterarValidado = async (id, validado) => {
    try {
      const res = await fetch(`/api/psicologos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validado })
      });
      const data = await res.json();
      if (data.success) {
        setPsicologos(prev => prev.map(p => p._id === id ? { ...p, validado } : p));
        setFeedback(validado ? 'Psicólogo aprovado!' : 'Psicólogo ocultado do catálogo.');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const excluir = async (id) => {
    try {
      const res = await fetch(`/api/psicologos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setPsicologos(prev => prev.filter(p => p._id !== id));
        setConfirmDelete(null);
        setFeedback('Cadastro excluído com sucesso.');
        setTimeout(() => setFeedback(''), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (authLoading || loading) return <><Header /><LoadingSpinner /></>;
  if (!user || user.tipo !== 'admin') return null;

  const pendentes = psicologos.filter(p => !p.validado);
  const aprovados = psicologos.filter(p => p.validado);
  const lista = aba === 'pendentes' ? pendentes : aba === 'aprovados' ? aprovados : psicologos;

  return (
    <>
      <Header />
      <div className="container" style={{ marginTop: '2rem', marginBottom: '3rem' }}>
        <div className={styles.adminHeader}>
          <h1>Painel Administrativo</h1>
          <p>Gerencie os cadastros de psicólogos da plataforma</p>
        </div>

        <div className={styles.adminStats}>
          <div className={styles.statCard}>
            <span className={styles.statNumber}>{psicologos.length}</span>
            <span className={styles.statLabel}>Total</span>
          </div>
          <div className={`${styles.statCard} ${styles.statPendente}`}>
            <span className={styles.statNumber}>{pendentes.length}</span>
            <span className={styles.statLabel}>Pendentes</span>
          </div>
          <div className={`${styles.statCard} ${styles.statAprovado}`}>
            <span className={styles.statNumber}>{aprovados.length}</span>
            <span className={styles.statLabel}>Aprovados</span>
          </div>
        </div>

        {feedback && <div className={styles.successMsg}>{feedback}</div>}

        <div className={styles.adminTabs}>
          {['pendentes', 'aprovados', 'todos'].map(t => (
            <button
              key={t}
              className={`${styles.adminTab} ${aba === t ? styles.adminTabAtivo : ''}`}
              onClick={() => setAba(t)}
            >
              {t === 'pendentes' ? `Pendentes (${pendentes.length})` : t === 'aprovados' ? `Aprovados (${aprovados.length})` : `Todos (${psicologos.length})`}
            </button>
          ))}
        </div>

        {lista.length === 0 ? (
          <div className={styles.semResultados}>
            <p>Nenhum psicólogo nesta categoria.</p>
          </div>
        ) : (
          <div className={styles.adminLista}>
            {lista.map(p => (
              <div key={p._id} className={styles.adminCard}>
                <div className={styles.adminCardInfo}>
                  <div className={styles.adminCardNome}>
                    <strong>{p.nome}</strong>
                    <span className={p.validado ? styles.badgeAprovado : styles.badgePendente}>
                      {p.validado ? 'Ativo' : 'Pendente'}
                    </span>
                  </div>
                  <div className={styles.adminCardDetalhes}>
                    <span>CRP: {p.crp}</span>
                    <span>{p.email}</span>
                    <span>{p.modalidade === 'online' ? 'Online' : 'Presencial'}</span>
                    <span>R$ {p.preco?.toFixed(2)}/sessão</span>
                    {p.localizacao?.cidade && (
                      <span>{p.localizacao.cidade} - {p.localizacao.estado}</span>
                    )}
                  </div>
                  {p.descricao && (
                    <p className={styles.adminCardDesc}>{p.descricao}</p>
                  )}
                  {p.abordagens?.length > 0 && (
                    <div className={styles.abordagens}>
                      {p.abordagens.map(a => <span key={a} className={styles.tag}>{a}</span>)}
                    </div>
                  )}
                </div>

                <div className={styles.adminCardAcoes}>
                  <Link href={`/admin/psicologos/${p._id}`} className={styles.btnVerPerfil} style={{ display: 'block', textAlign: 'center', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none', background: '#eff6ff', color: '#2a5298' }}>
                    Ver perfil
                  </Link>
                  {!p.validado ? (
                    <button
                      className={styles.btnAprovar}
                      onClick={() => alterarValidado(p._id, true)}
                    >
                      Aprovar
                    </button>
                  ) : (
                    <button
                      className={styles.btnOcultar}
                      onClick={() => alterarValidado(p._id, false)}
                    >
                      Ocultar
                    </button>
                  )}
                  <button
                    className={styles.btnExcluir}
                    onClick={() => setConfirmDelete(p._id)}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {confirmDelete && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalBox}>
              <h3>Confirmar exclusão</h3>
              <p>Tem certeza que deseja excluir este cadastro? Esta ação não pode ser desfeita.</p>
              <div className={styles.modalAcoes}>
                <button className={styles.btnExcluir} onClick={() => excluir(confirmDelete)}>
                  Sim, excluir
                </button>
                <button className={styles.btnCancel} onClick={() => setConfirmDelete(null)}>
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
