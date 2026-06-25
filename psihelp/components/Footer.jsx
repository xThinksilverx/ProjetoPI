import styles from '@/styles/components.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>PsiMatch - Encontre seu psicólogo</h4>
            <p>Plataforma em conformidade com as normas do Conselho Federal de Psicologia (CFP).</p>
            <a href="https://www.cfp.org.br/consulta" target="_blank" rel="noopener noreferrer" className={styles.cfpLink}>
              Consulte o CRP no site do CFP
            </a>
          </div>
          <div className={styles.footerSection}>
            <h5>Ética e Transparência</h5>
            <ul className={styles.footerList}>
              <li>Verifique sempre o CRP do profissional</li>
              <li>A terapia não oferece garantias de cura</li>
              <li>Respeito ao sigilo profissional (LGPD)</li>
              <li>Relate qualquer prática antiética ao CFP</li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h5>Contato para validação</h5>
            <p>Professores e psicólogos atuantes: <strong>validacao@psimatch.com</strong></p>
            <p className={styles.footerSmall}>Acompanhamento por profissionais da área de psicologia</p>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2025 PsiMatch - Marketplace de Psicólogos. Todos os direitos reservados.</p>
          <p>Proteção de dados sensíveis em conformidade com a LGPD.</p>
        </div>
      </div>
    </footer>
  );
}