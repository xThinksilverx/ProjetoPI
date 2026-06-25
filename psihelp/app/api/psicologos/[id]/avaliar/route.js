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

// Retorna a nota do usuário logado para este psicólogo
export async function GET(request, { params }) {
  const payload = await getPayload();
  if (!payload) {
    return NextResponse.json({ success: true, data: null });
  }
  await connectDB();
  const av = await Avaliacao.findOne({ psicologoId: params.id, usuarioId: payload.id });
  return NextResponse.json({ success: true, data: av ? av.nota : null });
}

// Salva ou atualiza a nota do usuário
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

  // Impede o próprio psicólogo de se avaliar
  const psicologo = await Psicologo.findById(params.id);
  if (!psicologo) {
    return NextResponse.json({ success: false, error: 'Psicólogo não encontrado' }, { status: 404 });
  }
  if (psicologo.usuarioId?.toString() === payload.id) {
    return NextResponse.json({ success: false, error: 'Você não pode avaliar seu próprio perfil' }, { status: 403 });
  }

  // Upsert da avaliação (explicit $set para compatibilidade com Mongoose strict)
  await Avaliacao.findOneAndUpdate(
    { psicologoId: params.id, usuarioId: payload.id },
    { $set: { nota } },
    { upsert: true, setDefaultsOnInsert: true }
  );

  // Recalcula média e total a partir de todas as avaliações
  const todas = await Avaliacao.find({ psicologoId: params.id });
  const total = todas.length;
  const media = total > 0 ? Math.round((todas.reduce((s, a) => s + a.nota, 0) / total) * 10) / 10 : 0;

  // strict: false garante que totalAvaliacoes (campo novo) seja salvo mesmo com cache de schema
  await Psicologo.findByIdAndUpdate(
    params.id,
    { $set: { avaliacao: media, totalAvaliacoes: total } },
    { strict: false }
  );

  return NextResponse.json({ success: true, data: { nota, media, total } });
}
