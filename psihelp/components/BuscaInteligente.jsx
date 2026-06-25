import styles from '@/styles/components.module.css';

export default function BuscaInteligente({ valor, onChange, onBuscar }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    onBuscar();
  };

  return (
    <form onSubmit={handleSubmit} className={styles.buscaForm}>
      <div className={styles.buscaContainer}>
        <input 
          type="text"
          placeholder="Busque por nome, abordagem, especialização ou descrição..."
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className={styles.buscaInput}
        />
        <button type="submit" className={styles.buscaButton}>🔍 Buscar</button>
      </div>
    </form>
  );
}