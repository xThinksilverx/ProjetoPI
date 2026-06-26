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

    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    if (!usuario.ativo) {
      return NextResponse.json(
        { success: false, error: 'Conta desativada. Entre em contato com o suporte.' },
        { status: 401 }
      );
    }

    if (!usuario.emailVerificado) {
      return NextResponse.json(
        { success: false, error: 'Email não verificado. Verifique sua caixa de entrada para ativar a conta.' },
        { status: 401 }
      );
    }

    const senhaValida = await usuario.comparePassword(senha);
    if (!senhaValida) {
      return NextResponse.json(
        { success: false, error: 'Email ou senha inválidos' },
        { status: 401 }
      );
    }

    usuario.ultimoAcesso = new Date();
    await usuario.save();

    const token = generateToken(usuario._id, usuario.tipo);

    const response = NextResponse.json({
      success: true,
      data: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo
      }
    });

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
