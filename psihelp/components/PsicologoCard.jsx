'use client';

import Link from 'next/link';
import styles from '@/styles/components.module.css';

function labelModalidade(m) {
  if (m === 'ambos') return '🌐 Online e Presencial';
  if (m === 'online') return '🌐 Online';
  return '📍 Presencial';
}

export default function PsicologoCard({ psicologo }) {
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
