import { AuthProvider } from '@/contexts/AuthContext';
import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'PsiMatch - Encontre seu Psicólogo',
  description: 'Plataforma para busca de psicólogos em conformidade com o CFP',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}