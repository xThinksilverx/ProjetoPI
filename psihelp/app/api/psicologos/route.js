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
    const avaliacaoMin = searchParams.get('avaliacaoMin');
    const lat    = searchParams.get('lat');
    const lng    = searchParams.get('lng');
    const raioKm = searchParams.get('raioKm') || '25';
    const pagina = parseInt(searchParams.get('pagina') || '1');
    const limite = parseInt(searchParams.get('limite') || '12');
    
    // Todas as condições acumuladas em $and para evitar conflitos entre $or aninhados
    const conditions = [{ validado: true }];

    // Busca por texto — cada palavra deve bater em pelo menos um dos campos
    if (buscaTexto && buscaTexto.trim()) {
      const termos = buscaTexto.trim().split(/\s+/).filter(Boolean);
      const camposBusca = (re) => [
        { nome: re },
        { crp: re },
        { descricao: re },
        { formacao: re },
        { abordagens: re },
        { especializacoes: re },
        { 'localizacao.cidade': re },
        { 'localizacao.estado': re },
      ];
      termos.forEach(termo => {
        conditions.push({ $or: camposBusca(new RegExp(termo, 'i')) });
      });
    }

    // Filtro por abordagens (sidebar)
    if (abordagens && abordagens.length > 0) {
      conditions.push({ abordagens: { $in: abordagens } });
    }

    // Filtro por modalidade — 'ambos' aparece em qualquer filtro
    if (modalidade && modalidade !== 'todos') {
      conditions.push({ $or: [{ modalidade }, { modalidade: 'ambos' }] });
    }

    // Filtro por preço
    if (precoMin || precoMax) {
      const precoFiltro = {};
      if (precoMin) precoFiltro.$gte = Number(precoMin);
      if (precoMax) precoFiltro.$lte = Number(precoMax);
      conditions.push({ preco: precoFiltro });
    }

    // Filtro por localização
    if (cidade) conditions.push({ 'localizacao.cidade': new RegExp(cidade, 'i') });
    if (estado) conditions.push({ 'localizacao.estado': new RegExp(estado, 'i') });

    // Filtro por horário
    if (horarioDia && horarioHora) {
      conditions.push({
        disponibilidade: { $elemMatch: { dia: horarioDia, horarios: horarioHora } }
      });
    }

    // Filtro por avaliação mínima
    if (avaliacaoMin) {
      conditions.push({ avaliacao: { $gte: Number(avaliacaoMin) } });
    }

    // Filtro geoespacial por proximidade ($near exige índice 2dsphere)
    const usarProximidade = lat && lng;
    if (usarProximidade) {
      conditions.push({
        'localizacao.loc': {
          $near: {
            $geometry: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
            $maxDistance: Number(raioKm) * 1000,
          },
        },
      });
    }

    const filtro = conditions.length === 1 ? conditions[0] : { $and: conditions };

    const skip = (pagina - 1) * limite;
    // $near já ordena por distância — sort explícito não pode ser aplicado junto
    const query = Psicologo.find(filtro).skip(skip).limit(limite);
    if (!usarProximidade) query.sort({ avaliacao: -1, totalAvaliacoes: -1, preco: 1 });
    const psicologos = await query;
    
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