const mongoose = require('mongoose');
const Property = require('./models/property.model');
const User = require('./models/user.model');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

async function createSampleUsers() {
  try {
    await User.deleteMany({}); // Limpa usuários existentes
    
    const cliente = await User.create({
      name: 'Cliente Exemplo',
      email: 'cliente@exemplo.com',
      password: 'senha123',
      role: 'cliente'
    });

    const agente = await User.create({
      name: 'Agente Exemplo',
      email: 'agente@exemplo.com',
      password: 'senha123',
      role: 'agente'
    });

    console.log('Usuários de exemplo criados com sucesso');
    return { cliente: cliente._id, agente: agente._id };
  } catch (error) {
    console.error('Erro ao criar usuários de exemplo:', error);
    throw error;
  }
}

async function seedDatabase() {
  try {
    const { cliente, agente } = await createSampleUsers();

    await Property.deleteMany({});
    console.log('Propriedades existentes removidas');

    const sampleProperties = [
      {
        title: "Apartamento Luxuoso no Centro",
        description: "Lindo apartamento com vista panorâmica da cidade",
        price: 500000,
        address: {
          street: "Rua Principal, 123",
          city: "São Paulo",
          state: "SP",
          zipCode: "01000-000"
        },
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        image: "https://placehold.co/600x400?text=Apartamento+Luxuoso",
        featured: true,
        type: "Apartamento",
        user: cliente,
        agent: agente
      },
      {
        title: "Casa Espaçosa com Jardim",
        description: "Casa familiar com amplo jardim e área de lazer",
        price: 750000,
        address: {
          street: "Avenida das Flores, 456",
          city: "Rio de Janeiro",
          state: "RJ",
          zipCode: "20000-000"
        },
        bedrooms: 4,
        bathrooms: 3,
        area: 200,
        image: "https://placehold.co/600x400?text=Casa+Espaçosa",
        featured: true,
        type: "Casa",
        user: cliente,
        agent: agente
      },
      {
        title: "Studio Moderno",
        description: "Studio compacto e moderno, perfeito para solteiros",
        price: 300000,
        address: {
          street: "Rua da Inovação, 789",
          city: "Belo Horizonte",
          state: "MG",
          zipCode: "30000-000"
        },
        bedrooms: 1,
        bathrooms: 1,
        area: 45,
        image: "https://placehold.co/600x400?text=Studio+Moderno",
        featured: false,
        type: "Studio",
        user: cliente,
        agent: agente
      }
    ];

    const createdProperties = await Property.insertMany(sampleProperties);
    console.log(`${createdProperties.length} propriedades inseridas com sucesso`);

  } catch (error) {
    console.error('Erro ao popular o banco de dados:', error);
  } finally {
    mongoose.connection.close();
  }
}

seedDatabase();