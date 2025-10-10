import mongoose from "mongoose";
import { MongoURI } from "./config.js";

// 1. Configuración de eventos de conexión
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose conectado a MongoDB');
  console.log(`📍 Host: ${mongoose.connection.host}`);
  console.log(`📂 Base de datos: ${mongoose.connection.name}`);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de conexión en Mongoose:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose desconectado de MongoDB');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 Mongoose reconectado a MongoDB');
});

// 2. Función de conexión mejorada
export const connectDB = async () => {
  try {
    // Opciones de conexión optimizadas
    const options = {
      maxPoolSize: 10,           // Máximo de conexiones simultáneas
      minPoolSize: 2,            // Mínimo de conexiones en el pool
      serverSelectionTimeoutMS: 10000,  // Timeout para selección de servidor
      socketTimeoutMS: 45000,    // Timeout para operaciones
      family: 4,                 // Usar IPv4
      retryWrites: true,         // Reintentar escrituras fallidas
      retryReads: true,          // Reintentar lecturas fallidas
    };

    await mongoose.connect(MongoURI, options);
    console.log('🚀 MongoDB conectado correctamente');
    
  } catch (error) {
    console.error('💥 FALLA CRÍTICA en conexión MongoDB:', error.message);
    console.error('Detalles del error:', error);
    
    // Terminar el proceso si no se puede conectar
    process.exit(1);
  }
};

// 3. Manejo de cierre graceful de la aplicación
const gracefulShutdown = async (signal) => {
  console.log(`\n⚠️  Señal ${signal} recibida. Cerrando conexiones...`);
  
  try {
    await mongoose.connection.close();
    console.log('🔌 Conexión a MongoDB cerrada correctamente');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error al cerrar conexión MongoDB:', err.message);
    process.exit(1);
  }
};

// Escuchar diferentes señales de terminación
process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Ctrl+C
process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Kill command
process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')); // Nodemon restart

// 4. Manejo de errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Excepción no capturada:', error);
  gracefulShutdown('uncaughtException');
});

// 5. Función auxiliar para verificar el estado de conexión
export const isConnected = () => {
  return mongoose.connection.readyState === 1;
};

// 6. Función para obtener información de la conexión
export const getConnectionInfo = () => {
  return {
    isConnected: isConnected(),
    host: mongoose.connection.host,
    name: mongoose.connection.name,
    readyState: mongoose.connection.readyState,
    models: Object.keys(mongoose.connection.models)
  };
};

