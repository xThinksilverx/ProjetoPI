'use client';

import { useState, useEffect } from 'react';
import PsicologoCard from '@/components/PsicologoCard';
import FiltrosSidebar from '@/components/FiltrosSidebar';
import BuscaInteligente from '@/components/BuscaInteligente';
import LoadingSpinner from '@/components/LoadingSpinner';
import Header from '@/components/Header';
import styles from '@/styles/components.module.css';

export default function HomePage() {
  const [psicologos, setPsicologos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
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

  const carregarPsicologos = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.keys(filtros).forEach(key => {
        if (filtros[key] && filtros[key] !== 'todos' && 
            (typeof filtros[key] !== 'string' || filtros[key].trim() !== '') &&
            (!Array.isArray(filtros[key]) || filtros[key].length > 0)) {
          if (Array.isArray(filtros[key])) {
            filtros[key].forEach(value => params.append(key, value));
          } else {
            params.append(key, filtros[key]);
          }
        }
      });
      
      const response = await fetch(`/api/psicologos?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setPsicologos(data.data);
      }
    } catch (error) {
      console.error('Erro ao carregar psicólogos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPsicologos();
  }, []);

  const handleBuscar = () => {
    carregarPsicologos();
  };

  if (loading) return <><Header /><LoadingSpinner /></>;

  return (
    <>
    <Header />
    <div className="container">
      <div className={styles.homeHeader}>
        <h1>Encontre o psicólogo ideal para você</h1>
        <p>Plataforma em conformidade com o Conselho Federal de Psicologia</p>
      </div>
      
      <BuscaInteligente 
        valor={filtros.buscaTexto}
        onChange={(texto) => setFiltros(prev => ({ ...prev, buscaTexto: texto }))}
        onBuscar={handleBuscar}
      />
      
      <div className={styles.homeContent}>
        <FiltrosSidebar 
          filtros={filtros}
          setFiltros={setFiltros}
          onFiltrar={handleBuscar}
        />
        <div className={styles.resultadosArea}>
          <div className={styles.resultadosHeader}>
            <span>{psicologos.length} psicólogos encontrados</span>
          </div>
          {psicologos.length === 0 ? (
            <div className={styles.semResultados}>
              <p>Nenhum psicólogo encontrado com os filtros selecionados.</p>
              <p>Tente ampliar sua busca ou limpar os filtros.</p>
            </div>
          ) : (
            <div className={styles.cardsGrid}>
              {psicologos.map(psicologo => (
                <PsicologoCard key={psicologo._id} psicologo={psicologo} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}