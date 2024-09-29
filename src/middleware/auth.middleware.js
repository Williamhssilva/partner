const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ErrorResponse = require('../utils/errorResponse');

/**
 * Middleware para proteger rotas e verificar autenticação.
 * @param {Object} req - Objeto de requisição Express.
 * @param {Object} res - Objeto de resposta Express.
 * @param {Function} next - Função next do Express.
 */
exports.protect = async (req, res, next) => {
    console.log('2.1 Iniciando middleware protect');
    let token;

    try {
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('2.3 Token extraído:', token);
        }

        if (!token) {
            return res.status(401).json({ message: 'Not authorized to access this route' });
        }

        console.log('2.4 Iniciando verificação do token');
        console.log('JWT_SECRET:', process.env.JWT_SECRET);
        
        let decoded;
        try {
            console.log('2.5 Chamando jwt.verify');
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('2.6 Token verificado com sucesso:', decoded);
        } catch (jwtError) {
            console.error('2.7 Erro ao verificar token:', jwtError);
            return res.status(401).json({ message: 'Invalid token', error: jwtError.message });
        }

        console.log('2.8 Buscando usuário no banco de dados');
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            console.log('2.9 Usuário não encontrado');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('2.10 Usuário autenticado com sucesso');
        req.user = user;
        next();
    } catch (err) {
        console.error('2.11 Erro no middleware protect:', err);
        res.status(500).json({ message: 'Server error in authentication' });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (req.user.role === 'administrador') {
            return next(); // Administrador tem acesso a tudo
        }
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: 'Você não tem permissão para acessar esta rota'
            });
        }
        next();
    };
};