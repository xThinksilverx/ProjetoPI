'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import styles from '@/styles/components.module.css';

export default function PerfilPage() {
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    setFormData(user);
    setLoading(false);
  }, [user, router]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/auth/perfil', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      if (data.success) {
        updateUser(data.data);
        setEditando(false);
      } else {
        alert('Erro ao atualizar perfil');
      }
    } catch (error) {
      console.error('Erro ao atualizar:', error);
      alert('Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading) return <LoadingSpinner />;
  if (!user) return null;

  return (
    <div className={styles.perfilContainer}>
      <div className={styles.perfilCard}>
        <div className={styles.perfilHeader}>
          <h2>Meu Perfil</h2>
          {!editando && (
            <button 
              className={styles.btnEdit}
              onClick={() => setEditando(true)}
            >
              ✏️ Editar
            </button>
          )}
        </div>

        {!editando ? (
          <div className={styles.perfilInfo}>
            <div className={styles.infoRow}>
              <strong>Nome:</strong> <span>{user.nome}</span>
            </div>
            <div className={styles.infoRow}>
              <strong>Email:</strong> <span>{user.email}</span>
            </div>
            <div className={styles.infoRow}>
              <strong>Tipo:</strong> <span>{user.tipo === 'paciente' ? 'Paciente' : user.tipo === 'psicologo' ? 'Psicólogo' : 'Admin'}</span>
            </div>
            <div className={styles.infoRow}>
              <strong>Cadastrado em:</strong> <span>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</span>
            </div>
            <div className={styles.infoRow}>
              <strong>Último acesso:</strong> <span>{user.ultimoAcesso ? new Date(user.ultimoAcesso).toLocaleDateString('pt-BR') : 'Nunca'}</span>
            </div>
            
            <button 
              className={styles.btnLogout}
              onClick={handleLogout}
            >
              Sair da conta
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.perfilForm}>
            <div className={styles.formGroup}>
              <label>Nome</label>
              <input
                type="text"
                name="nome"
                value={formData.nome || ''}
                onChange={handleChange}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label>Telefone</label>
              <input
                type="tel"
                name="telefone"
                value={formData.telefone || ''}
                onChange={handleChange}
                placeholder="(XX) XXXXX-XXXX"
              />
            </div>
            <div className={styles.formGroup}>
              <label>Data de Nascimento</label>
              <input
                type="date"
                name="dataNascimento"
                value={formData.dataNascimento ? formData.dataNascimento.split('T')[0] : ''}
                onChange={handleChange}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Gênero</label>
              <select name="genero" value={formData.genero || ''} onChange={handleChange}>
                <option value="">Selecione</option>
                <option value="feminino">Feminino</option>
                <option value="masculino">Masculino</option>
                <option value="outro">Outro</option>
                <option value="prefiro_nao_dizer">Prefiro não dizer</option>
              </select>
            </div>
            
            <div className={styles.formActions}>
              <button type="submit" className={styles.btnSave} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
              <button 
                type="button" 
                className={styles.btnCancel}
                onClick={() => setEditando(false)}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}