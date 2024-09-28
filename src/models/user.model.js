const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schema do usuário.
 * @typedef {Object} UserSchema
 * @property {string} name - Nome completo do usuário.
 * @property {string} email - Endereço de e-mail do usuário (único).
 * @property {string} password - Senha do usuário (hash).
 * @property {string} role - Papel do usuário (corretor ou administrador).
 * @property {Date} createdAt - Data de criação do usuário.
 * @property {Date} updatedAt - Data da última atualização do usuário.
 */
const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Nome é obrigatório'] 
  },
  email: { 
    type: String, 
    required: [true, 'E-mail é obrigatório'], 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Senha é obrigatória'],
    minlength: 6,
    select: false
  },
  role: { 
    type: String, 
    enum: ['cliente', 'agente', 'admin'], // Ajuste conforme necessário
    required: true
  }
}, {
  timestamps: true
});

/**
 * Middleware para hash da senha antes de salvar.
 * @function
 * @name pre<save>
 * @memberof UserSchema
 */
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/**
 * Verifica se a senha fornecida corresponde à senha do usuário.
 * @function
 * @name correctPassword
 * @memberof UserSchema
 * @param {string} candidatePassword - Senha fornecida para verificação.
 * @param {string} userPassword - Senha hash armazenada do usuário.
 * @returns {Promise<boolean>} Verdadeiro se as senhas corresponderem, falso caso contrário.
 */
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model('User', userSchema);

module.exports = User;