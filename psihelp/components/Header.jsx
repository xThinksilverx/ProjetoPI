'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import styles from '@/styles/components.module.css';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.headerContent}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>🧠</span>
            <span>PsiMatch</span>
          </Link>
          <nav className={styles.nav}>
            <Link href="/" className={styles.navLink}>Home</Link>
            {user?.tipo !== 'admin' && (
              <Link href="/cadastro" className={styles.navLink}>Cadastrar Psicólogo</Link>
            )}
            {user?.tipo === 'admin' && (
              <Link href="/admin" className={styles.navLink}>Painel Admin</Link>
            )}
            {user ? (
              <div className={styles.userMenu}>
                <span className={styles.userName}>👤 {user.nome.split(' ')[0]}</span>
                <div className={styles.userDropdown}>
                  <Link href="/perfil" className={styles.dropdownLink}>Meu Perfil</Link>
                  <button onClick={logout} className={styles.dropdownLink}>Sair</button>
                </div>
              </div>
            ) : (
              <Link href="/login" className={styles.navLink}>Entrar</Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}