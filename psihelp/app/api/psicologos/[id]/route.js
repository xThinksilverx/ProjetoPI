import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Psicologo from '@/lib/models/Psicologos';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request, { params }) {
  try {
    await connectDB();
    const psicologo = await Psicologo.findById(params.id);

    if (!psicologo) {
      return NextResponse.json({ success: false, error: 'Psicólogo não encontrado' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: psicologo });
  } catch (error) {
    console.error('Erro ao buscar psicólogo:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar psicólogo' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
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
    const psicologo = await Psicologo.findById(params.id);

    if (!psicologo) {
      return NextResponse.json({ success: false, error: 'Psicólogo não encontrado' }, { status: 404 });
    }

    const isAdmin = payload.tipo === 'admin';
    const isOwner = psicologo.usuarioId?.toString() === payload.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ success: false, error: 'Sem permissão' }, { status: 403 });
    }

    const data = await request.json();

    if (!isAdmin) {
      delete data.validado;
    }

    const updated = await Psicologo.findByIdAndUpdate(params.id, data, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Erro ao atualizar psicólogo:', error);
    return NextResponse.json({ success: false, error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (!payload || payload.tipo !== 'admin') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 });
    }

    await connectDB();
    await Psicologo.findByIdAndDelete(params.id);

    return NextResponse.json({ success: true, message: 'Psicólogo excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir psicólogo:', error);
    return NextResponse.json({ success: false, error: 'Erro ao excluir' }, { status: 500 });
  }
}
