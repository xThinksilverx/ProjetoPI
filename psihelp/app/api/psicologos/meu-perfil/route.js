import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Psicologo from '@/lib/models/Psicologos';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
    }

    await connectDB();
    const psicologo = await Psicologo.findOne({ usuarioId: payload.id });

    if (!psicologo) {
      return NextResponse.json({ success: false, error: 'Perfil profissional não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: psicologo });
  } catch (error) {
    console.error('Erro ao buscar perfil profissional:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar perfil' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Token inválido' }, { status: 401 });
    }

    await connectDB();
    const data = await request.json();

    // Campos que o próprio psicólogo não pode alterar
    delete data.validado;
    delete data.usuarioId;
    delete data.crp;

    // strict: false garante que campos novos no schema (como bloqueados)
    // não sejam ignorados pelo cache do modelo Mongoose em dev
    const psicologo = await Psicologo.findOneAndUpdate(
      { usuarioId: payload.id },
      { $set: data },
      { new: true, strict: false }
    );

    if (!psicologo) {
      return NextResponse.json({ success: false, error: 'Perfil não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: psicologo });
  } catch (error) {
    console.error('Erro ao atualizar perfil profissional:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
