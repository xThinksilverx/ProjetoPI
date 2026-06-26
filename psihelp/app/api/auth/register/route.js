import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
import { enviarEmailVerificacao } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await connectDB();

    const { nome, email, senha } = await request.json();

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

    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return NextResponse.json(
        { success: false, error: 'Email já cadastrado' },
        { status: 400 }
      );
    }

    const tokenVerificacao = crypto.randomBytes(32).toString('hex');
    const tokenVerificacaoExpira = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const usuario = new Usuario({
      nome,
      email,
      senha,
      ultimoAcesso: new Date(),
      tokenVerificacao,
      tokenVerificacaoExpira,
    });

    await usuario.save();

    try {
      await enviarEmailVerificacao(email, nome, tokenVerificacao);
    } catch (emailError) {
      await Usuario.deleteOne({ _id: usuario._id });
      console.error('Erro ao enviar email de verificação:', emailError);
      return NextResponse.json(
        { success: false, error: 'Não foi possível enviar o email de confirmação. Verifique as configurações de email do servidor.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Conta criada! Verifique seu email para ativar o acesso.',
    });
  } catch (error) {
    console.error('Erro no registro:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao registrar usuário' },
      { status: 500 }
    );
  }
}
