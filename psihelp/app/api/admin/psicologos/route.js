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
    if (!payload || payload.tipo !== 'admin') {
      return NextResponse.json({ success: false, error: 'Acesso negado' }, { status: 403 });
    }

    await connectDB();
    const psicologos = await Psicologo.find().sort({ criadoEm: -1 });

    return NextResponse.json({ success: true, data: psicologos });
  } catch (error) {
    console.error('Erro ao buscar psicólogos:', error);
    return NextResponse.json({ success: false, error: 'Erro ao buscar psicólogos' }, { status: 500 });
  }
}
