import mongoose from 'mongoose';

const psicologoSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  crp: {
    type: String,
    required: true,
    unique: true,
    uppercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  emailProfissional: {
    type: String,
    lowercase: true,
    trim: true
  },
  telefone: String,
  formacao: String,
  descricao: String,
  foto: String,
  preco: {
    type: Number,
    required: true,
    min: 0
  },
  modalidade: {
    type: String,
    enum: ['online', 'presencial', 'ambos'],
    required: true
  },
  avaliacao: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalAvaliacoes: {
    type: Number,
    default: 0
  },
  validado: {
    type: Boolean,
    default: false
  },
  abordagens: [String],
  especializacoes: [String],
  localizacao: {
    cidade: String,
    estado: String,
    cep: String,
    endereco: String,
    loc: {
      type: { type: String, enum: ['Point'] },
      coordinates: [Number],
    },
  },
  disponibilidade: [{
    dia: {
      type: String,
      enum: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
    },
    horarios: [String]
  }],
  bloqueados: [{
    dia: {
      type: String,
      enum: ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo']
    },
    horarios: [String]
  }],
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario'
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

psicologoSchema.index({ validado: 1, preco: 1, avaliacao: -1 });
psicologoSchema.index({ 'localizacao.cidade': 1, 'localizacao.estado': 1 });
psicologoSchema.index({ abordagens: 1 });
psicologoSchema.index({ nome: 'text', descricao: 'text', especializacoes: 'text' });
psicologoSchema.index({ 'localizacao.loc': '2dsphere' }, { sparse: true });

export default mongoose.models.Psicologo || mongoose.model('Psicologo', psicologoSchema);