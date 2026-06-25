'use client';

import { useRef } from 'react';
import styles from '@/styles/components.module.css';

export default function BuscaInteligente({ valor, onChange, onBuscar }) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onBuscar();
  };

  const handleLimpar = () => {
    onChange('');
    onBuscar('');
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.buscaForm}>
      <div className={styles.buscaContainer}>
        <div style={{ position: 'relative', flex: 1 }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Busque por nome, CRP, abordagem, especialização, cidade..."
            value={valor}
            onChange={(e) => onChange(e.target.value)}
            className={styles.buscaInput}
            style={{ width: '100%' }}
          />
          {valor && (
            <button
              type="button"
              onClick={handleLimpar}
              style={{
                position: 'absolute', right: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', background: 'none', border: 'none',
                cursor: 'pointer', color: '#94a3b8', fontSize: '1.1rem', lineHeight: 1
              }}
              title="Limpar busca"
            >
              ×
            </button>
          )}
        </div>
        <button type="submit" className={styles.buscaButton}>🔍 Buscar</button>
      </div>
    </form>
  );
}
