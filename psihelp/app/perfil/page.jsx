'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from '@/styles/components.module.css';

const ABORDAGENS_COMUNS = [
  'Terapia Cognitivo-Comportamental (TCC)', 'Psicanálise', 'Psicanálise Lacaniana',
  'Psicologia Existencial', 'Terapia Sistêmica', 'Terapia Comportamental Dialética (DBT)',
  'Terapia de Aceitação e Compromisso (ACT)', 'Gestalt-terapia',
  'Psicologia Analítica (Jung)', 'Mindfulness', 'EMDR', 'Neuropsicologia',
];

const DIAS = ['segunda','terca','quarta','quinta','sexta','sabado','domingo'];
const NOMES_DIAS = { segunda:'Seg', terca:'Ter', quarta:'Qua', quinta:'Qui', sexta:'Sex', sabado:'Sáb', domingo:'Dom' };
const HORARIOS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

function isDisponivel(disponibilidade, dia, horario) {
  return disponibilidade?.find(d => d.dia === dia)?.horarios?.includes(horario) ?? false;
}

function isBloqueado(bloqueados, dia, horario) {
  return bloqueados?.find(d => d.dia === dia)?.horarios?.includes(horario) ?? false;
}

export default function PerfilPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout, updateUser } = useAuth();

  const [editandoPessoal, setEditandoPessoal] = useState(false);
  const [editandoProfissional, setEditandoProfissional] = useState(false);
  const [loadingPsi, setLoadingPsi] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [salvandoBloqueios, setSalvandoBloqueios] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [modalExcluir, setModalExcluir] = useState(false);
  const [confirmacaoTexto, setConfirmacaoTexto] = useState('');
  const [excluindo, setExcluindo] = useState(false);

  const [dadosPessoais, setDadosPessoais] = useState({
    nome: '', telefone: '', dataNascimento: '', genero: ''
  });
  const [dadosProfissionais, setDadosProfissionais] = useState({
    descricao: '', preco: '', modalidade: 'online',
    abordagens: [], formacao: '', telefone: '',
    localizacao: { cidade: '', estado: '', endereco: '' },
    disponibilidade: [],
    bloqueados: [],
  });

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
    if (user) {
      setDadosPessoais({
        nome: user.nome || '',
        telefone: user.telefone || '',
        dataNascimento: user.dataNascimento ? user.dataNascimento.split('T')[0] : '',
        genero: user.genero || ''
      });
      if (user.tipo === 'psicologo') carregarPerfilProfissional();
    }
  }, [user, authLoading]);

  const carregarPerfilProfissional = async () => {
    setLoadingPsi(true);
    try {
      const res = await fetch('/api/psicologos/meu-perfil');
      const data = await res.json();
      if (data.success) {
        const p = data.data;
        setDadosProfissionais({
          descricao: p.descricao || '',
          preco: p.preco || '',
          modalidade: p.modalidade || 'online',
          abordagens: p.abordagens || [],
          formacao: p.formacao || '',
          telefone: p.telefone || '',
          localizacao: { cidade: p.localizacao?.cidade || '', estado: p.localizacao?.estado || '', endereco: p.localizacao?.endereco || '' },
          disponibilidade: p.disponibilidade || [],
          bloqueados: p.bloqueados || [],
        });
      }
    } catch (err) { console.error(err); }
    finally { setLoadingPsi(false); }
  };

  const salvarPessoal = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await fetch('/api/auth/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosPessoais)
      });
      const data = await res.json();
      if (data.success) { updateUser(data.data); setEditandoPessoal(false); mostrarFeedback('Dados pessoais atualizados!'); }
    } catch (err) { console.error(err); }
    finally { setSalvando(false); }
  };

  const salvarProfissional = async (e) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const res = await fetch('/api/psicologos/meu-perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dadosProfissionais)
      });
      const data = await res.json();
      if (data.success) { setEditandoProfissional(false); mostrarFeedback('Perfil profissional atualizado!'); }
    } catch (err) { console.error(err); }
    finally { setSalvando(false); }
  };

  const salvarBloqueios = async () => {
    setSalvandoBloqueios(true);
    try {
      const res = await fetch('/api/psicologos/meu-perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bloqueados: dadosProfissionais.bloqueados })
      });
      const data = await res.json();
      if (data.success) mostrarFeedback('Horários atualizados!');
    } catch (err) { console.error(err); }
    finally { setSalvandoBloqueios(false); }
  };

  const toggleBloqueio = (dia, horario) => {
    setDadosProfissionais(prev => {
      const lista = (prev.bloqueados || []).map(d => ({ ...d, horarios: [...d.horarios] }));
      const existente = lista.find(d => d.dia === dia);
      if (existente) {
        if (existente.horarios.includes(horario)) {
          existente.horarios = existente.horarios.filter(h => h !== horario);
        } else {
          existente.horarios.push(horario);
        }
      } else {
        lista.push({ dia, horarios: [horario] });
      }
      return { ...prev, bloqueados: lista.filter(d => d.horarios.length > 0) };
    });
  };

  const mostrarFeedback = (msg) => { setFeedback(msg); setTimeout(() => setFeedback(''), 3000); };

  const excluirConta = async () => {
    setExcluindo(true);
    try {
      const res = await fetch('/api/auth/perfil', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        router.push('/?conta=excluida');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setExcluindo(false);
    }
  };

  const toggleAbordagem = (a) => setDadosProfissionais(prev => ({
    ...prev, abordagens: prev.abordagens.includes(a) ? prev.abordagens.filter(x => x !== a) : [...prev.abordagens, a]
  }));

  if (authLoading) return <><Header /><LoadingSpinner /></>;
  if (!user) return null;

  const temDisponibilidade = dadosProfissionais.disponibilidade?.some(d => d.horarios?.length > 0);

  return (
    <>
      <Header />
      <div className={styles.perfilContainer} style={{ maxWidth: '680px' }}>
        {feedback && <div className={styles.successMsg}>{feedback}</div>}

        <div className={styles.perfilCard} style={{ marginBottom: '1.5rem' }}>
          <div className={styles.perfilHeader}>
            <h2>Dados Pessoais</h2>
            {!editandoPessoal && <button className={styles.btnEdit} onClick={() => setEditandoPessoal(true)}>Editar</button>}
          </div>

          {!editandoPessoal ? (
            <div className={styles.perfilInfo}>
              <div className={styles.infoRow}><strong>Nome:</strong><span>{user.nome}</span></div>
              <div className={styles.infoRow}><strong>Email:</strong><span>{user.email}</span></div>
              <div className={styles.infoRow}><strong>Tipo:</strong>
                <span>{user.tipo === 'psicologo' ? 'Psicólogo(a)' : user.tipo === 'admin' ? 'Administrador' : 'Paciente'}</span>
              </div>
              {user.telefone && <div className={styles.infoRow}><strong>Telefone:</strong><span>{user.telefone}</span></div>}
              <button className={styles.btnLogout} onClick={logout}>Sair da conta</button>
            </div>
          ) : (
            <form onSubmit={salvarPessoal} className={styles.perfilForm}>
              <div className={styles.formGroup}>
                <label>Nome</label>
                <input type="text" value={dadosPessoais.nome} onChange={e => setDadosPessoais(p => ({ ...p, nome: e.target.value }))} required />
              </div>
              <div className={styles.formGroup}>
                <label>Telefone</label>
                <input type="tel" value={dadosPessoais.telefone} onChange={e => setDadosPessoais(p => ({ ...p, telefone: e.target.value }))} placeholder="(XX) XXXXX-XXXX" />
              </div>
              <div className={styles.formGroup}>
                <label>Data de Nascimento</label>
                <input type="date" value={dadosPessoais.dataNascimento} onChange={e => setDadosPessoais(p => ({ ...p, dataNascimento: e.target.value }))} />
              </div>
              <div className={styles.formGroup}>
                <label>Gênero</label>
                <select value={dadosPessoais.genero} onChange={e => setDadosPessoais(p => ({ ...p, genero: e.target.value }))}>
                  <option value="">Selecione</option>
                  <option value="feminino">Feminino</option>
                  <option value="masculino">Masculino</option>
                  <option value="outro">Outro</option>
                  <option value="prefiro_nao_dizer">Prefiro não dizer</option>
                </select>
              </div>
              <div className={styles.formActions}>
                <button type="submit" className={styles.btnSave} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
                <button type="button" className={styles.btnCancel} onClick={() => setEditandoPessoal(false)}>Cancelar</button>
              </div>
            </form>
          )}
        </div>

        {user.tipo === 'psicologo' && (
          <>
            <div className={styles.perfilCard} style={{ marginBottom: '1.5rem' }}>
              <div className={styles.perfilHeader}>
                <h2>Perfil Profissional</h2>
                {!editandoProfissional && !loadingPsi && (
                  <button className={styles.btnEdit} onClick={() => setEditandoProfissional(true)}>Editar</button>
                )}
              </div>

              {loadingPsi ? <LoadingSpinner /> : !editandoProfissional ? (
                <div className={styles.perfilInfo}>
                  <div className={styles.infoRow}><strong>Modalidade:</strong>
                    <span>{dadosProfissionais.modalidade === 'online' ? 'Online' : dadosProfissionais.modalidade === 'presencial' ? 'Presencial' : 'Online e Presencial'}</span>
                  </div>
                  <div className={styles.infoRow}><strong>Preço/sessão:</strong>
                    <span>{dadosProfissionais.preco ? `R$ ${Number(dadosProfissionais.preco).toFixed(2)}` : '—'}</span>
                  </div>
                  {dadosProfissionais.formacao && <div className={styles.infoRow}><strong>Formação:</strong><span>{dadosProfissionais.formacao}</span></div>}
                  {dadosProfissionais.localizacao.cidade && (
                    <div className={styles.infoRow}><strong>Localização:</strong>
                      <span>{dadosProfissionais.localizacao.cidade} — {dadosProfissionais.localizacao.estado}</span>
                    </div>
                  )}
                  {dadosProfissionais.descricao && (
                    <div className={styles.infoRow} style={{ flexDirection: 'column', gap: '0.25rem' }}>
                      <strong>Descrição:</strong><span>{dadosProfissionais.descricao}</span>
                    </div>
                  )}
                  {dadosProfissionais.abordagens.length > 0 && (
                    <div className={styles.infoRow} style={{ flexDirection: 'column', gap: '0.5rem' }}>
                      <strong>Abordagens:</strong>
                      <div className={styles.abordagens}>
                        {dadosProfissionais.abordagens.map(a => <span key={a} className={styles.tag}>{a}</span>)}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <form onSubmit={salvarProfissional} className={styles.perfilForm}>
                  <div className={styles.formGroup}>
                    <label>Modalidade</label>
                    <select value={dadosProfissionais.modalidade} onChange={e => setDadosProfissionais(p => ({ ...p, modalidade: e.target.value }))}>
                      <option value="online">Online</option>
                      <option value="presencial">Presencial</option>
                      <option value="ambos">Online e Presencial</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Preço por sessão (R$)</label>
                    <input type="number" min="1" step="1" value={dadosProfissionais.preco}
                      onChange={e => setDadosProfissionais(p => ({ ...p, preco: e.target.value }))} required />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Formação</label>
                    <input type="text" value={dadosProfissionais.formacao}
                      onChange={e => setDadosProfissionais(p => ({ ...p, formacao: e.target.value }))} placeholder="Ex: Psicologia - USP" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Descrição / Apresentação</label>
                    <textarea rows={4} value={dadosProfissionais.descricao}
                      onChange={e => setDadosProfissionais(p => ({ ...p, descricao: e.target.value }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Cidade</label>
                    <input type="text" value={dadosProfissionais.localizacao.cidade}
                      onChange={e => setDadosProfissionais(p => ({ ...p, localizacao: { ...p.localizacao, cidade: e.target.value } }))} />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Estado (sigla)</label>
                    <input type="text" maxLength={2} value={dadosProfissionais.localizacao.estado}
                      onChange={e => setDadosProfissionais(p => ({ ...p, localizacao: { ...p.localizacao, estado: e.target.value.toUpperCase() } }))} placeholder="SP" />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Abordagens</label>
                    <div className={styles.checkboxGrid}>
                      {ABORDAGENS_COMUNS.map(a => (
                        <label key={a} className={styles.checkboxLabel}>
                          <input type="checkbox" checked={dadosProfissionais.abordagens.includes(a)} onChange={() => toggleAbordagem(a)} />
                          {a}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.btnSave} disabled={salvando}>{salvando ? 'Salvando...' : 'Salvar'}</button>
                    <button type="button" className={styles.btnCancel} onClick={() => setEditandoProfissional(false)}>Cancelar</button>
                  </div>
                </form>
              )}
            </div>

            {!loadingPsi && temDisponibilidade && (
              <div className={styles.perfilCard}>
                <div className={styles.perfilHeader}>
                  <h2>Gerenciar Disponibilidade</h2>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                  Clique em um horário para marcá-lo como <strong>indisponível</strong> (já ocupado). Clique novamente para liberar.
                </p>
                <div className={styles.gradeLegenda}>
                  <span><span className={styles.legendaAzul} /> Disponível para pacientes</span>
                  <span><span className={styles.legendaVermelho} /> Horário bloqueado</span>
                </div>
                <div style={{ overflowX: 'auto', marginTop: '0.75rem' }}>
                  <table className={styles.gradeTable}>
                    <thead>
                      <tr>
                        <th className={styles.gradeHora}></th>
                        {DIAS.map(d => <th key={d} className={styles.gradeDia}>{NOMES_DIAS[d]}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {HORARIOS.map(h => {
                        const temAlgum = DIAS.some(d => isDisponivel(dadosProfissionais.disponibilidade, d, h));
                        if (!temAlgum) return null;
                        return (
                          <tr key={h}>
                            <td className={styles.gradeHora}>{h}</td>
                            {DIAS.map(d => {
                              const disponivel = isDisponivel(dadosProfissionais.disponibilidade, d, h);
                              if (!disponivel) return <td key={d} className={styles.gradeCell}><div className={styles.gradeVazio} /></td>;
                              const bloqueado = isBloqueado(dadosProfissionais.bloqueados, d, h);
                              return (
                                <td key={d} className={styles.gradeCell}>
                                  <button
                                    type="button"
                                    onClick={() => toggleBloqueio(d, h)}
                                    className={bloqueado ? styles.gradeBloqueado : styles.gradeSelecionado}
                                    title={bloqueado ? 'Clique para liberar' : 'Clique para bloquear'}
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
                <button
                  onClick={salvarBloqueios}
                  className={styles.btnSave}
                  disabled={salvandoBloqueios}
                  style={{ marginTop: '1rem' }}
                >
                  {salvandoBloqueios ? 'Salvando...' : 'Salvar horários'}
                </button>
              </div>
            )}
          </>
        )}
        <div className={styles.perfilCard} style={{ marginTop: '1.5rem', borderColor: '#fca5a5' }}>
          <div className={styles.perfilHeader}>
            <h2 style={{ color: '#dc2626' }}>Zona de Perigo</h2>
          </div>
          <p style={{ fontSize: '0.9rem', color: '#555', marginBottom: '1rem', lineHeight: 1.6 }}>
            A exclusão da conta remove permanentemente todos os seus dados da plataforma,
            em conformidade com a <strong>LGPD</strong>. Esta ação não pode ser desfeita.
          </p>
          <button
            onClick={() => setModalExcluir(true)}
            style={{
              background: 'transparent', color: '#dc2626',
              border: '1.5px solid #dc2626', borderRadius: 6,
              padding: '8px 18px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem'
            }}
          >
            Excluir minha conta
          </button>
        </div>

        {modalExcluir && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem'
          }}>
            <div style={{
              background: '#fff', borderRadius: 10, padding: '2rem',
              maxWidth: 440, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
            }}>
              <h3 style={{ color: '#dc2626', marginBottom: '0.75rem' }}>Excluir conta permanentemente</h3>
              <p style={{ fontSize: '0.9rem', color: '#444', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Todos os seus dados serão removidos e não poderão ser recuperados.
                Para confirmar, digite <strong>EXCLUIR</strong> abaixo:
              </p>
              <input
                type="text"
                value={confirmacaoTexto}
                onChange={e => setConfirmacaoTexto(e.target.value)}
                placeholder="Digite EXCLUIR"
                style={{
                  width: '100%', padding: '10px 12px', border: '1.5px solid #d1d5db',
                  borderRadius: 6, fontSize: '0.95rem', marginBottom: '1.25rem', boxSizing: 'border-box'
                }}
              />
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => { setModalExcluir(false); setConfirmacaoTexto(''); }}
                  style={{
                    padding: '8px 18px', borderRadius: 6, border: '1px solid #d1d5db',
                    background: '#fff', cursor: 'pointer', fontSize: '0.9rem'
                  }}
                >
                  Cancelar
                </button>
                <button
                  onClick={excluirConta}
                  disabled={confirmacaoTexto !== 'EXCLUIR' || excluindo}
                  style={{
                    padding: '8px 18px', borderRadius: 6, border: 'none',
                    background: confirmacaoTexto === 'EXCLUIR' ? '#dc2626' : '#fca5a5',
                    color: '#fff', cursor: confirmacaoTexto === 'EXCLUIR' ? 'pointer' : 'not-allowed',
                    fontWeight: 600, fontSize: '0.9rem'
                  }}
                >
                  {excluindo ? 'Excluindo...' : 'Confirmar exclusão'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
