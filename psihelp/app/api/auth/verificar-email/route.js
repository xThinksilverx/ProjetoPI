import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
import { generateToken, setAuthCookie } from '@/lib/auth';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 400 }
      );
    }

    const usuario = await Usuario.findOne({
      tokenVerificacao: token,
      tokenVerificacaoExpira: { $gt: new Date() },
    });

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Token inválido ou expirado' },
        { status: 400 }
      );
    }

    usuario.emailVerificado = true;
    usuario.tokenVerificacao = undefined;
    usuario.tokenVerificacaoExpira = undefined;
    usuario.ultimoAcesso = new Date();
    await usuario.save();

    const jwtToken = generateToken(usuario._id, usuario.tipo);

    const response = NextResponse.json({
      success: true,
      message: 'Email verificado com sucesso!',
      data: {
        id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        tipo: usuario.tipo,
      },
    });

    setAuthCookie(response, jwtToken);

    return response;
  } catch (error) {
    console.error('Erro ao verificar email:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao verificar email' },
      { status: 500 }
    );
  }
}
