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
const propertyTypes = ['Casa', 'Apartamento', 'Lote', 'Comercial'];

// Array de tipos secundários
const secondaryTypes = ['Individual', 'Geminada', 'Sobrado', 'Condomínio'];

// Função para gerar uma propriedade aleatória
const generateRandomProperty = (corretorId) => ({
    title: `${propertyTypes[randomInt(0, propertyTypes.length - 1)]} em ${cities[randomInt(0, cities.length - 1)]}`,
    description: `Uma propriedade incrível com localização privilegiada.`,
    capturedBy: corretorId,
    captureDate: new Date(),
    captureCity: cities[randomInt(0, cities.length - 1)],
    captureCEP: `${randomInt(10000, 99999)}-${randomInt(100, 999)}`,
    address: `Rua ${randomInt(1, 100)}`,
    neighborhood: `Bairro ${randomInt(1, 20)}`,
    isCondominium: Math.random() < 0.5,
    block: `${randomInt(1, 10)}`,
    apartmentNumber: `${randomInt(101, 1001)}`,
    propertyType: propertyTypes[randomInt(0, propertyTypes.length - 1)],
    secondaryType: secondaryTypes[randomInt(0, secondaryTypes.length - 1)],
    totalArea: randomInt(50, 500),
    builtArea: randomInt(30, 400),
    bedrooms: randomInt(1, 5),
    suites: randomInt(0, 3),
    socialBathrooms: randomInt(1, 3),
    hasBackyard: Math.random() < 0.5,
    hasBalcony: Math.random() < 0.5,
    hasElevator: Math.random() < 0.3,
    floors: randomInt(1, 3),
    floor: randomInt(1, 20),
    occupancyStatus: ['Ocupado', 'Desocupado', 'Inquilino'][randomInt(0, 2)],
    keyLocation: `Local ${randomInt(1, 5)}`,
    ownerName: `Proprietário ${randomInt(1, 100)}`,
    ownerContact: `(${randomInt(11, 99)}) 9${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
    salePrice: randomPrice(),
    desiredNetPrice: randomPrice(),
    exclusivityContract: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 dias a partir de hoje
        hasPromotion: Math.random() < 0.3
    },
    differentials: 'Diferenciais da propriedade',
    landmarks: 'Pontos de referência próximos',
    generalObservations: 'Observações gerais sobre a propriedade',
    images: [`https://placehold.co/600x400?text=${encodeURIComponent(propertyTypes[randomInt(0, propertyTypes.length - 1)])}`],
    featured: Math.random() < 0.2, // 20% de chance de ser destaque
    status: ['disponível', 'vendido', 'alugado'][randomInt(0, 2)],
    views: randomInt(0, 1000),
});

async function createSampleUsers() {
    try {
        await User.deleteMany({}); // Limpa usuários existentes
        
        const corretor = await User.create({
            name: 'Corretor Exemplo',
            email: 'corretor@exemplo.com',
            password: 'senha123',
            role: 'corretor'
        });

        console.log('Usuário corretor de exemplo criado com sucesso');
        return { corretor: corretor._id };
    } catch (error) {
        console.error('Erro ao criar usuário corretor de exemplo:', error);
        throw error;
    }
}

async function seedDatabase() {
    try {
        const { corretor } = await createSampleUsers();

        await Property.deleteMany({});
        console.log('Propriedades existentes removidas');

        const numberOfProperties = 50; // Altere este número para adicionar mais ou menos propriedades
        const propertiesToInsert = Array(numberOfProperties).fill().map(() => generateRandomProperty(corretor));

        const createdProperties = await Property.insertMany(propertiesToInsert);
        console.log(`${createdProperties.length} propriedades inseridas com sucesso`);

    } catch (error) {
        console.error('Erro ao popular o banco de dados:', error);
    } finally {
        mongoose.connection.close();
    }
}

seedDatabase();