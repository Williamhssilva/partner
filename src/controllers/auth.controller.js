const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * Gera um token JWT para o usuário.
 * @param {string} id - ID do usuário.
 * @returns {string} Token JWT.
 */
const signToken = (id) => {
  console.log('Criando token com expiração:', process.env.JWT_EXPIRES);
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES || '1d'
  });
};

/**
 * Registra um novo usuário.
 * @param {Object} req - Objeto de requisição Express.
 * @param {Object} res - Objeto de resposta Express.
 * @returns {Object} Resposta JSON com token e dados do usuário.
 */
exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: req.body.role
    });

    const token = signToken(newUser._id);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      }
    });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Este endereço de e-mail já está em uso. Por favor, use outro e-mail.'
      });
    }
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

/**
 * Autentica um usuário existente.
 * @param {Object} req - Objeto de requisição Express.
 * @param {Object} res - Objeto de resposta Express.
 * @returns {Object} Resposta JSON com token e dados do usuário.
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Por favor, forneça email e senha'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Email ou senha incorretos'
      });
    }

    if (!user.isApproved) {
      return res.status(401).json({
        status: 'fail',
        message: 'Olá, seja bem-vindo! Sua conta ainda não foi aprovada. Aguarde a aprovação.'
      });
    }

    const token = signToken(user._id);
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isApproved: user.isApproved
        }
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    res.status(400).json({
      status: 'fail',
      message: 'Erro ao fazer login'
    });
  }
};

/**
 * Obtém o perfil do usuário atualmente autenticado.
 * @param {Object} req - Objeto de requisição Express.
 * @param {Object} res - Objeto de resposta Express.
 */
exports.getMe = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        isApproved: req.user.isApproved
      }
    }
  });
};

/**
 * Protege a rota para apenas usuários autenticados.
 * @param {Object} req - Objeto de requisição Express.
 * @param {Object} res - Objeto de resposta Express.
 * @param {Function} next - Função de callback para prosseguir com a requisição.
 */
exports.protect = async (req, res, next) => {
    console.log('2.1 Iniciando middleware protect');
    let token;

    try {
        console.log('2.2 Verificando headers:', JSON.stringify(req.headers));
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('2.3 Token extraído:', token.substring(0, 10) + '...');
        } else {
            console.log('2.3 Token não encontrado no header');
        }

        if (!token) {
            console.log('2.4 Token não encontrado');
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }

        // ... resto do código ...

    } catch (err) {
        console.error('2.11 Erro no middleware protect:', err);
        return res.status(500).json({ message: 'Server error in authentication' });
    }
};

/**
 * Restringe acesso a rota para apenas usuários com certos papéis.
 * @param {...string} roles - Papéis que permitem acesso à rota.
 */
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // Implementação da restrição de acesso baseada em papéis
  };
};

/**
 * Aprova um agente.
 * @param {Object} req - Objeto de requisição Express.
 * @param {Object} res - Objeto de resposta Express.
 */
exports.approveAgent = async (req, res) => {
    console.log('4. Função approveAgent iniciada');
    try {
        console.log(`4.1 Aprovando agente com ID: ${req.params.id}`);
        
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { isApproved: true },
            { new: true, runValidators: true }
        );
        
        if (!user) {
            console.log('4.2 Usuário não encontrado');
            return res.status(404).json({
                status: 'fail',
                message: 'Nenhum usuário encontrado com esse ID'
            });
        }
        
        console.log('4.3 Usuário aprovado:', user);
        res.status(200).json({
            status: 'success',
            message: 'Agente aprovado com sucesso',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isApproved: user.isApproved
                }
            }
        });
    } catch (err) {
        console.error('4.4 Erro ao aprovar agente:', err);
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

/**
 * Obtém os corretores pendentes de aprovação.
 * @param {Object} req - Objeto de requisição Express.
 * @param {Object} res - Objeto de resposta Express.
 */
exports.getPendingAgents = async (req, res) => {
  console.log('Iniciando getPendingAgents');
  try {
    const pendingAgents = await User.find({ role: 'corretor', isApproved: false });
    console.log('Agentes pendentes encontrados:', pendingAgents.length);
    res.status(200).json({
      status: 'success',
      data: {
        pendingAgents
      }
    });
  } catch (err) {
    console.error('Erro ao obter corretores pendentes:', err);
    res.status(500).json({
      status: 'error',
      message: 'Erro ao obter corretores pendentes'
    });
  }
};

/**
 * Aprova um agente sem autenticação.
 * @param {Object} req - Objeto de requisição Express.
 * @param {Object} res - Objeto de resposta Express.
 */
exports.approveAgentNoAuth = async (req, res) => {
    console.log('Função approveAgentNoAuth iniciada');
    try {
        const { id } = req.params;
        console.log(`Aprovando agente com ID: ${id}`);
        
        const user = await User.findByIdAndUpdate(
            id,
            { isApproved: true },
            { new: true, runValidators: true }
        );
        
        if (!user) {
            console.log('Usuário não encontrado');
            return res.status(404).json({
                status: 'fail',
                message: 'Nenhum usuário encontrado com esse ID'
            });
        }
        
        console.log('Usuário aprovado:', user);
        res.status(200).json({
            status: 'success',
            message: 'Agente aprovado com sucesso',
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    isApproved: user.isApproved
                }
            }
        });
    } catch (err) {
        console.error('Erro ao aprovar agente:', err);
        res.status(400).json({
            status: 'fail',
            message: err.message
        });
    }
};

/**
 * Obtém os corretores pendentes de aprovação.
 * @param {Object} req - Objeto de requisição Express.
 * @param {Object} res - Objeto de resposta Express.
 */
exports.rejectAgent = async (req, res, next) => {
    try {
        console.log(`Tentando rejeitar agente com ID: ${req.params.id}`);
        const user = await User.findById(req.params.id);

        if (!user) {
            console.log('Usuário não encontrado');
            return res.status(404).json({
                status: 'fail',
                message: 'Usuário não encontrado'
            });
        }

        console.log(`Usuário encontrado: ${user.name}, role: ${user.role}, isApproved: ${user.isApproved}`);

        if (user.role !== 'corretor' || user.isApproved) {
            console.log('Usuário não é um corretor pendente');
            return res.status(400).json({
                status: 'fail',
                message: 'Usuário não é um corretor pendente'
            });
        }

        // Remover o usuário do banco de dados
        console.log('Tentando remover o usuário');
        await User.deleteOne({ _id: user._id });

        console.log('Usuário removido com sucesso');
        res.status(200).json({
            status: 'success',
            message: 'Corretor rejeitado com sucesso'
        });
    } catch (error) {
        console.error('Erro ao rejeitar corretor:', error);
        res.status(500).json({
            status: 'error',
            message: 'Erro interno do servidor ao rejeitar corretor'
        });
    }
};