const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const psicologoSchema = new mongoose.Schema({
  nome: String,
  crp: String,
  email: String,
  telefone: String,
  formacao: String,
  descricao: String,
  foto: String,
  preco: Number,
  modalidade: String,
  avaliacao: Number,
  validado: Boolean,
  abordagens: [String],
  especializacoes: [String],
  localizacao: {
    cidade: String,
    estado: String,
    endereco: String
  },
  disponibilidade: [{
    dia: String,
    horarios: [String]
  }],
  criadoEm: Date
});

const Psicologo = mongoose.models.Psicologo || mongoose.model('Psicologo', psicologoSchema);

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
    validado: true,
    abordagens: ["Terapia Cognitivo-Comportamental", "Mindfulness"],
    especializacoes: ["Ansiedade", "Depressão", "Transtorno de Pânico"],
    localizacao: {
      cidade: "Belo Horizonte",
      estado: "MG",
      endereco: "Atendimento online"
    },
    disponibilidade: [
      { dia: "segunda", horarios: ["09:00", "10:00", "14:00"] },
      { dia: "quarta", horarios: ["09:00", "10:00"] },
      { dia: "sexta", horarios: ["14:00", "15:00"] }
    ],
    criadoEm: new Date()
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
    validado: true,
    abordagens: ["Psicanálise Lacaniana", "Psicologia Existencial"],
    especializacoes: ["Luto", "Crise Existencial", "Relacionamentos"],
    localizacao: {
      cidade: "Rio de Janeiro",
      estado: "RJ",
      endereco: "Rua Voluntários da Pátria, 280 - Botafogo"
    },
    disponibilidade: [
      { dia: "terca", horarios: ["10:00", "11:00", "15:00"] },
      { dia: "quinta", horarios: ["10:00", "11:00"] },
      { dia: "sabado", horarios: ["09:00", "10:00"] }
    ],
    criadoEm: new Date()
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
    validado: true,
    abordagens: ["Terapia Cognitivo-Comportamental", "Terapia de Aceitação e Compromisso"],
    especializacoes: ["TDAH", "Autismo leve", "Gestão de estresse"],
    localizacao: {
      cidade: "São Paulo",
      estado: "SP",
      endereco: "Atendimento online"
    },
    disponibilidade: [
      { dia: "segunda", horarios: ["08:00", "09:00", "13:00"] },
      { dia: "terca", horarios: ["08:00", "09:00"] },
      { dia: "quinta", horarios: ["13:00", "14:00", "15:00"] }
    ],
    criadoEm: new Date()
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');
    
    await Psicologo.deleteMany({});
    console.log('Coleção limpa');
    
    await Psicologo.insertMany(psicologos);
    console.log(`${psicologos.length} psicólogos inseridos com sucesso!`);
    
    process.exit(0);
  } catch (error) {
    console.error('Erro ao seedar:', error);
    process.exit(1);
  }
}

seed();