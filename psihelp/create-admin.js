const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const usuarioSchema = new mongoose.Schema({
  nome: String,
  email: { type: String, unique: true, lowercase: true },
  senha: String,
  tipo: { type: String, default: 'paciente' },
  ativo: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);

async function criarAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado ao MongoDB');

    const email = 'admin@psihelp.com';
    const senha = 'admin123';

    const existe = await Usuario.findOne({ email });
    if (existe) {
      console.log('Admin já existe! Email:', email);
      process.exit(0);
    }

    const hash = await bcrypt.hash(senha, 10);
    await Usuario.create({ nome: 'Administrador', email, senha: hash, tipo: 'admin' });

    console.log('Admin criado com sucesso!');
    console.log('  Email:', email);
    console.log('  Senha:', senha);
    console.log('\nTroque a senha após o primeiro login.');
    process.exit(0);
  } catch (error) {
    console.error('Erro:', error);
    process.exit(1);
  }
}

criarAdmin();
