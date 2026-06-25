import styles from '@/styles/components.module.css';

export default function LoadingSpinner() {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}></div>
      <p>Carregando...</p>
    </div>
  );
}