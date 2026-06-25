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
    lat: '',
    lng: '',
    raioKm: '25',
    localizacaoLabel: '',
    horarioDia: '',
    horarioHora: '',
    avaliacaoMin: '',
  });

  const carregarPsicologos = async (filtrosAlvo = filtros) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // localizacaoLabel é só para display — não vai para a API
      const SKIP = ['localizacaoLabel'];
      Object.keys(filtrosAlvo).forEach((key) => {
        if (SKIP.includes(key)) return;
        const val = (filtrosAlvo as any)[key];
        if (!val || val === 'todos') return;
        if (typeof val === 'string' && !val.trim()) return;
        if (Array.isArray(val)) {
          if (val.length === 0) return;
          val.forEach((v: string) => params.append(key, v));
        } else {
          params.append(key, val);
        }
      });

      const response = await fetch(`/api/psicologos?${params.toString()}`);
      const data = await response.json();
      if (data.success) setPsicologos(data.data);
    } catch (error) {
      console.error('Erro ao carregar psicólogos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarPsicologos();
  }, []);

  const handleBuscar = (arg?: string | Record<string, any>) => {
    if (arg && typeof arg === 'object') {
      carregarPsicologos(arg as typeof filtros);
    } else if (typeof arg === 'string') {
      const filtrosNovos = { ...filtros, buscaTexto: arg };
      setFiltros(filtrosNovos);
      carregarPsicologos(filtrosNovos);
    } else {
      carregarPsicologos();
    }
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
                <PsicologoCard
                  key={psicologo._id}
                  psicologo={psicologo}
                  patientLat={filtros.lat ? Number(filtros.lat) : undefined}
                  patientLng={filtros.lng ? Number(filtros.lng) : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}