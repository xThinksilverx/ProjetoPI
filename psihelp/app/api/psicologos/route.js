import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Psicologo from '@/lib/models/Psicologos';
import Usuario from '@/lib/models/Usuario';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

// GET - Buscar psicólogos com filtros
export async function GET(request) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const buscaTexto = searchParams.get('buscaTexto');
    const abordagens = searchParams.getAll('abordagens');
    const modalidade = searchParams.get('modalidade');
    const precoMin = searchParams.get('precoMin');
    const precoMax = searchParams.get('precoMax');
    const cidade = searchParams.get('cidade');
    const estado = searchParams.get('estado');
    const horarioDia = searchParams.get('horarioDia');
    const horarioHora = searchParams.get('horarioHora');
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const limite = parseInt(searchParams.get('limite') || '12');
    
    const filtro = { validado: true };
    
    // Busca por texto
    if (buscaTexto) {
      filtro.$text = { $search: buscaTexto };
    }
    
    // Filtro por abordagens
    if (abordagens && abordagens.length > 0) {
      filtro.abordagens = { $in: abordagens };
    }
    
    // Filtro por modalidade ('ambos' aparece em qualquer filtro)
    if (modalidade && modalidade !== 'todos') {
      filtro.$or = [{ modalidade }, { modalidade: 'ambos' }];
    }
    
    // Filtro por preço
    if (precoMin || precoMax) {
      filtro.preco = {};
      if (precoMin) filtro.preco.$gte = Number(precoMin);
      if (precoMax) filtro.preco.$lte = Number(precoMax);
    }
    
    // Filtro por localização
    if (cidade) {
      filtro['localizacao.cidade'] = new RegExp(cidade, 'i');
    }
    if (estado) {
      filtro['localizacao.estado'] = new RegExp(estado, 'i');
    }
    
    // Filtro por horário
    if (horarioDia && horarioHora) {
      filtro.disponibilidade = {
        $elemMatch: {
          dia: horarioDia,
          horarios: horarioHora
        }
      };
    }
    
    const skip = (pagina - 1) * limite;
    const psicologos = await Psicologo.find(filtro)
      .sort({ avaliacao: -1, preco: 1 })
      .skip(skip)
      .limit(limite);
    
    const total = await Psicologo.countDocuments(filtro);
    
    return NextResponse.json({
      success: true,
      data: psicologos,
      pagination: {
        pagina,
        totalPaginas: Math.ceil(total / limite),
        total,
        limite
      }
    });
  } catch (error) {
    console.error('Erro ao buscar psicólogos:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar psicólogos' },
      { status: 500 }
    );
  }
}

// POST - Cadastrar novo psicólogo
export async function POST(request) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Não autorizado' },
        { status: 401 }
      );
    }
    
    const payload = await verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Token inválido' },
        { status: 401 }
      );
    }
    
    await connectDB();
    
    const data = await request.json();
    const { crp, email } = data;
    
    // Verificar duplicatas
    const existente = await Psicologo.findOne({ $or: [{ crp }, { email }] });
    if (existente) {
      return NextResponse.json(
        { success: false, error: 'CRP ou email já cadastrado' },
        { status: 400 }
      );
    }
    
    const psicologo = new Psicologo({
      ...data,
      usuarioId: payload.id,
      validado: false
    });

    await psicologo.save();

    // Atualiza o tipo do usuário para 'psicologo'
    await Usuario.findByIdAndUpdate(payload.id, { tipo: 'psicologo' });

    return NextResponse.json({
      success: true,
      data: psicologo,
      message: 'Cadastro realizado! Aguardando validação.'
    }, { status: 201 });
  } catch (error) {
    console.error('Erro ao cadastrar psicólogo:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao cadastrar psicólogo' },
      { status: 500 }
    );
  }
}