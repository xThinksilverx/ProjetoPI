import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
import { enviarEmailResetSenha } from '@/lib/email';
import crypto from 'crypto';

export async function POST(request) {
  try {
    await connectDB();

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const usuario = await Usuario.findOne({ email });

    // Resposta genérica para não revelar se o email existe ou não
    if (!usuario) {
      return NextResponse.json({ success: true });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expira = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await Usuario.updateOne(
      { _id: usuario._id },
      { $set: { tokenResetSenha: token, tokenResetSenhaExpira: expira } }
    );

    await enviarEmailResetSenha(email, usuario.nome, token);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao processar solicitação' },
      { status: 500 }
    );
  }
}
