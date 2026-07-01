'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from '@/styles/components.module.css';

const DESCRICOES_ABORDAGENS = {
  'Terapia Cognitivo-Comportamental (TCC)': 'Identifica e modifica padrões de pensamento negativos para tratar ansiedade, depressão e outros transtornos.',
  'Psicanálise': 'Explora o inconsciente e experiências passadas para compreender conflitos internos e aliviar o sofrimento psíquico.',
  'Psicanálise Lacaniana': 'Releitura de Freud por Lacan, que trabalha a linguagem e o inconsciente como estruturado por ela.',
  'Psicologia Existencial': 'Foca no sentido da vida, liberdade e responsabilidade, ajudando a enfrentar crises e questões existenciais.',
  'Terapia Sistêmica': 'Analisa o indivíduo dentro de seus sistemas relacionais (família, trabalho) buscando equilíbrio nas dinâmicas.',
  'Terapia de Aceitação e Compromisso (ACT)': 'Ensina a aceitar pensamentos difíceis e agir de acordo com os próprios valores, mesmo diante do sofrimento.',
  'Gestalt-terapia': 'Foca na consciência do momento presente e na integração de emoções, pensamentos e comportamentos.',
  'Psicologia Analítica (Jung)': 'Trabalha arquétipos, sonhos e o inconsciente coletivo para promover individuação e autoconhecimento profundo.',
  'Mindfulness': 'Atenção plena ao momento presente — reduz estresse e ansiedade, promovendo equilíbrio emocional.',
  'EMDR': 'Técnica de reprocessamento de memórias traumáticas por movimentos oculares, indicada para o tratamento de TEPT.',
  'Terapia Comportamental Dialética (DBT)': 'Combina TCC com mindfulness para tratar desregulação emocional intensa e comportamentos impulsivos.',
};

const DIAS = ['segunda','terca','quarta','quinta','sexta','sabado','domingo'];
const NOMES_DIAS  = { segunda:'Seg', terca:'Ter', quarta:'Qua', quinta:'Qui', sexta:'Sex', sabado:'Sáb', domingo:'Dom' };
const NOMES_COMPLETOS = { segunda:'segunda-feira', terca:'terça-feira', quarta:'quarta-feira', quinta:'quinta-feira', sexta:'sexta-feira', sabado:'sábado', domingo:'domingo' };
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

export default function PsicologoDetalhe() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [psicologo, setPsicologo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [slotSelecionado, setSlotSelecionado] = useState(null);
  const [minhaAvaliacao, setMinhaAvaliacao] = useState(null);
  const [hoverNota, setHoverNota] = useState(0);
  const [avaliacaoLoading, setAvaliacaoLoading] = useState(false);
  const [avaliacaoMsg, setAvaliacaoMsg] = useState('');

  useEffect(() => {
    fetch(`/api/psicologos/${id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setPsicologo(data.data);
        else router.push('/');
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.tipo === 'paciente') {
      fetch(`/api/psicologos/${id}/avaliar`)
        .then(r => r.json())
        .then(data => { if (data.success) setMinhaAvaliacao(data.data); });
    }
  }, [id, user]);

  const enviarAvaliacao = async (nota) => {
    if (avaliacaoLoading) return;
    setAvaliacaoLoading(true);
    const eraNovaAvaliacao = minhaAvaliacao === null;
    try {
      const res = await fetch(`/api/psicologos/${id}/avaliar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nota })
      });
      const data = await res.json();
      if (data.success) {
        const novaMedia = data.data?.media ?? nota;
        const novoTotal = data.data?.total ?? ((psicologo.totalAvaliacoes || 0) + (eraNovaAvaliacao ? 1 : 0));
        setMinhaAvaliacao(nota);
        setPsicologo(prev => ({ ...prev, avaliacao: novaMedia, totalAvaliacoes: novoTotal }));
        setAvaliacaoMsg(eraNovaAvaliacao ? 'Avaliação enviada!' : 'Avaliação atualizada!');
        setTimeout(() => setAvaliacaoMsg(''), 3000);
      }
    } catch {
    } finally {
      setAvaliacaoLoading(false);
    }
  };

  if (loading) return <><Header /><LoadingSpinner /></>;
  if (!psicologo) return null;

  const temDisponibilidade = psicologo.disponibilidade?.some(d => d.horarios?.length > 0);

  const toggleSlot = (dia, horario) => {
    const livre = isDisponivel(psicologo.disponibilidade, dia, horario)
               && !isBloqueado(psicologo.bloqueados, dia, horario);
    if (!livre) return;
    setSlotSelecionado(prev =>
      prev?.dia === dia && prev?.horario === horario ? null : { dia, horario }
    );
  };

  const perfilUrl = `${process.env.NEXT_PUBLIC_APP_URL}/psicologos/${id}`;

  const abrirWhatsApp = () => {
    if (!slotSelecionado) return;
    const numero = formatarWhatsApp(psicologo.telefone);
    if (!numero) {
      alert('Este psicólogo não cadastrou telefone para contato.');
      return;
    }
    const diaLabel = NOMES_COMPLETOS[slotSelecionado.dia] || slotSelecionado.dia;
    const msg = encodeURIComponent(
      `Olá, ${psicologo.nome}! Vi seu perfil no PsiMatch (${perfilUrl}) e gostaria de agendar uma consulta para ${diaLabel} às ${slotSelecionado.horario}. Aguardo seu retorno!`
    );
    window.open(`https://wa.me/${numero}?text=${msg}`, '_blank');
  };

  const abrirEmail = () => {
    if (!slotSelecionado || !psicologo.emailProfissional) return;
    const diaLabel = NOMES_COMPLETOS[slotSelecionado.dia] || slotSelecionado.dia;
    const assunto = encodeURIComponent('Agendamento via PsiMatch');
    const corpo = encodeURIComponent(
      `Olá, ${psicologo.nome}!\n\nVi seu perfil no PsiMatch e gostaria de agendar uma consulta para ${diaLabel} às ${slotSelecionado.horario}.\n\nPerfil: ${perfilUrl}\n\nAguardo seu retorno!`
    );
    window.location.href = `mailto:${psicologo.emailProfissional}?subject=${assunto}&body=${corpo}`;
  };

  return (
    <>
      <Header />
      <div className="container" style={{ maxWidth: '860px', paddingTop: '2rem', paddingBottom: '3rem' }}>

        <div className={styles.detalheHero}>
          <div className={styles.detalheFotoWrap}>
            <img src={psicologo.foto || '/default-avatar.svg'} alt={psicologo.nome} className={styles.detalheFoto} />
            {psicologo.validado && <span className={styles.detalheValidado}>✓ Perfil Validado</span>}
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
              {psicologo.avaliacao > 0 && <span>⭐ {psicologo.avaliacao}</span>}
            </div>

            {psicologo.formacao && <p className={styles.detalheFormacao}>{psicologo.formacao}</p>}

            <div style={{ marginTop: '1rem' }}>
              {slotSelecionado ? (
                <div>
                  <div className={styles.slotSelecionadoInfo}>
                    Horário selecionado: <strong>{NOMES_DIAS[slotSelecionado.dia]} às {slotSelecionado.horario}</strong>
                    <button onClick={() => setSlotSelecionado(null)} className={styles.btnLimparSlot}>✕</button>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {psicologo.telefone && (
                      <button className={styles.btnWhatsApp} onClick={abrirWhatsApp}>
                        📱 WhatsApp
                      </button>
                    )}
                    {psicologo.emailProfissional && (
                      <button className={styles.btnEmailContato} onClick={abrirEmail}>
                        📧 E-mail
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <p className={styles.instrucaoSlot}>
                  Selecione um horário disponível na grade abaixo para entrar em contato.
                </p>
              )}
            </div>
          </div>
        </div>

        {psicologo.descricao && (
          <div className={styles.detalheSecao}>
            <h2>Sobre</h2>
            <p style={{ lineHeight: 1.7, color: '#334155' }}>{psicologo.descricao}</p>
          </div>
        )}

        {psicologo.abordagens?.length > 0 && (
          <div className={styles.detalheSecao}>
            <h2>Abordagens terapêuticas</h2>
            <div className={styles.abordagens}>
              {psicologo.abordagens.map(ab => (
                <span key={ab} className={styles.abordagemWrap}>
                  <span className={styles.tag}>{ab}</span>
                  {DESCRICOES_ABORDAGENS[ab] && (
                    <span className={styles.abordagemTooltip}>{DESCRICOES_ABORDAGENS[ab]}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

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

        <div className={styles.detalheSecao}>
          <h2>Avaliação</h2>

          <div className={styles.avaliacaoMedia}>
            <span className={styles.avaliacaoNumero}>
              {psicologo.avaliacao > 0 ? psicologo.avaliacao.toFixed(1) : '—'}
            </span>
            <div className={styles.estrelasDisplay}>
              {[1,2,3,4,5].map(i => (
                <span key={i} className={i <= Math.round(psicologo.avaliacao) ? styles.estrelaCheia : styles.estrelaVazia}>★</span>
              ))}
            </div>
            <span className={styles.avaliacaoTotal}>
              {(psicologo.totalAvaliacoes > 0 || minhaAvaliacao)
                ? `${psicologo.totalAvaliacoes || 1} avaliação${(psicologo.totalAvaliacoes || 1) !== 1 ? 'ões' : ''}`
                : 'Sem avaliações ainda'}
            </span>
          </div>

          {user?.tipo === 'paciente' && (
            <div className={styles.avaliarBox}>
              <p className={styles.avaliarLabel}>
                {minhaAvaliacao ? `Sua avaliação: ${minhaAvaliacao} estrela${minhaAvaliacao > 1 ? 's' : ''}` : 'Avalie este profissional:'}
              </p>
              <div className={styles.estrelasInterativas}>
                {[1,2,3,4,5].map(i => (
                  <button
                    key={i}
                    type="button"
                    className={styles.estrelaBtn}
                    onMouseEnter={() => setHoverNota(i)}
                    onMouseLeave={() => setHoverNota(0)}
                    onClick={() => enviarAvaliacao(i)}
                    disabled={avaliacaoLoading}
                    title={`${i} estrela${i > 1 ? 's' : ''}`}
                  >
                    <span className={i <= (hoverNota || minhaAvaliacao || 0) ? styles.estrelaCheia : styles.estrelaVazia}>
                      ★
                    </span>
                  </button>
                ))}
              </div>
              {avaliacaoMsg && <p className={styles.avaliacaoSucesso}>{avaliacaoMsg}</p>}
            </div>
          )}

          {!user && (
            <p className={styles.avaliacaoLogin}>
              <a href="/login" style={{ color: '#2a5298', fontWeight: 600 }}>Faça login</a> como paciente para avaliar este profissional.
            </p>
          )}

          <p className={styles.cfpNotice}>
            Avaliações por estrelas apenas, sem comentários, em conformidade com o Código de Ética do CFP.
          </p>
        </div>

        {temDisponibilidade && (
          <div className={styles.detalheSecao}>
            <h2>Horários disponíveis</h2>
            <div className={styles.gradeLegenda}>
              <span><span className={styles.legendaAzul} /> Disponível (clique para selecionar)</span>
              <span><span className={styles.legendaVermelho} /> Indisponível</span>
            </div>
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
                          if (!disponivel) return <td key={d} className={styles.gradeCell}><div className={styles.gradeVazio} /></td>;
                          const bloqueado = isBloqueado(psicologo.bloqueados, d, h);
                          const selecionado = slotSelecionado?.dia === d && slotSelecionado?.horario === h;
                          return (
                            <td key={d} className={styles.gradeCell}>
                              <button
                                type="button"
                                onClick={() => toggleSlot(d, h)}
                                className={
                                  bloqueado ? styles.gradeBloqueado
                                  : selecionado ? styles.gradeSelecionadoAtivo
                                  : styles.gradeSelecionado
                                }
                                title={bloqueado ? 'Horário indisponível' : `${NOMES_DIAS[d]} às ${h}`}
                                disabled={bloqueado}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <button onClick={() => router.back()}
          style={{ marginTop: '1rem', background: 'none', border: '1px solid #cbd5e1', padding: '0.5rem 1.25rem', borderRadius: '8px', cursor: 'pointer', color: '#475569' }}>
          ← Voltar
        </button>
      </div>
    </>
  );
}
