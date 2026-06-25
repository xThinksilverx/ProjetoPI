'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from '@/styles/components.module.css';

const ABORDAGENS = [
  'Terapia Cognitivo-Comportamental (TCC)',
  'Psicanálise',
  'Psicanálise Lacaniana',
  'Psicologia Existencial',
  'Terapia Sistêmica',
  'Terapia Comportamental Dialética (DBT)',
  'Terapia de Aceitação e Compromisso (ACT)',
  'Gestalt-terapia',
  'Psicologia Analítica (Jung)',
  'Mindfulness',
  'EMDR',
  'Neuropsicologia',
];

const DIAS = ['segunda','terca','quarta','quinta','sexta','sabado','domingo'];
const NOMES_DIAS = { segunda:'Seg', terca:'Ter', quarta:'Qua', quinta:'Qui', sexta:'Sex', sabado:'Sáb', domingo:'Dom' };
const HORARIOS = ['07:00','08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00'];

export default function FormCadastroPsicologo({ user }) {
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    crp: '',
    foto: '',
    fotoPreview: '',
    telefone: '',
    emailProfissional: '',
    formacao: '',
    especializacoes: '',
    descricao: '',
    abordagens: [],
    modalidades: [],   // array: ['online'], ['presencial'] ou ['online','presencial']
    preco: '',
    cidade: '',
    estado: '',
    endereco: '',
    disponibilidade: [],
  });

  const set = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleChange = (e) => set(e.target.name, e.target.value);

  // Upload de foto
  const handleFoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
      setErrors(prev => ({ ...prev, foto: 'Use JPEG, PNG ou WebP.' }));
      return;
    }
    if (file.size > 1.5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, foto: 'Imagem muito grande. Máximo 1,5 MB.' }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, foto: reader.result, fotoPreview: reader.result }));
      setErrors(prev => ({ ...prev, foto: '' }));
    };
    reader.readAsDataURL(file);
  };

  // Modalidade — checkboxes
  const toggleModalidade = (mod) => {
    setForm(prev => ({
      ...prev,
      modalidades: prev.modalidades.includes(mod)
        ? prev.modalidades.filter(m => m !== mod)
        : [...prev.modalidades, mod]
    }));
    setErrors(prev => ({ ...prev, modalidades: '' }));
  };

  // Abordagens
  const toggleAbordagem = (ab) => {
    setForm(prev => ({
      ...prev,
      abordagens: prev.abordagens.includes(ab)
        ? prev.abordagens.filter(a => a !== ab)
        : [...prev.abordagens, ab]
    }));
    setErrors(prev => ({ ...prev, abordagens: '' }));
  };

  // Grade de disponibilidade
  const isSlotSelecionado = (dia, horario) => {
    const d = form.disponibilidade.find(d => d.dia === dia);
    return d ? d.horarios.includes(horario) : false;
  };

  const toggleSlot = (dia, horario) => {
    setForm(prev => {
      const lista = prev.disponibilidade.map(d => ({ ...d, horarios: [...d.horarios] }));
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
      return { ...prev, disponibilidade: lista.filter(d => d.horarios.length > 0) };
    });
  };

  const validar = () => {
    const e = {};
    if (!form.crp.trim()) e.crp = 'CRP é obrigatório';
    else if (!/^\d{2}\/\d{5}$/.test(form.crp)) e.crp = 'Formato inválido: NN/XXXXX (ex: 04/51234)';
    if (!form.foto) e.foto = 'Foto é obrigatória';
    if (!form.formacao.trim()) e.formacao = 'Formação é obrigatória';
    if (!form.descricao.trim()) e.descricao = 'Descrição é obrigatória';
    if (form.abordagens.length === 0) e.abordagens = 'Selecione ao menos uma abordagem';
    if (form.modalidades.length === 0) e.modalidades = 'Selecione ao menos uma modalidade';
    if (!form.preco || Number(form.preco) <= 0) e.preco = 'Informe o valor da sessão';
    if (!form.cidade.trim()) e.cidade = 'Cidade é obrigatória';
    if (!form.estado.trim()) e.estado = 'Estado é obrigatório';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;

    // Converte ['online','presencial'] → 'ambos', ou só o valor único
    const modalidade =
      form.modalidades.length === 2 ? 'ambos' : form.modalidades[0];

    setLoading(true);
    try {
      const res = await fetch('/api/psicologos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: user.nome,
          email: user.email,
          crp: form.crp,
          foto: form.foto,
          telefone: form.telefone,
          emailProfissional: form.emailProfissional || undefined,
          formacao: form.formacao,
          descricao: form.descricao,
          especializacoes: form.especializacoes.split(',').map(s => s.trim()).filter(Boolean),
          abordagens: form.abordagens,
          modalidade,
          preco: Number(form.preco),
          localizacao: {
            cidade: form.cidade,
            estado: form.estado.toUpperCase(),
            endereco: modalidade === 'online' ? 'Atendimento online' : form.endereco,
          },
          disponibilidade: form.disponibilidade,
        })
      });
      const data = await res.json();
      if (data.success) setEnviado(true);
      else setErrors({ submit: data.error });
    } catch {
      setErrors({ submit: 'Erro ao enviar. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className={styles.formContainer} style={{ textAlign: 'center', padding: '3rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
        <h2 style={{ color: '#166534', marginBottom: '0.75rem' }}>Cadastro enviado!</h2>
        <p style={{ color: '#475569', marginBottom: '0.5rem' }}>
          Seu perfil está aguardando validação pelo administrador.
        </p>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '2rem' }}>
          Após a aprovação, seu perfil aparecerá no catálogo da plataforma.
        </p>
        <Link href="/" style={{ textDecoration: 'none', background: '#2a5298', color: 'white', padding: '0.75rem 2rem', borderRadius: '40px', fontWeight: 'bold' }}>
          Voltar para o início
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.formContainer}>
      {errors.submit && <div className={styles.errorBox}>{errors.submit}</div>}

      <form onSubmit={handleSubmit} className={styles.cadastroForm}>

        {/* CRP */}
        <div className={styles.formGroup}>
          <label>CRP válido * (formato NN/XXXXX)</label>
          <input type="text" name="crp" value={form.crp} onChange={handleChange} placeholder="Ex: 04/51234" />
          {errors.crp && <span className={styles.error}>{errors.crp}</span>}
        </div>

        {/* Foto */}
        <div className={styles.formGroup}>
          <label>Foto profissional * (JPEG ou PNG, máx. 1,5 MB)</label>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFoto} />
          {errors.foto && <span className={styles.error}>{errors.foto}</span>}
          {form.fotoPreview && (
            <img src={form.fotoPreview} alt="Preview"
              style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover', marginTop: '0.75rem', border: '3px solid #e2e8f0' }} />
          )}
        </div>

        {/* Telefone e e-mail profissional */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Telefone / WhatsApp de contato</label>
            <input type="tel" name="telefone" value={form.telefone} onChange={handleChange} placeholder="(XX) XXXXX-XXXX" />
          </div>
          <div className={styles.formGroup}>
            <label>E-mail profissional de contato</label>
            <input type="email" name="emailProfissional" value={form.emailProfissional} onChange={handleChange} placeholder="contato@seusite.com" />
          </div>
        </div>

        {/* Formação */}
        <div className={styles.formGroup}>
          <label>Formação acadêmica *</label>
          <input type="text" name="formacao" value={form.formacao} onChange={handleChange} placeholder="Ex: Psicologia — USP (2018)" />
          {errors.formacao && <span className={styles.error}>{errors.formacao}</span>}
        </div>

        {/* Especializações */}
        <div className={styles.formGroup}>
          <label>Especializações / áreas de atuação</label>
          <input type="text" name="especializacoes" value={form.especializacoes} onChange={handleChange}
            placeholder="Ex: Ansiedade, Depressão, TDAH (separadas por vírgula)" />
        </div>

        {/* Abordagens */}
        <div className={styles.formGroup}>
          <label>Abordagem terapêutica *</label>
          <div className={styles.checkboxGrid}>
            {ABORDAGENS.map(ab => (
              <label key={ab} className={styles.checkboxLabel}>
                <input type="checkbox" checked={form.abordagens.includes(ab)} onChange={() => toggleAbordagem(ab)} />
                {ab}
              </label>
            ))}
          </div>
          {errors.abordagens && <span className={styles.error}>{errors.abordagens}</span>}
        </div>

        {/* Modalidade — checkboxes */}
        <div className={styles.formGroup}>
          <label>Modalidade de atendimento *</label>
          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.25rem' }}>
            {['online', 'presencial'].map(mod => (
              <label key={mod} className={styles.checkboxLabel} style={{ fontSize: '1rem' }}>
                <input type="checkbox" checked={form.modalidades.includes(mod)} onChange={() => toggleModalidade(mod)} />
                {mod.charAt(0).toUpperCase() + mod.slice(1)}
              </label>
            ))}
          </div>
          {errors.modalidades && <span className={styles.error}>{errors.modalidades}</span>}
        </div>

        {/* Localização */}
        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Cidade *</label>
            <input type="text" name="cidade" value={form.cidade} onChange={handleChange} placeholder="São Paulo" />
            {errors.cidade && <span className={styles.error}>{errors.cidade}</span>}
          </div>
          <div className={styles.formGroup}>
            <label>Estado (UF) *</label>
            <input type="text" name="estado" value={form.estado} onChange={handleChange} placeholder="SP" maxLength={2} />
            {errors.estado && <span className={styles.error}>{errors.estado}</span>}
          </div>
        </div>

        {form.modalidades.includes('presencial') && (
          <div className={styles.formGroup}>
            <label>Endereço do consultório</label>
            <input type="text" name="endereco" value={form.endereco} onChange={handleChange} placeholder="Rua, número, bairro" />
          </div>
        )}

        {/* Preço */}
        <div className={styles.formGroup}>
          <label>Valor por sessão (R$) *</label>
          <input type="number" name="preco" value={form.preco} onChange={handleChange} min="1" step="1" placeholder="150" />
          {errors.preco && <span className={styles.error}>{errors.preco}</span>}
        </div>

        {/* Grade de disponibilidade */}
        <div className={styles.formGroup}>
          <label>Disponibilidade de horários</label>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Clique nas células para marcar / desmarcar seus horários disponíveis.
          </p>
          <div style={{ overflowX: 'auto' }}>
            <table className={styles.gradeTable}>
              <thead>
                <tr>
                  <th className={styles.gradeHora}></th>
                  {DIAS.map(d => (
                    <th key={d} className={styles.gradeDia}>{NOMES_DIAS[d]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HORARIOS.map(h => (
                  <tr key={h}>
                    <td className={styles.gradeHora}>{h}</td>
                    {DIAS.map(d => (
                      <td key={d} className={styles.gradeCell}>
                        <button
                          type="button"
                          onClick={() => toggleSlot(d, h)}
                          className={isSlotSelecionado(d, h) ? styles.gradeSelecionado : styles.gradeVazio}
                          title={`${NOMES_DIAS[d]} ${h}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Descrição */}
        <div className={styles.formGroup}>
          <label>Descrição profissional *</label>
          <textarea name="descricao" rows={4} value={form.descricao} onChange={handleChange}
            placeholder="Fale sobre sua experiência, abordagem e como você pode ajudar seus pacientes..." />
          {errors.descricao && <span className={styles.error}>{errors.descricao}</span>}
        </div>

        {/* Termos */}
        <div className={styles.formGroup}>
          <label className={styles.termos}>
            <input type="checkbox" required />
            <span>
              Declaro que as informações são verdadeiras, possuo CRP ativo e estou de acordo com o{' '}
              <a
                href="https://site.cfp.org.br/wp-content/uploads/2012/07/codigo-de-etica-psicologia.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.linkCfp}
              >
                Código de Ética do CFP
              </a>
              .
            </span>
          </label>
        </div>

        <button type="submit" className={styles.btnSubmit} disabled={loading}>
          {loading ? 'Enviando...' : 'Enviar para validação'}
        </button>
      </form>
    </div>
  );
}
