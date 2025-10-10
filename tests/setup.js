const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');

let mongoServer;

// Setup antes de todos los tests
beforeAll(async () => {
  try {
    // Crear servidor MongoDB en memoria
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    // Conectar mongoose a la base de datos en memoria
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to in-memory MongoDB for testing');
  } catch (error) {
    console.error('❌ Error setting up test database:', error);
    throw error;
  }
});

// Cleanup después de cada test
afterEach(async () => {
  try {
    // Limpiar todas las colecciones
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  } catch (error) {
    console.error('❌ Error cleaning up test database:', error);
  }
});

// Cleanup después de todos los tests
afterAll(async () => {
  try {
    // Cerrar conexión y detener servidor
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongoServer.stop();

    console.log('✅ Disconnected from in-memory MongoDB');
  } catch (error) {
    console.error('❌ Error tearing down test database:', error);
  }
});

// Configurar variables de entorno para tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.TOKEN_SECRET = 'test-token-secret';
process.env.COOKIE_SECRET = 'test-cookie-secret';

// Mock de console.error para reducir ruido en tests
const originalConsoleError = console.error;
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Error en')) {
    // Silenciar errores de controladores durante tests
    return;
  }
  originalConsoleError.call(console, ...args);
};