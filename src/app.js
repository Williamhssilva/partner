const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const Property = require('./models/property.model'); // Adicione esta linha
const leadRoutes = require('./routes/lead.routes');
const adminRoutes = require('./routes/admin.routes');
const errorHandler = require('./middleware/error');

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
  origin: 'https://williamhssilva.github.io', // Ajuste para a origem correta do seu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Servir arquivos estáticos da pasta frontend
app.use(express.static(path.join(__dirname, '../../frontend')));

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000
})
.then(() => {
    console.log('Conectado ao MongoDB');
    console.log('URI de conexão:', process.env.MONGODB_URI.replace(/\/\/[^:]+:[^@]+@/, '//****:****@')); // Oculta as credenciais
})
.catch(err => {
    console.error('Erro detalhado ao conectar ao MongoDB:', err);
    process.exit(1);
});

mongoose.connection.on('error', err => {
    console.error('Erro na conexão com o MongoDB:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('Desconectado do MongoDB');
});

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

// Use as rotas de leads
app.use('/api/leads', leadRoutes);

app.use('/api/admin', adminRoutes);

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

// Adicione isso após todas as suas rotas
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Algo deu errado no servidor'
  });
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Adicione a rota de teste de banco de dados
app.get('/api/dbtest', async (req, res) => {
  try {
    const startTime = Date.now();
    const count = await Property.countDocuments();
    const endTime = Date.now();
    res.json({ 
      message: 'Teste de banco de dados bem-sucedido',
      count: count,
      time: `${endTime - startTime}ms`
    });
  } catch (error) {
    console.error('Erro no teste de banco de dados:', error);
    res.status(500).json({ 
      message: 'Erro no teste de banco de dados',
      error: error.message
    });
  }
});

// Servir arquivos estáticos da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Adicione o middleware de tratamento de erros
app.use(errorHandler);

module.exports = app;