'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from '@/styles/components.module.css';

const DIAS = ['segunda','terca','quarta','quinta','sexta','sabado','domingo'];
const NOMES_DIAS = { segunda:'Seg', terca:'Ter', quarta:'Qua', quinta:'Qui', sexta:'Sex', sabado:'Sáb', domingo:'Dom' };
const HORARIOS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

function labelModalidade(m) {
  if (m === 'ambos') return 'Online e Presencial';
  if (m === 'online') return 'Online';
  return 'Presencial';
}

function isDisponivel(disponibilidade, dia, horario) {
  return disponibilidade?.find(d => d.dia === dia)?.horarios?.includes(horario) ?? false;
}

function isBloqueado(bloqueados, dia, horario) {
  return bloqueados?.find(d => d.dia === dia)?.horarios?.includes(horario) ?? false;
}

function formatarWhatsApp(telefone) {
  if (!telefone) return null;
  const digits = telefone.replace(/\D/g, '');
  return digits.startsWith('55') && digits.length >= 12 ? digits : '55' + digits;
}

export default function AdminPsicologoDetalhe() {
  const { id } = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [psicologo, setPsicologo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.tipo !== 'admin')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user?.tipo === 'admin') return;
    fetch(`/api/psicologos/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setPsicologo(data.data);
        else router.push('/admin');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const alterarValidado = async (validado) => {
    try {
      const res = await fetch(`/api/psicologos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ validado }),
      });
      const data = await res.json();
      if (data.success) {
        setPsicologo(prev => ({ ...prev, validado }));
        setFeedback(validado ? 'Psicólogo aprovado com sucesso!' : 'Cadastro ocultado do catálogo.');
        setTimeout(() => setFeedback(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const excluir = async () => {
    try {
      const res = await fetch(`/api/psicologos/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) router.push('/admin');
    } catch (err) {
      console.error(err);
    }
  };

  const abrirWhatsAppValidacao = () => {
    const numero = formatarWhatsApp(psicologo.telefone);
    if (!numero) {
      alert('Este psicólogo não cadastrou telefone.');
      return;
    }
    const msg = encodeURIComponent(
      `Olá, ${psicologo.nome}! Somos da equipe PsiMatch e estamos analisando seu cadastro como psicólogo(a). Poderia confirmar que seu CRP ${psicologo.crp} está ativo e enviar uma foto do seu documento de registro? Agradecemos a colaboração!`
    );
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
  };

  const emailContato = psicologo?.emailProfissional || psicologo?.email;

  const abrirEmail = () => {
    if (!emailContato) return;
    const assunto = encodeURIComponent('Validação de cadastro — PsiMatch');
    const corpo = encodeURIComponent(
      `Olá, ${psicologo.nome}!\n\nEstamos analisando seu cadastro como psicólogo(a) na plataforma PsiMatch e precisamos confirmar algumas informações.\n\nCRP informado: ${psicologo.crp}\n\nPoderia nos enviar uma foto do seu documento de registro no CRP para prosseguirmos com a validação?\n\nAtenciosamente,\nEquipe PsiMatch`
    );
    window.location.href = `mailto:${emailContato}?subject=${assunto}&body=${corpo}`;
  };

  if (authLoading || loading) return <><Header /><LoadingSpinner /></>;
  if (!user || user.tipo !== 'admin' || !psicologo) return null;

  const temDisponibilidade = psicologo.disponibilidade?.some(d => d.horarios?.length > 0);

  return (
    <>
      <Header />
      <div className="container" style={{ maxWidth: '860px', paddingTop: '2rem', paddingBottom: '3rem' }}>

        {/* Breadcrumb */}
        <div style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: '#64748b' }}>
          <button onClick={() => router.push('/admin')} className={styles.btnVoltar}>
            ← Painel Admin
          </button>
          <span>/</span>
          <span>Revisão de cadastro</span>
        </div>

        {feedback && <div className={styles.successMsg} style={{ marginBottom: '1rem' }}>{feedback}</div>}

        {/* Hero */}
        <div className={styles.detalheHero}>
          <div className={styles.detalheFotoWrap}>
            <img
              src={psicologo.foto || '/default-avatar.svg'}
              alt={psicologo.nome}
              className={styles.detalheFoto}
            />
            <span className={psicologo.validado ? styles.badgeAprovado : styles.badgePendente}>
              {psicologo.validado ? 'Ativo' : 'Pendente'}
            </span>
          </div>

          <div className={styles.detalheInfo}>
            <h1 className={styles.detalheNome}>{psicologo.nome}</h1>
            <p className={styles.detalheCrp}>CRP: {psicologo.crp}</p>

            <div className={styles.detalheMeta}>
              <span>💰 R$ {psicologo.preco}/sessão</span>
              <span>🖥️ {labelModalidade(psicologo.modalidade)}</span>
              {psicologo.localizacao?.cidade && (
                <span>📍 {psicologo.localizacao.cidade} — {psicologo.localizacao.estado}</span>
              )}
            </div>

            {psicologo.emailProfissional && (
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>
                📧 {psicologo.emailProfissional} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(profissional)</span>
              </p>
            )}
            {psicologo.email && (
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.25rem' }}>
                📧 {psicologo.email} <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>(conta)</span>
              </p>
            )}
            {psicologo.telefone && (
              <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '0.75rem' }}>
                📱 {psicologo.telefone}
              </p>
            )}
            {psicologo.formacao && <p className={styles.detalheFormacao}>{psicologo.formacao}</p>}

            {/* Ações de validação */}
            <div className={styles.adminAcoesValidacao}>
              <p className={styles.adminAcoesLabel}>Contato para validação</p>
              <div className={styles.adminAcoesBotoes}>
                {psicologo.telefone && (
                  <button className={styles.btnWhatsAppAdmin} onClick={abrirWhatsAppValidacao}>
                    📱 WhatsApp
                  </button>
                )}
                {emailContato && (
                  <button className={styles.btnEmailAdmin} onClick={abrirEmail}>
                    📧 E-mail
                  </button>
                )}
              </div>
            </div>

            {/* Botões de aprovação */}
            <div className={styles.adminAcoesAprovacao}>
              {!psicologo.validado ? (
                <button className={styles.btnAprovar} onClick={() => alterarValidado(true)}>
                  ✓ Aprovar cadastro
                </button>
              ) : (
                <button className={styles.btnOcultar} onClick={() => alterarValidado(false)}>
                  Ocultar do catálogo
                </button>
              )}
              <button className={styles.btnExcluir} onClick={() => setConfirmDelete(true)}>
                Excluir cadastro
              </button>
            </div>
          </div>
        </div>

        {/* Descrição */}
        {psicologo.descricao && (
          <div className={styles.detalheSecao}>
            <h2>Sobre</h2>
            <p style={{ lineHeight: 1.7, color: '#334155' }}>{psicologo.descricao}</p>
          </div>
        )}

        {/* Abordagens */}
        {psicologo.abordagens?.length > 0 && (
          <div className={styles.detalheSecao}>
            <h2>Abordagens terapêuticas</h2>
            <div className={styles.abordagens}>
              {psicologo.abordagens.map(ab => <span key={ab} className={styles.tag}>{ab}</span>)}
            </div>
          </div>
        )}

        {/* Especializações */}
        {psicologo.especializacoes?.length > 0 && (
          <div className={styles.detalheSecao}>
            <h2>Especializações</h2>
            <div className={styles.abordagens}>
              {psicologo.especializacoes.map(e => (
                <span key={e} className={styles.tag} style={{ background: '#f0fdf4', color: '#166534' }}>{e}</span>
              ))}
            </div>
          </div>
        )}

        {/* Grade de horários */}
        {temDisponibilidade && (
          <div className={styles.detalheSecao}>
            <h2>Horários cadastrados</h2>
            <div style={{ overflowX: 'auto' }}>
              <table className={styles.gradeTable}>
                <thead>
                  <tr>
                    <th className={styles.gradeHora}></th>
                    {DIAS.map(d => <th key={d} className={styles.gradeDia}>{NOMES_DIAS[d]}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {HORARIOS.map(h => {
                    const temAlgum = DIAS.some(d => isDisponivel(psicologo.disponibilidade, d, h));
                    if (!temAlgum) return null;
                    return (
                      <tr key={h}>
                        <td className={styles.gradeHora}>{h}</td>
                        {DIAS.map(d => {
                          const disponivel = isDisponivel(psicologo.disponibilidade, d, h);
                          if (!disponivel) return <td key={d} className={styles.gradeCell}><div className={styles.gradeIndisponivel} /></td>;
                          const bloqueado = isBloqueado(psicologo.bloqueados, d, h);
                          return (
                            <td key={d} className={styles.gradeCell}>
                              <div className={bloqueado ? styles.gradeBloqueado : styles.gradeSelecionado} title={bloqueado ? 'Bloqueado pelo psicólogo' : 'Disponível'} />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.5rem' }}>
              Azul = disponível · Vermelho = bloqueado pelo psicólogo
            </p>
          </div>
        )}
      </div>

      {/* Modal de confirmação de exclusão */}
      {confirmDelete && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <h3>Confirmar exclusão</h3>
            <p>Tem certeza que deseja excluir o cadastro de <strong>{psicologo.nome}</strong>? Esta ação não pode ser desfeita.</p>
            <div className={styles.modalAcoes}>
              <button className={styles.btnExcluir} onClick={excluir}>Sim, excluir</button>
              <button className={styles.btnCancel} onClick={() => setConfirmDelete(false)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
