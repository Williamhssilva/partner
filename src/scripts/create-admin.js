const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const updateOrCreateAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI não está definido no arquivo .env');
    }

    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Conectado ao MongoDB');

    const adminEmail = 'admin@parcero.com';
    const adminPassword = 'admin123'; // Você deve alterar esta senha
    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    const updatedUser = await User.findOneAndUpdate(
      { email: adminEmail },
      {
        name: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        role: 'administrador',
        isApproved: true
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Usuário administrador atualizado/criado com sucesso');

  } catch (error) {
    console.error('Erro ao atualizar/criar usuário administrador:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Conexão com o MongoDB fechada');
  }
};

updateOrCreateAdmin();