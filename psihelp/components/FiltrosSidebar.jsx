'use client';

import { useState, useEffect } from 'react';
import styles from '@/styles/components.module.css';

const abordagensDisponiveis = [
  "Terapia Cognitivo-Comportamental",
  "Psicanálise Lacaniana",
  "Psicologia Existencial",
  "Terapia Sistêmica",
  "Terapia Comportamental Dialética",
  "Mindfulness",
  "Terapia de Aceitação e Compromisso"
];

const diasSemana = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
const horariosPadrao = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

export default function FiltrosSidebar({ filtros, setFiltros, onFiltrar }) {
  const [localExpandido, setLocalExpandido] = useState(false);
  const [precoExpandido, setPrecoExpandido] = useState(false);
  const [horarioExpandido, setHorarioExpandido] = useState(false);
  const [abordagemExpandido, setAbordagemExpandido] = useState(false);

  const handleChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  const handleAbordagemToggle = (abordagem) => {
    const novas = filtros.abordagens.includes(abordagem)
      ? filtros.abordagens.filter(a => a !== abordagem)
      : [...filtros.abordagens, abordagem];
    setFiltros(prev => ({ ...prev, abordagens: novas }));
  };

  const aplicarFiltros = () => {
    onFiltrar();
  };

  const limparFiltros = () => {
    setFiltros({
      buscaTexto: '',
      abordagens: [],
      modalidade: 'todos',
      precoMin: '',
      precoMax: '',
      cidade: '',
      estado: '',
      horarioDia: '',
      horarioHora: ''
    });
    onFiltrar();
  };

  return (
    <aside className={styles.sidebar}>
      <h3>Filtros</h3>
      
      <div className={styles.filtroGrupo}>
        <label>Modalidade</label>
        <select 
          value={filtros.modalidade}
          onChange={(e) => handleChange('modalidade', e.target.value)}
          className={styles.select}
        >
          <option value="todos">Todos</option>
          <option value="online">Online</option>
          <option value="presencial">Presencial</option>
        </select>
      </div>

      <div className={styles.filtroGrupo}>
        <div className={styles.filtroHeader} onClick={() => setPrecoExpandido(!precoExpandido)}>
          <label>💰 Faixa de Preço</label>
          <span>{precoExpandido ? '−' : '+'}</span>
        </div>
        {precoExpandido && (
          <div className={styles.filtroBody}>
            <div className={styles.rangeContainer}>
              <span>R$ {filtros.precoMin || 0}</span>
              <input 
                type="range"
                min="0"
                max="500"
                step="10"
                value={filtros.precoMin || 0}
                onChange={(e) => handleChange('precoMin', Number(e.target.value))}
              />
            </div>
            <div className={styles.rangeContainer}>
              <span>R$ {filtros.precoMax || 500}</span>
              <input 
                type="range"
                min="0"
                max="500"
                step="10"
                value={filtros.precoMax || 500}
                onChange={(e) => handleChange('precoMax', Number(e.target.value))}
              />
            </div>
          </div>
        )}
      </div>

      <div className={styles.filtroGrupo}>
        <div className={styles.filtroHeader} onClick={() => setLocalExpandido(!localExpandido)}>
          <label>📍 Localização</label>
          <span>{localExpandido ? '−' : '+'}</span>
        </div>
        {localExpandido && (
          <>
            <input 
              type="text"
              placeholder="Cidade"
              value={filtros.cidade}
              onChange={(e) => handleChange('cidade', e.target.value)}
              className={styles.input}
            />
            <input 
              type="text"
              placeholder="Estado (UF)"
              value={filtros.estado}
              onChange={(e) => handleChange('estado', e.target.value.toUpperCase())}
              className={styles.input}
              maxLength="2"
            />
          </>
        )}
      </div>

      <div className={styles.filtroGrupo}>
        <div className={styles.filtroHeader} onClick={() => setHorarioExpandido(!horarioExpandido)}>
          <label>⏰ Horários</label>
          <span>{horarioExpandido ? '−' : '+'}</span>
        </div>
        {horarioExpandido && (
          <div className={styles.horariosFiltro}>
            <select 
              value={filtros.horarioDia}
              onChange={(e) => handleChange('horarioDia', e.target.value)}
              className={styles.select}
            >
              <option value="">Dia da semana</option>
              {diasSemana.map(dia => (
                <option key={dia} value={dia}>{dia.charAt(0).toUpperCase() + dia.slice(1)}</option>
              ))}
            </select>
            <select 
              value={filtros.horarioHora}
              onChange={(e) => handleChange('horarioHora', e.target.value)}
              className={styles.select}
              disabled={!filtros.horarioDia}
            >
              <option value="">Horário</option>
              {horariosPadrao.map(hora => (
                <option key={hora} value={hora}>{hora}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className={styles.filtroGrupo}>
        <div className={styles.filtroHeader} onClick={() => setAbordagemExpandido(!abordagemExpandido)}>
          <label>🧠 Abordagens</label>
          <span>{abordagemExpandido ? '−' : '+'}</span>
        </div>
        {abordagemExpandido && (
          <div className={styles.checkboxGroup}>
            {abordagensDisponiveis.map(ab => (
              <label key={ab} className={styles.checkboxLabel}>
                <input 
                  type="checkbox"
                  checked={filtros.abordagens.includes(ab)}
                  onChange={() => handleAbordagemToggle(ab)}
                />
                {ab}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className={styles.filtroActions}>
        <button className={styles.btnAplicar} onClick={aplicarFiltros}>Aplicar Filtros</button>
        <button className={styles.btnLimpar} onClick={limparFiltros}>Limpar</button>
      </div>
    </aside>
  );
}