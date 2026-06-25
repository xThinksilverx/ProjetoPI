import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    const { email, senha } = await request.json();
    
    if (!email || !senha) {
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }
    
    // Buscar usuário
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }
    
    // Verificar se está ativo
    if (!usuario.ativo) {
      return NextResponse.json(
        { success: false, error: 'Conta desativada. Entre em contato com o suporte.' },
        { status: 401 }
      );
    }
    
    // Verificar senha
    const senhaValida = await usuario.comparePassword(senha);
    if (!senhaValida) {
      return NextResponse.json(
        { success: false, error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }
    
    // Atualizar último acesso
    usuario.ultimoAcesso = new Date();
    await usuario.save();
    
    // Gerar token
    const token = generateToken(usuario._id, usuario.tipo);
    
    // Criar resposta
    const response = NextResponse.json({
      success: true,
      data: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });
    
    // Set cookie
    setAuthCookie(response, token);
    
    return response;
  } catch (error) {
    console.error('Erro no login:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao fazer login' },
      { status: 500 }
    );
  }
}