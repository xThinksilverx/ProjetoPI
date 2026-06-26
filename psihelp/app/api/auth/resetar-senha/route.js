import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    await connectDB();

    const { token, novaSenha } = await request.json();

    if (!token || !novaSenha) {
      return NextResponse.json(
        { success: false, error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    if (novaSenha.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    const usuario = await Usuario.findOne({
      tokenResetSenha: token,
      tokenResetSenhaExpira: { $gt: new Date() },
    });

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Link inválido ou expirado. Solicite um novo.' },
        { status: 400 }
      );
    }

    const senhaHash = await bcrypt.hash(novaSenha, 10);

    await Usuario.updateOne(
      { _id: usuario._id },
      {
        $set: { senha: senhaHash },
        $unset: { tokenResetSenha: '', tokenResetSenhaExpira: '' },
      }
    );

    return NextResponse.json({ success: true, message: 'Senha alterada com sucesso!' });
  } catch (error) {
    console.error('Erro ao resetar senha:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao alterar senha' },
      { status: 500 }
    );
  }
}
