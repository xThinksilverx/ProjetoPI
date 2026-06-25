'use client';

import Link from 'next/link';
import styles from '@/styles/components.module.css';

function labelModalidade(m) {
  if (m === 'ambos') return '🌐 Online e Presencial';
  if (m === 'online') return '🌐 Online';
  return '📍 Presencial';
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function PsicologoCard({ psicologo, patientLat, patientLng }) {
  const psiLng = psicologo.localizacao?.loc?.coordinates?.[0];
  const psiLat = psicologo.localizacao?.loc?.coordinates?.[1];
  const distancia = (patientLat != null && patientLng != null && psiLat != null && psiLng != null)
    ? haversineKm(patientLat, patientLng, psiLat, psiLng)
    : null;
  return (
    <Link href={`/psicologos/${psicologo._id}`} className={styles.cardLink}>
      <div className={styles.card}>

        {/* Cabeçalho colorido com avatar circular */}
        <div className={styles.cardHeader}>
          <div className={styles.cardAvatarWrap}>
            <img
              src={psicologo.foto || '/default-avatar.svg'}
              alt={psicologo.nome}
              className={styles.cardAvatar}
            />
          </div>
          {psicologo.validado && (
            <span className={styles.validadoBadge}>✓ Validado</span>
          )}
        </div>

        {/* Conteúdo */}
        <div className={styles.cardContent}>
          <h3 className={styles.cardNome}>{psicologo.nome}</h3>
          <p className={styles.crp}>CRP: {psicologo.crp}</p>

          <div className={styles.abordagens}>
            {psicologo.abordagens.slice(0, 3).map((ab, idx) => (
              <span key={idx} className={styles.tag}>{ab}</span>
            ))}
          </div>

          {psicologo.descricao && (
            <p className={styles.descricao}>
              {psicologo.descricao.substring(0, 110)}{psicologo.descricao.length > 110 ? '...' : ''}
            </p>
          )}

          <div className={styles.cardDetails}>
            <span>💰 R$ {psicologo.preco}/sessão</span>
            <span>{labelModalidade(psicologo.modalidade)}</span>
            {distancia !== null && (
              <span className={styles.cardDistancia}>
                ~{distancia < 1 ? '< 1' : Math.round(distancia)} km
              </span>
            )}
          </div>

          <div className={styles.cardEstrelas}>
            {[1,2,3,4,5].map(i => (
              <span key={i} className={i <= Math.round(psicologo.avaliacao || 0) ? styles.estrelaCheia : styles.estrelaVazia}>★</span>
            ))}
            <span className={styles.cardAvaliacaoTotal}>
              {(psicologo.totalAvaliacoes > 0 || psicologo.avaliacao > 0)
                ? `${psicologo.avaliacao?.toFixed(1)} (${psicologo.totalAvaliacoes ?? 1})`
                : 'Sem avaliações'}
            </span>
          </div>

          <div className={styles.btnVerPerfil}>
            Ver perfil completo
          </div>
        </div>
      </div>
    </Link>
  );
}
