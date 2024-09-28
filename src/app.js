const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Carrega as variáveis de ambiente
dotenv.config();

const app = express();

// Adicione isso no início do arquivo, antes de qualquer outra rota ou middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Middleware para logging de todas as requisições
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Configuração do CORS
app.use(cors({
  origin: 'http://127.0.0.1:5500', // Ajuste para a origem correta do seu frontend
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsing de JSON
app.use(express.json());

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Adicione isso antes das rotas
app.use((req, res, next) => {
    console.log('Configurando timeout para a requisição');
    res.setTimeout(60000, function(){
        console.log('Request has timed out.');
        res.status(408).send('Request Timeout');
    });
    next();
});

// Rotas
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo ao sistema de parceria de corretores de imóveis!' });
});

const authRoutes = require('./routes/auth.routes');
app.use('/api/users', authRoutes);

const propertyRoutes = require('./routes/property.routes');
app.use('/api/properties', propertyRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'Teste bem-sucedido' });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).send('Algo deu errado!');
});

// Adicione isso no final do arquivo, antes de exportar o app
app.use((err, req, res, next) => {
    console.error('Erro global:', err);
    res.status(500).json({
        status: 'error',
        message: 'Algo deu errado no servidor'
    });
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

module.exports = app;