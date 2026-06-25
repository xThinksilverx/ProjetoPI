import mongoose from 'mongoose';

const avaliacaoSchema = new mongoose.Schema({
  psicologoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Psicologo',
    required: true
  },
  usuarioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuario',
    required: true
  },
  nota: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

avaliacaoSchema.index({ psicologoId: 1, usuarioId: 1 }, { unique: true });

export default mongoose.models.Avaliacao || mongoose.model('Avaliacao', avaliacaoSchema);
