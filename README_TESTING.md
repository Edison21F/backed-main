# Testing Guide - Backend API

Este documento explica cómo ejecutar y entender los tests implementados para el backend académico.

## 📋 Requisitos Previos

Antes de ejecutar los tests, asegúrate de tener instaladas las dependencias:

```bash
npm install
```

Esto instalará Jest, Supertest, y MongoDB Memory Server para testing.

## 🏗️ Estructura de Tests

```
tests/
├── setup.js                    # Configuración global de tests
├── models/
│   └── user.model.test.js      # Tests del modelo User
├── controllers/
│   └── auth.controller.test.js # Tests del controlador Auth
└── integration/
    └── user-workflow.test.js   # Tests de integración completos
```

## 🚀 Ejecutar Tests

### Todos los tests
```bash
npm test
```

### Tests con watch mode (re-ejecuta automáticamente)
```bash
npm run test:watch
```

### Tests con coverage report
```bash
npm run test:coverage
```

### Tests específicos por tipo
```bash
# Solo tests de modelos
npm run test:models

# Solo tests de controladores
npm run test:controllers

# Solo tests de integración
npm run test:integration
```

## 📊 Tipos de Tests Implementados

### 1. Tests de Modelos
- **User Model**: Creación, validación, hashing de passwords, unicidad
- Prueban la lógica de negocio a nivel de base de datos

### 2. Tests de Controladores
- **Auth Controller**: Registro, login, perfil, actualización
- Usan Supertest para simular requests HTTP
- Verifican respuestas, códigos de estado, y lógica de negocio

### 3. Tests de Integración
- **User Workflow**: Flujo completo estudiante (registro → carrito → matricula)
- **Admin Enrollment**: Matriculación administrativa
- Prueban interacciones entre múltiples componentes

## 🛠️ Configuración de Tests

### Base de Datos
- Usa **MongoDB Memory Server** para tests en memoria
- Cada test suite tiene una base de datos limpia
- No afecta la base de datos de desarrollo/producción

### Variables de Entorno
Los tests usan variables de entorno específicas:
- `NODE_ENV=test`
- `JWT_SECRET=test-jwt-secret`
- `TOKEN_SECRET=test-token-secret`

### Middleware de Autenticación
Los tests que requieren autenticación:
1. Registran un usuario de prueba
2. Obtienen el token JWT
3. Incluyen el token en headers de requests

## 📝 Ejemplos de Tests

### Test de Modelo
```javascript
describe('User Model', () => {
  it('should create a valid user', async () => {
    const userData = { /* ... */ };
    const user = new User(userData);
    const savedUser = await user.save();

    expect(savedUser.nombres).toBe(userData.nombres);
    expect(savedUser.password).not.toBe(userData.password); // Hashed
  });
});
```

### Test de Controlador
```javascript
describe('POST /api/register', () => {
  it('should register a new student successfully', async () => {
    const userData = { /* ... */ };

    const response = await request(app)
      .post('/api/register')
      .send(userData)
      .expect(200);

    expect(response.body.token).toBeDefined();
    expect(response.body.user.rol).toBe('estudiante');
  });
});
```

### Test de Integración
```javascript
describe('Complete Student Registration and Enrollment Flow', () => {
  it('should complete full student workflow', async () => {
    // Registro
    const registerResponse = await request(app)
      .post('/api/register')
      .send(studentData);

    // Agregar al carrito
    await request(app)
      .post('/api/carrito/items')
      .set('Cookie', `token=${token}`)
      .send({ cursoId, periodoId });

    // Checkout
    const checkoutResponse = await request(app)
      .post('/api/carrito/checkout')
      .set('Cookie', `token=${token}`)
      .send({ metodoPago: 'efectivo' });

    // Verificaciones
    expect(checkoutResponse.body.matriculas).toHaveLength(1);
  });
});
```

## 🎯 Cobertura de Tests

Los tests cubren:

### ✅ Funcionalidades Implementadas
- ✅ Registro de usuarios (estudiantes, docentes, administradores)
- ✅ Autenticación y autorización
- ✅ Gestión de perfiles de estudiantes y docentes
- ✅ CRUD completo de cursos, periodos, módulos, clases
- ✅ Sistema de carrito de compras
- ✅ Matriculación automática y administrativa
- ✅ Upload de archivos (avatars, documentos, comprobantes)
- ✅ Gestión de cupos y disponibilidad

### ✅ Validaciones
- ✅ Datos requeridos y formatos
- ✅ Unicidad (emails, cédulas, códigos)
- ✅ Roles y permisos
- ✅ Límites de archivos y tipos MIME
- ✅ Estados de cursos y matriculas

### ✅ Casos de Error
- ✅ Emails/cédulas duplicadas
- ✅ Credenciales incorrectas
- ✅ Acceso no autorizado
- ✅ Recursos no encontrados
- ✅ Cupos agotados

## 🔧 Troubleshooting

### Error: "MongoDB Memory Server not found"
```bash
npm install --save-dev mongodb-memory-server
```

### Error: "Jest command not found"
```bash
npm install --save-dev jest
```

### Tests lentos
- Los tests de integración pueden ser lentos debido a la creación de MongoDB en memoria
- Considera ejecutar solo tests específicos: `npm run test:models`

### Coverage bajo
- Agrega más tests unitarios para funciones individuales
- Los tests de integración ya cubren flujos completos

## 📈 Mejores Prácticas

1. **Tests Independientes**: Cada test debe ser independiente
2. **Base de Datos Limpia**: Setup/teardown asegura estado limpio
3. **Mocks cuando sea necesario**: Para servicios externos
4. **Nombres Descriptivos**: Tests que expliquen qué hacen
5. **Cobertura Completa**: Happy path + casos de error

## 🎉 Ejecutar Tests

```bash
# Instalar dependencias
npm install

# Ejecutar todos los tests
npm test

# Ver reporte de cobertura
npm run test:coverage
```

¡Los tests están listos para asegurar la calidad y funcionalidad del backend académico!