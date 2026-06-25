import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Usuario from '@/lib/models/Usuario';
import Psicologo from '@/lib/models/Psicologos';

export async function POST(request) {
  try {
    await connectDB();

    const {
      nome, email, senha,
      crp, foto, telefone, formacao, descricao,
      especializacoes, abordagens, modalidade, preco,
      localizacao, disponibilidade
    } = await request.json();

    if (!nome || !email || !senha || !crp) {
      return NextResponse.json(
        { success: false, error: 'Nome, email, senha e CRP são obrigatórios' },
        { status: 400 }
      );
    }

    if (senha.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Senha deve ter no mínimo 6 caracteres' },
        { status: 400 }
      );
    }

    const emailExistente = await Usuario.findOne({ email: email.toLowerCase() });
    if (emailExistente) {
      return NextResponse.json(
        { success: false, error: 'Este email já está cadastrado' },
        { status: 400 }
      );
    }

    const crpExistente = await Psicologo.findOne({ crp: crp.toUpperCase() });
    if (crpExistente) {
      return NextResponse.json(
        { success: false, error: 'Este CRP já está cadastrado' },
        { status: 400 }
      );
    }

    const usuario = new Usuario({ nome, email, senha, tipo: 'psicologo' });
    await usuario.save();

    const psicologo = new Psicologo({
      nome,
      email,
      crp: crp.toUpperCase(),
      foto: foto || '',
      telefone,
      formacao,
      descricao,
      especializacoes: Array.isArray(especializacoes)
        ? especializacoes
        : (especializacoes || '').split(',').map(s => s.trim()).filter(Boolean),
      abordagens: abordagens || [],
      modalidade,
      preco: Number(preco),
      localizacao: localizacao || {},
      disponibilidade: disponibilidade || [],
      usuarioId: usuario._id,
      validado: false
    });

    await psicologo.save();

    return NextResponse.json(
      { success: true, message: 'Cadastro enviado! Aguardando validação do administrador.' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erro ao cadastrar psicólogo:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao realizar cadastro. Tente novamente.' },
      { status: 500 }
    );
  }
}
