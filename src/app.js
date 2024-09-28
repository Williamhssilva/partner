const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Carrega as variáveis de ambiente
dotenv.config();

const app = express();

// Use cors antes de outras middlewares e rotas
app.use(cors());

// Middleware para parsing de JSON
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo ao sistema de parceria de corretores de imóveis!' });
});

// Incluir rotas de autenticação
const authRoutes = require('./routes/auth.routes');
app.use('/api/auth', authRoutes);

// Incluir rotas para imóveis
const propertyRoutes = require('./routes/property.routes');
app.use('/api/properties', propertyRoutes);

// Adicione esta linha após a declaração de authRoutes
app.use('/api/users', authRoutes);

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, '../public')));

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;