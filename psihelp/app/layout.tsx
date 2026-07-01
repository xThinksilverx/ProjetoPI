import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'PsiMatch - Encontre seu Psicólogo',
  description: 'Plataforma para busca de psicólogos em conformidade com o CFP',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;if(s==='dark'||(!s&&p))document.documentElement.classList.add('dark');}catch(e){}})()` }} />
      </head>
      <body>
        <a href="#main-content" className="skip-link">Pular para o conteúdo principal</a>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}