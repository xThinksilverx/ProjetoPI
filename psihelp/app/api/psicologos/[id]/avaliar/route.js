import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Avaliacao from '@/lib/models/Avaliacao';
import Psicologo from '@/lib/models/Psicologos';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

async function getPayload() {
  const token = cookies().get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request, { params }) {
  const payload = await getPayload();
  if (!payload) {
    return NextResponse.json({ success: true, data: null });
  }
  await connectDB();
  const av = await Avaliacao.findOne({ psicologoId: params.id, usuarioId: payload.id });
  return NextResponse.json({ success: true, data: av ? av.nota : null });
}

export async function POST(request, { params }) {
  const payload = await getPayload();
  if (!payload) {
    return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 });
  }
  if (payload.tipo !== 'paciente') {
    return NextResponse.json({ success: false, error: 'Apenas pacientes podem avaliar' }, { status: 403 });
  }

  const { nota } = await request.json();
  if (!nota || nota < 1 || nota > 5 || !Number.isInteger(nota)) {
    return NextResponse.json({ success: false, error: 'Nota inválida (1 a 5)' }, { status: 400 });
  }

  await connectDB();

  const psicologo = await Psicologo.findById(params.id);
  if (!psicologo) {
    return NextResponse.json({ success: false, error: 'Psicólogo não encontrado' }, { status: 404 });
  }
  if (psicologo.usuarioId?.toString() === payload.id) {
    return NextResponse.json({ success: false, error: 'Você não pode avaliar seu próprio perfil' }, { status: 403 });
  }

  await Avaliacao.findOneAndUpdate(
    { psicologoId: params.id, usuarioId: payload.id },
    { $set: { nota } },
    { upsert: true, setDefaultsOnInsert: true }
  );

  const todas = await Avaliacao.find({ psicologoId: params.id });
  const total = todas.length;
  const media = total > 0 ? Math.round((todas.reduce((s, a) => s + a.nota, 0) / total) * 10) / 10 : 0;

  await Psicologo.findByIdAndUpdate(
    params.id,
    { $set: { avaliacao: media, totalAvaliacoes: total } },
    { strict: false }
  );

  return NextResponse.json({ success: true, data: { nota, media, total } });
}
