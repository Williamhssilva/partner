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
    required: [true, 'Por favor, forneça um nome'] 
  },
  email: { 
    type: String, 
    required: [true, 'Por favor, forneça um email'], 
    unique: true,
    lowercase: true,
    trim: true
  },
  password: { 
    type: String, 
    required: [true, 'Por favor, forneça uma senha'],
    minlength: 8,
    select: false
  },
  role: { 
    type: String, 
    enum: ['cliente', 'corretor', 'administrador'],
    default: 'cliente'
  },
  isApproved: { 
    type: Boolean, 
    default: function() {
      return this.role !== 'corretor'; // Aprovação automática para clientes e administradores
    }
  },
  createdAt: { 
    type: Date, 
    default: Date.now
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
  try {
    return await bcrypt.compare(candidatePassword, userPassword);
  } catch (error) {
    console.error('Erro ao comparar senhas');
    return false;
  }
};

const User = mongoose.model('User', userSchema);

module.exports = User;