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
    console.log('1. Iniciando middleware protect');
    let token;

    try {
        console.log('2. Headers da requisição:', req.headers);
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
            console.log('3. Token extraído:', token.substring(0, 10) + '...');
        }

        if (!token) {
            console.log('4. Token não encontrado');
            return res.status(401).json({ status: 'error', message: 'Usuário não autenticado' });
        }

        console.log('5. JWT_SECRET (primeiros 5 caracteres):', process.env.JWT_SECRET.substring(0, 5));
        
        let decoded;
        try {
            console.log('6. Verificando token');
            decoded = jwt.verify(token, process.env.JWT_SECRET);
            console.log('7. Token decodificado:', decoded);
        } catch (jwtError) {
            console.error('8. Erro ao verificar token:', jwtError);
            return res.status(401).json({ status: 'error', message: 'Token inválido', error: jwtError.message });
        }

        console.log('9. Buscando usuário');
        const user = await User.findById(decoded.id).select('-password');
        
        if (!user) {
            console.log('10. Usuário não encontrado');
            return res.status(404).json({ status: 'error', message: 'Usuário não encontrado' });
        }

        console.log('11. Usuário autenticado:', user);
        req.user = user;
        next();
    } catch (err) {
        console.error('12. Erro no middleware protect:', err);
        res.status(500).json({ status: 'error', message: 'Erro do servidor na autenticação' });
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