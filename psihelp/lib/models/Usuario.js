import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const usuarioSchema = new mongoose.Schema({
  nome: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  senha: {
    type: String,
    required: true
  },
  tipo: {
    type: String,
    enum: ['paciente', 'psicologo', 'admin'],
    default: 'paciente'
  },
  telefone: String,
  dataNascimento: Date,
  genero: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  ultimoAcesso: Date,
  ativo: {
    type: Boolean,
    default: true
  }
});

usuarioSchema.pre('save', async function(next) {
  if (!this.isModified('senha')) return next();
  this.senha = await bcrypt.hash(this.senha, 10);
  next();
});

usuarioSchema.methods.comparePassword = async function(senha) {
  return await bcrypt.compare(senha, this.senha);
};

export default mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);