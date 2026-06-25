import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Psicologo from '@/lib/models/Psicologo';

export async function GET() {
  try {
    await connectDB();
    const abordagens = await Psicologo.distinct('abordagens');
    return NextResponse.json({ success: true, data: abordagens.sort() });
  } catch (error) {
    console.error('Erro ao buscar abordagens:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar abordagens' },
      { status: 500 }
    );
  }
}