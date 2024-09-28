const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Carrega as variáveis de ambiente
dotenv.config();

const app = express();

// Middleware para parsing de JSON
app.use(express.json());

// Conectar ao MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Conectado ao MongoDB'))
.catch((err) => console.error('Erro ao conectar ao MongoDB:', err));

// Rota de teste
app.get('/', (req, res) => {
  res.json({ message: 'Bem-vindo ao sistema de parceria de corretores de imóveis!' });
});

// Iniciar o servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

// Incluir rotas para imóveis
const propertyRoutes = require('./routes/property.routes');
app.use('/api/properties', propertyRoutes);

module.exports = app;