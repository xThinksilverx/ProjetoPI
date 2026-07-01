'use client';

import { useState } from 'react';
import styles from '@/styles/components.module.css';

const RAIOS = [
  { value: '5',   label: '5 km' },
  { value: '10',  label: '10 km' },
  { value: '25',  label: '25 km' },
  { value: '50',  label: '50 km' },
  { value: '100', label: '100 km' },
];

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

const DIAS = [
  { value: 'segunda', label: 'Segunda' },
  { value: 'terca',   label: 'Terça' },
  { value: 'quarta',  label: 'Quarta' },
  { value: 'quinta',  label: 'Quinta' },
  { value: 'sexta',   label: 'Sexta' },
  { value: 'sabado',  label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' },
];

const HORARIOS = [
  '07:00','08:00','09:00','10:00','11:00','12:00',
  '13:00','14:00','15:00','16:00','17:00','18:00','19:00','20:00','21:00',
];

const LIMITE_ABORDAGENS = 5;

export default function FiltrosSidebar({ filtros, setFiltros, onFiltrar }) {
  const [mostrarTodasAbordagens, setMostrarTodasAbordagens] = useState(false);
  const [hoverEstrela, setHoverEstrela] = useState(0);
  const [cepInput, setCepInput] = useState('');
  const [cepLoading, setCepLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoErro, setGeoErro] = useState('');

  const set = (campo, valor) => setFiltros(prev => ({ ...prev, [campo]: valor }));

  const toggleAbordagem = (ab) => {
    const novas = filtros.abordagens.includes(ab)
      ? filtros.abordagens.filter(a => a !== ab)
      : [...filtros.abordagens, ab];
    set('abordagens', novas);
  };

  const definirLocalizacao = (lat, lng, label) => {
    setFiltros(prev => ({ ...prev, lat: String(lat), lng: String(lng), localizacaoLabel: label }));
    setGeoErro('');
  };

  const limparLocalizacao = () => {
    setFiltros(prev => ({ ...prev, lat: '', lng: '', localizacaoLabel: '' }));
    setCepInput('');
    setGeoErro('');
  };

  const usarGeolocalizacao = () => {
    if (!navigator.geolocation) {
      setGeoErro('Seu navegador não suporta geolocalização.');
      return;
    }
    setGeoLoading(true);
    setGeoErro('');
    navigator.geolocation.getCurrentPosition(
      async ({ coords: { latitude, longitude } }) => {
        try {
          const res = await fetch(`/api/geocode?lat=${latitude}&lng=${longitude}`);
          const data = await res.json();
          const partes = data.display_name?.split(',') ?? [];
          const label = partes.slice(0, 2).join(',').trim() || 'Sua localização';
          definirLocalizacao(latitude, longitude, label);
        } catch {
          definirLocalizacao(latitude, longitude, 'Sua localização');
        }
        setGeoLoading(false);
      },
      () => {
        setGeoErro('Permissão negada ou localização indisponível.');
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const buscarCep = async () => {
    const cep = cepInput.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setCepLoading(true);
    setGeoErro('');
    try {
      const viaRes = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const viaData = await viaRes.json();
      if (viaData.erro) {
        setGeoErro('CEP não encontrado.');
        setCepLoading(false);
        return;
      }
      const label = `${viaData.localidade}, ${viaData.uf}`;
      const q = `${viaData.logradouro ? viaData.logradouro + ', ' : ''}${viaData.localidade}, ${viaData.uf}, Brasil`;
      const geoRes = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const geoData = await geoRes.json();
      if (geoData.length > 0) {
        definirLocalizacao(geoData[0].lat, geoData[0].lon, label);
      } else {
        setGeoErro('Não foi possível localizar o CEP no mapa.');
      }
    } catch {
      setGeoErro('Erro ao buscar CEP. Tente novamente.');
    } finally {
      setCepLoading(false);
    }
  };

  const formatarCep = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  };

  const contarFiltrosAtivos = () => {
    let n = 0;
    if (filtros.modalidade && filtros.modalidade !== 'todos') n++;
    if (filtros.abordagens.length > 0) n++;
    if (filtros.precoMin) n++;
    if (filtros.precoMax) n++;
    if (filtros.lat && filtros.lng) n++;
    if (filtros.horarioDia || filtros.horarioHora) n++;
    if (filtros.avaliacaoMin) n++;
    return n;
  };

  const limpar = () => {
    const limpos = {
      buscaTexto: filtros.buscaTexto,
      abordagens: [],
      modalidade: 'todos',
      precoMin: '',
      precoMax: '',
      lat: '',
      lng: '',
      raioKm: '25',
      localizacaoLabel: '',
      horarioDia: '',
      horarioHora: '',
      avaliacaoMin: '',
    };
    setFiltros(limpos);
    setCepInput('');
    setGeoErro('');
    onFiltrar(limpos);
  };

  const ativos = contarFiltrosAtivos();
  const abordagensVisiveis = mostrarTodasAbordagens ? ABORDAGENS : ABORDAGENS.slice(0, LIMITE_ABORDAGENS);

  return (
    <aside className={styles.sidebar}>

      <div className={styles.filtrosCabecalho}>
        <div>
          <span className={styles.filtrosTituloPrincipal}>Filtros</span>
          {ativos > 0 && (
            <span className={styles.filtrosBadge}>{ativos}</span>
          )}
        </div>
        {ativos > 0 && (
          <button className={styles.filtrosLimparTudo} onClick={limpar}>
            Limpar tudo
          </button>
        )}
      </div>

      <div className={styles.filtroGrupo}>
        <p className={styles.filtroRotulo}>Modalidade</p>
        <div className={styles.filtroModalidade}>
          {[
            { value: 'todos',      label: 'Todos' },
            { value: 'online',     label: '🌐 Online' },
            { value: 'presencial', label: '📍 Presencial' },
          ].map(op => (
            <button
              key={op.value}
              type="button"
              className={`${styles.filtroModalidadeBtn} ${filtros.modalidade === op.value ? styles.filtroModalidadeBtnAtivo : ''}`}
              onClick={() => set('modalidade', op.value)}
            >
              {op.label}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.filtroGrupo}>
        <p className={styles.filtroRotulo}>
          Abordagem Terapêutica
          {filtros.abordagens.length > 0 && (
            <span className={styles.filtroContador}>{filtros.abordagens.length} selecionada{filtros.abordagens.length > 1 ? 's' : ''}</span>
          )}
        </p>
        <div className={styles.checkboxGroup}>
          {abordagensVisiveis.map(ab => (
            <label key={ab} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={filtros.abordagens.includes(ab)}
                onChange={() => toggleAbordagem(ab)}
              />
              <span>{ab}</span>
            </label>
          ))}
        </div>
        <button
          type="button"
          className={styles.filtrosVerMais}
          onClick={() => setMostrarTodasAbordagens(v => !v)}
        >
          {mostrarTodasAbordagens
            ? '− Ver menos'
            : `+ Ver mais ${ABORDAGENS.length - LIMITE_ABORDAGENS} abordagens`}
        </button>
      </div>

      <div className={styles.filtroGrupo}>
        <p className={styles.filtroRotulo}>Preço por sessão (R$)</p>
        <div className={styles.filtroPrecoInputs}>
          <div className={styles.filtroPrecoItem}>
            <span className={styles.filtroPrecoLabel}>Mín</span>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={filtros.precoMin}
              onChange={e => set('precoMin', e.target.value)}
              className={styles.filtroPrecoInput}
            />
          </div>
          <span className={styles.filtroPrecoSep}>—</span>
          <div className={styles.filtroPrecoItem}>
            <span className={styles.filtroPrecoLabel}>Máx</span>
            <input
              type="number"
              min="0"
              placeholder="500"
              value={filtros.precoMax}
              onChange={e => set('precoMax', e.target.value)}
              className={styles.filtroPrecoInput}
            />
          </div>
        </div>
      </div>

      <div className={styles.filtroGrupo}>
        <p className={styles.filtroRotulo}>
          Localização
          {filtros.lat && filtros.lng && (
            <span className={styles.filtroContador}>ativo</span>
          )}
        </p>

        {filtros.lat && filtros.lng ? (
          <div className={styles.filtroLocAtivo}>
            <div className={styles.filtroLocLabel}>
              <span>📍 {filtros.localizacaoLabel || 'Localização definida'}</span>
              <button
                type="button"
                className={styles.filtroLocClear}
                onClick={limparLocalizacao}
                title="Remover localização"
              >×</button>
            </div>
            <div style={{ marginTop: '0.5rem' }}>
              <span className={styles.filtroPrecoLabel}>Raio de busca</span>
              <select
                value={filtros.raioKm}
                onChange={e => set('raioKm', e.target.value)}
                className={styles.select}
                style={{ marginTop: '0.25rem' }}
              >
                {RAIOS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
        ) : (
          <div className={styles.filtroLocOpcoes}>
            <button
              type="button"
              className={styles.filtroLocGeoBtn}
              onClick={usarGeolocalizacao}
              disabled={geoLoading}
            >
              {geoLoading ? '⏳ Obtendo localização...' : '📍 Usar minha localização'}
            </button>

            <div className={styles.filtroLocOu}>
              <span>ou</span>
            </div>

            <div className={styles.filtroLocCepRow}>
              <input
                type="text"
                placeholder="CEP  00000-000"
                value={cepInput}
                onChange={e => setCepInput(formatarCep(e.target.value))}
                onKeyDown={e => e.key === 'Enter' && buscarCep()}
                className={styles.filtroLocCepInput}
                maxLength={9}
              />
              <button
                type="button"
                className={styles.filtroLocCepBtn}
                onClick={buscarCep}
                disabled={cepLoading || cepInput.replace(/\D/g,'').length !== 8}
              >
                {cepLoading ? '...' : 'Buscar'}
              </button>
            </div>
          </div>
        )}

        {geoErro && <p className={styles.filtroLocErro}>{geoErro}</p>}
      </div>

      <div className={styles.filtroGrupo}>
        <p className={styles.filtroRotulo}>Disponibilidade</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <select
            value={filtros.horarioDia}
            onChange={e => set('horarioDia', e.target.value)}
            className={styles.select}
          >
            <option value="">Qualquer dia</option>
            {DIAS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
          <select
            value={filtros.horarioHora}
            onChange={e => set('horarioHora', e.target.value)}
            className={styles.select}
            disabled={!filtros.horarioDia}
          >
            <option value="">Qualquer horário</option>
            {HORARIOS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.filtroGrupo}>
        <p className={styles.filtroRotulo}>Avaliação mínima</p>
        <div className={styles.filtroEstrelas}>
          {[1, 2, 3, 4, 5].map(i => (
            <button
              key={i}
              type="button"
              className={styles.filtroEstrelaBtn}
              onMouseEnter={() => setHoverEstrela(i)}
              onMouseLeave={() => setHoverEstrela(0)}
              onClick={() => set('avaliacaoMin', filtros.avaliacaoMin === String(i) ? '' : String(i))}
              title={`${i} estrela${i > 1 ? 's' : ''} ou mais`}
            >
              <span className={i <= (hoverEstrela || Number(filtros.avaliacaoMin)) ? styles.estrelaCheia : styles.estrelaVazia}>
                ★
              </span>
            </button>
          ))}
          {filtros.avaliacaoMin && (
            <span className={styles.filtroEstrelaLabel}>
              {filtros.avaliacaoMin}★ ou mais
            </span>
          )}
        </div>
      </div>

      <button className={styles.btnAplicar} onClick={() => onFiltrar()} style={{ width: '100%', padding: '0.65rem' }}>
        Aplicar filtros
        {ativos > 0 && ` (${ativos})`}
      </button>

    </aside>
  );
}
