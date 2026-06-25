import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request) {
  try {
    await connectDB();
    
    const { nome, email, senha } = await request.json();
    
    // Validações
    if (!nome || !email || !senha) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }
    
    if (senha.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }
    
    // Verificar se usuário já existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return NextResponse.json(
        { success: false, error: 'Email já cadastrado' },
        { status: 400 }
      );
    }
    
    // Criar usuário
    const usuario = new Usuario({
      nome,
      email,
      senha,
      ultimoAcesso: new Date()
    });
    
    await usuario.save();
    
    // Gerar token
    const token = generateToken(usuario._id);
    
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
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao registrar usuário' },
      { status: 500 }
    );
  }
}