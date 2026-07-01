import { connectDB } from '@/lib/mongodb';
import Psicologo from '@/lib/models/Psicologos';

const psicologos = [
  {
    nome: "Dra. Ana Beatriz Souza",
    crp: "04/51234",
    email: "ana@psicologia.com",
    telefone: "(31) 99999-1234",
    formacao: "Doutora em Psicologia Clínica pela UFMG",
    descricao: "Atendo adultos e adolescentes com foco em terapia breve e manejo da ansiedade.",
    foto: "https://randomuser.me/api/portraits/women/68.jpg",
    preco: 180,
    modalidade: "online",
    avaliacao: 4.9,
    totalAvaliacoes: 37,
    validado: true,
    abordagens: ["Terapia Cognitivo-Comportamental (TCC)", "Mindfulness"],
    especializacoes: ["Ansiedade", "Depressão", "Transtorno de Pânico"],
    localizacao: { cidade: "Belo Horizonte", estado: "MG", endereco: "Atendimento online" },
    disponibilidade: [
      { dia: "segunda", horarios: ["09:00", "10:00", "14:00"] },
      { dia: "quarta",  horarios: ["09:00", "10:00"] },
      { dia: "sexta",   horarios: ["14:00", "15:00"] }
    ],
  },
  {
    nome: "Dr. Carlos Mendes",
    crp: "05/98765",
    email: "carlos@psicologia.com",
    telefone: "(21) 98888-5678",
    formacao: "Mestre em Teoria Psicanalítica pela UFRJ",
    descricao: "Atendimento presencial no Rio de Janeiro. Especialista em luto e questões existenciais.",
    foto: "https://randomuser.me/api/portraits/men/32.jpg",
    preco: 220,
    modalidade: "presencial",
    avaliacao: 4.7,
    totalAvaliacoes: 21,
    validado: true,
    abordagens: ["Psicanálise Lacaniana", "Psicologia Existencial"],
    especializacoes: ["Luto", "Crise Existencial", "Relacionamentos"],
    localizacao: { cidade: "Rio de Janeiro", estado: "RJ", endereco: "Rua Voluntários da Pátria, 280 - Botafogo" },
    disponibilidade: [
      { dia: "terca",  horarios: ["10:00", "11:00", "15:00"] },
      { dia: "quinta", horarios: ["10:00", "11:00"] },
      { dia: "sabado", horarios: ["09:00", "10:00"] }
    ],
  },
  {
    nome: "Dra. Fernanda Lima",
    crp: "06/33445",
    email: "fernanda@psicologia.com",
    telefone: "(11) 97777-9012",
    formacao: "Especialista em Neuropsicologia pela PUC-SP",
    descricao: "Atendo crianças, adolescentes e adultos. Tenho experiência com neurodivergências.",
    foto: "https://randomuser.me/api/portraits/women/45.jpg",
    preco: 150,
    modalidade: "online",
    avaliacao: 5.0,
    totalAvaliacoes: 58,
    validado: true,
    abordagens: ["Terapia Cognitivo-Comportamental (TCC)", "Terapia de Aceitação e Compromisso (ACT)"],
    especializacoes: ["TDAH", "Autismo leve", "Gestão de estresse"],
    localizacao: { cidade: "São Paulo", estado: "SP", endereco: "Atendimento online" },
    disponibilidade: [
      { dia: "segunda", horarios: ["08:00", "09:00", "13:00"] },
      { dia: "terca",   horarios: ["08:00", "09:00"] },
      { dia: "quinta",  horarios: ["13:00", "14:00", "15:00"] }
    ],
  },
  {
    nome: "Dr. Rafael Almeida",
    crp: "06/74821",
    email: "rafael@psicologia.com",
    telefone: "(11) 96666-3344",
    formacao: "Especialista em Gestalt-terapia pelo Instituto Sedes Sapientiae",
    descricao: "Trabalho com adultos em processos de autoconhecimento, dificuldades de relacionamento e transições de vida. Atendimento presencial em São Paulo.",
    foto: "https://randomuser.me/api/portraits/men/54.jpg",
    preco: 200,
    modalidade: "presencial",
    avaliacao: 4.8,
    totalAvaliacoes: 29,
    validado: true,
    abordagens: ["Gestalt-terapia", "Psicologia Existencial"],
    especializacoes: ["Relacionamentos", "Autoconhecimento", "Crise de identidade"],
    localizacao: { cidade: "São Paulo", estado: "SP", endereco: "Av. Paulista, 1234 - Bela Vista" },
    disponibilidade: [
      { dia: "segunda", horarios: ["11:00", "14:00", "15:00"] },
      { dia: "quarta",  horarios: ["11:00", "14:00"] },
      { dia: "sexta",   horarios: ["09:00", "10:00", "11:00"] }
    ],
  },
  {
    nome: "Dra. Juliana Martins",
    crp: "07/29103",
    email: "juliana@psicologia.com",
    telefone: "(51) 98765-0011",
    formacao: "Mestre em Psicologia Clínica pela UFRGS",
    descricao: "Especialista em regulação emocional e comportamentos impulsivos. Atendo adultos com histórico de trauma e transtornos de personalidade.",
    foto: "https://randomuser.me/api/portraits/women/22.jpg",
    preco: 170,
    modalidade: "online",
    avaliacao: 4.6,
    totalAvaliacoes: 14,
    validado: true,
    abordagens: ["Terapia Comportamental Dialética (DBT)", "Terapia de Aceitação e Compromisso (ACT)"],
    especializacoes: ["Trauma", "Regulação emocional", "Transtorno de personalidade borderline"],
    localizacao: { cidade: "Porto Alegre", estado: "RS", endereco: "Atendimento online" },
    disponibilidade: [
      { dia: "terca",  horarios: ["08:00", "09:00", "10:00"] },
      { dia: "quinta", horarios: ["08:00", "09:00"] },
      { dia: "sabado", horarios: ["10:00", "11:00"] }
    ],
  },
  {
    nome: "Dr. Pedro Oliveira",
    crp: "02/18456",
    email: "pedro@psicologia.com",
    telefone: "(71) 99321-7788",
    formacao: "Especialista em Psicanálise pela UFBA",
    descricao: "Atendimento presencial e online. Trabalho com sofrimento psíquico, sintomas e a escuta do sujeito a partir de uma perspectiva psicanalítica.",
    foto: "https://randomuser.me/api/portraits/men/71.jpg",
    preco: 160,
    modalidade: "ambos",
    avaliacao: 4.5,
    totalAvaliacoes: 18,
    validado: true,
    abordagens: ["Psicanálise", "Psicologia Existencial"],
    especializacoes: ["Ansiedade", "Fobia", "Sofrimento psíquico"],
    localizacao: { cidade: "Salvador", estado: "BA", endereco: "Rua da Bahia, 500 - Nazaré" },
    disponibilidade: [
      { dia: "segunda", horarios: ["16:00", "17:00", "18:00"] },
      { dia: "quarta",  horarios: ["16:00", "17:00"] },
      { dia: "sexta",   horarios: ["16:00", "17:00", "18:00"] }
    ],
  },
  {
    nome: "Dra. Camila Rodrigues",
    crp: "08/55102",
    email: "camila@psicologia.com",
    telefone: "(41) 97654-2233",
    formacao: "Especialista em Saúde Mental no Trabalho pela PUC-PR",
    descricao: "Foco em burnout, estresse ocupacional e reequilíbrio emocional para profissionais. Atendo exclusivamente online.",
    foto: "https://randomuser.me/api/portraits/women/36.jpg",
    preco: 190,
    modalidade: "online",
    avaliacao: 4.9,
    totalAvaliacoes: 43,
    validado: true,
    abordagens: ["Terapia Cognitivo-Comportamental (TCC)", "Mindfulness"],
    especializacoes: ["Burnout", "Estresse ocupacional", "Qualidade de vida"],
    localizacao: { cidade: "Curitiba", estado: "PR", endereco: "Atendimento online" },
    disponibilidade: [
      { dia: "terca",  horarios: ["12:00", "13:00", "19:00", "20:00"] },
      { dia: "quinta", horarios: ["12:00", "13:00", "19:00"] },
      { dia: "sabado", horarios: ["09:00", "10:00", "11:00"] }
    ],
  },
  {
    nome: "Dr. Lucas Pereira",
    crp: "03/41987",
    email: "lucas@psicologia.com",
    telefone: "(85) 98890-6655",
    formacao: "Especialista em Terapia Familiar Sistêmica pelo IBMR",
    descricao: "Atendo indivíduos, casais e famílias. Experiência com conflitos familiares, comunicação e dinâmicas relacionais.",
    foto: "https://randomuser.me/api/portraits/men/47.jpg",
    preco: 140,
    modalidade: "presencial",
    avaliacao: 4.7,
    totalAvaliacoes: 33,
    validado: true,
    abordagens: ["Terapia Sistêmica", "Psicologia Existencial"],
    especializacoes: ["Conflitos familiares", "Terapia de casal", "Comunicação"],
    localizacao: { cidade: "Fortaleza", estado: "CE", endereco: "Av. Dom Luís, 300 - Aldeota" },
    disponibilidade: [
      { dia: "segunda", horarios: ["09:00", "10:00", "11:00"] },
      { dia: "quarta",  horarios: ["09:00", "10:00"] },
      { dia: "quinta",  horarios: ["14:00", "15:00", "16:00"] }
    ],
  },
  {
    nome: "Dra. Mariana Santos",
    crp: "04/87630",
    email: "mariana@psicologia.com",
    telefone: "(31) 98123-4499",
    formacao: "Especialista em Psicologia Analítica pelo Instituto Jung de São Paulo",
    descricao: "Trabalho com processos de individuação, sonhos e imaginação ativa. Atendo adultos que buscam aprofundamento no autoconhecimento.",
    foto: "https://randomuser.me/api/portraits/women/57.jpg",
    preco: 210,
    modalidade: "online",
    avaliacao: 4.8,
    totalAvaliacoes: 26,
    validado: true,
    abordagens: ["Psicologia Analítica (Jung)", "Mindfulness"],
    especializacoes: ["Autoconhecimento", "Crise de meia-idade", "Espiritualidade"],
    localizacao: { cidade: "Belo Horizonte", estado: "MG", endereco: "Atendimento online" },
    disponibilidade: [
      { dia: "segunda", horarios: ["10:00", "11:00"] },
      { dia: "terca",   horarios: ["14:00", "15:00", "16:00"] },
      { dia: "quinta",  horarios: ["10:00", "11:00", "14:00"] }
    ],
  },
  {
    nome: "Dr. Thiago Costa",
    crp: "16/22315",
    email: "thiago@psicologia.com",
    telefone: "(62) 97890-1122",
    formacao: "Certificado em EMDR pelo EMDR Institute Brasil",
    descricao: "Especialista em trauma e estresse pós-traumático. Utilizo EMDR e TCC para ajudar pessoas a processar experiências difíceis.",
    foto: "https://randomuser.me/api/portraits/men/29.jpg",
    preco: 230,
    modalidade: "ambos",
    avaliacao: 5.0,
    totalAvaliacoes: 19,
    validado: true,
    abordagens: ["EMDR", "Terapia Cognitivo-Comportamental (TCC)"],
    especializacoes: ["TEPT", "Trauma", "Abuso e violência"],
    localizacao: { cidade: "Goiânia", estado: "GO", endereco: "Rua 68, 150 - Setor Sul" },
    disponibilidade: [
      { dia: "segunda", horarios: ["13:00", "14:00", "15:00"] },
      { dia: "quarta",  horarios: ["13:00", "14:00", "15:00"] },
      { dia: "sexta",   horarios: ["13:00", "14:00"] }
    ],
  },
  {
    nome: "Dra. Isabela Ferreira",
    crp: "12/30874",
    email: "isabela@psicologia.com",
    telefone: "(48) 96543-8877",
    formacao: "Especialista em Psicoterapia Positiva pela UFSC",
    descricao: "Atendo adultos e jovens adultos com foco em autoestima, assertividade e desenvolvimento pessoal. Abordagem humanista e acolhedora.",
    foto: "https://randomuser.me/api/portraits/women/14.jpg",
    preco: 155,
    modalidade: "online",
    avaliacao: 4.6,
    totalAvaliacoes: 11,
    validado: true,
    abordagens: ["Mindfulness", "Terapia Cognitivo-Comportamental (TCC)"],
    especializacoes: ["Autoestima", "Assertividade", "Desenvolvimento pessoal"],
    localizacao: { cidade: "Florianópolis", estado: "SC", endereco: "Atendimento online" },
    disponibilidade: [
      { dia: "terca",  horarios: ["17:00", "18:00", "19:00"] },
      { dia: "quarta", horarios: ["17:00", "18:00"] },
      { dia: "sexta",  horarios: ["17:00", "18:00", "19:00"] }
    ],
  },
];

export async function GET() {
  try {
    await connectDB();

    await Psicologo.deleteMany({});
    await Psicologo.insertMany(psicologos);

    return Response.json({
      success: true,
      message: `${psicologos.length} psicólogos inseridos com sucesso.`,
    });
  } catch (err) {
    console.error(err);
    return Response.json({ success: false, error: err.message }, { status: 500 });
  }
}
