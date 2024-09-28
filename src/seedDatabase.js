const mongoose = require('mongoose');
const Property = require('./models/property.model');
const User = require('./models/user.model');
const dotenv = require('dotenv');

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Conectado ao MongoDB'))
  .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Função para gerar um número aleatório dentro de um intervalo
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

// Função para gerar um preço aleatório
const randomPrice = () => randomInt(100000, 1000000);

// Array de cidades para usar nos endereços
const cities = ['São Paulo', 'Rio de Janeiro', 'Belo Horizonte', 'Salvador', 'Brasília', 'Curitiba', 'Fortaleza', 'Recife', 'Porto Alegre', 'Manaus'];

// Array de tipos de propriedades
const propertyTypes = ['Apartamento', 'Casa', 'Studio', 'Cobertura', 'Sobrado', 'Kitnet'];

// Função para gerar uma propriedade aleatória
const generateRandomProperty = (clienteId, agenteId) => ({
    title: `${propertyTypes[randomInt(0, propertyTypes.length - 1)]} em ${cities[randomInt(0, cities.length - 1)]}`,
    description: `Uma ${propertyTypes[randomInt(0, propertyTypes.length - 1)]} incrível com localização privilegiada.`,
    price: randomPrice(),
    address: {
        street: `Rua ${randomInt(1, 100)}`,
        city: cities[randomInt(0, cities.length - 1)],
        state: 'Estado',
        zipCode: `${randomInt(10000, 99999)}-${randomInt(100, 999)}`
    },
    bedrooms: randomInt(1, 5),
    bathrooms: randomInt(1, 4),
    area: randomInt(30, 300),
    image: `https://placehold.co/600x400?text=${encodeURIComponent(propertyTypes[randomInt(0, propertyTypes.length - 1)])}`,
    featured: Math.random() < 0.2, // 20% de chance de ser destaque
    type: propertyTypes[randomInt(0, propertyTypes.length - 1)],
    user: clienteId,
    agent: agenteId
});

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

        const numberOfProperties = 50; // Altere este número para adicionar mais ou menos propriedades
        const propertiesToInsert = Array(numberOfProperties).fill().map(() => generateRandomProperty(cliente, agente));

        const createdProperties = await Property.insertMany(propertiesToInsert);
        console.log(`${createdProperties.length} propriedades inseridas com sucesso`);

    } catch (error) {
        console.error('Erro ao popular o banco de dados:', error);
    } finally {
        mongoose.connection.close();
    }
}

seedDatabase();