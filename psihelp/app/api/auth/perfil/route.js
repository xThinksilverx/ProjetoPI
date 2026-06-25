import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
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
    const usuario = await Usuario.findById(payload.id).select('-senha');

    if (!usuario) {
      return NextResponse.json({ success: false, error: 'Usuário não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: usuario });
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
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
    const { nome, telefone, dataNascimento, genero } = await request.json();

    const usuario = await Usuario.findByIdAndUpdate(
      payload.id,
      { nome, telefone, dataNascimento, genero },
      { new: true }
    ).select('-senha');

    return NextResponse.json({ success: true, data: usuario });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar perfil' }, { status: 500 });
  }
}
