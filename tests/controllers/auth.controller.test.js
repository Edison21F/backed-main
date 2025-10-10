import request from 'supertest';
import mongoose from 'mongoose';
import User from '../../src/models/user.model.js';
import Estudiante from '../../src/models/estudiante.model.js';
import Docente from '../../src/models/docente.model.js';
import app from '../../src/app.js';

describe('Auth Controller', () => {
  describe('POST /api/register', () => {
    it('should register a new student successfully', async () => {
      const userData = {
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan.perez@example.com',
        cedula: '1234567890',
        telefono: '0987654321',
        password: 'password123',
        rol: 'estudiante'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.nombres).toBe(userData.nombres);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.rol).toBe(userData.rol);

      // Verificar que se creó el usuario en la base de datos
      const user = await User.findOne({ email: userData.email });
      expect(user).toBeTruthy();
      expect(user.nombres).toBe(userData.nombres);

      // Verificar que se creó el perfil de estudiante
      const estudiante = await Estudiante.findOne({ usuarioId: user._id });
      expect(estudiante).toBeTruthy();
    });

    it('should register a new teacher successfully', async () => {
      const userData = {
        nombres: 'María',
        apellidos: 'García',
        email: 'maria.garcia@example.com',
        cedula: '0987654321',
        telefono: '0987654321',
        password: 'password123',
        rol: 'docente'
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.rol).toBe('docente');

      // Verificar que se creó el perfil de docente
      const user = await User.findOne({ email: userData.email });
      const docente = await Docente.findOne({ usuarioId: user._id });
      expect(docente).toBeTruthy();
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        nombres: 'Test',
        apellidos: 'User',
        email: 'duplicate@example.com',
        cedula: '1234567890',
        password: 'password123',
        rol: 'estudiante'
      };

      // Crear primer usuario
      await request(app)
        .post('/api/register')
        .send(userData)
        .expect(200);

      // Intentar crear segundo usuario con mismo email
      const response = await request(app)
        .post('/api/register')
        .send({
          ...userData,
          cedula: '0987654321' // Diferente cédula
        })
        .expect(400);

      expect(response.body).toEqual(["Email already exists"]);
    });

    it('should fail with duplicate cedula', async () => {
      const userData = {
        nombres: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        cedula: '1234567890',
        password: 'password123',
        rol: 'estudiante'
      };

      // Crear primer usuario
      await request(app)
        .post('/api/register')
        .send(userData)
        .expect(200);

      // Intentar crear segundo usuario con misma cédula
      const response = await request(app)
        .post('/api/register')
        .send({
          ...userData,
          email: 'test2@example.com' // Diferente email
        })
        .expect(400);

      expect(response.body).toEqual(["Cédula already exists"]);
    });

    it('should set default role to estudiante', async () => {
      const userData = {
        nombres: 'Default',
        apellidos: 'Role',
        email: 'default@example.com',
        cedula: '1122334455',
        password: 'password123'
        // Sin especificar rol
      };

      const response = await request(app)
        .post('/api/register')
        .send(userData)
        .expect(200);

      expect(response.body.user.rol).toBe('estudiante');
    });
  });

  describe('POST /api/login', () => {
    beforeEach(async () => {
      // Crear usuario para login
      await request(app)
        .post('/api/register')
        .send({
          nombres: 'Login',
          apellidos: 'Test',
          email: 'login@example.com',
          cedula: '1234567890',
          password: 'password123',
          rol: 'estudiante'
        });
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.email).toBe('login@example.com');
      expect(response.body.user.nombres).toBe('Login');
    });

    it('should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        })
        .expect(400);

      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        })
        .expect(400);

      expect(response.body.message).toBe('User not found');
    });
  });

  describe('GET /api/profile', () => {
    let token;

    beforeEach(async () => {
      // Crear usuario y obtener token
      const registerResponse = await request(app)
        .post('/api/register')
        .send({
          nombres: 'Profile',
          apellidos: 'Test',
          email: 'profile@example.com',
          cedula: '1234567890',
          password: 'password123',
          rol: 'estudiante'
        });

      token = registerResponse.body.token;
    });

    it('should get user profile successfully', async () => {
      const response = await request(app)
        .get('/api/profile')
        .set('Cookie', `token=${token}`)
        .expect(200);

      expect(response.body.id).toBeDefined();
      expect(response.body.nombres).toBe('Profile');
      expect(response.body.email).toBe('profile@example.com');
      expect(response.body.password).toBeUndefined(); // No debe incluir password
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/profile')
        .expect(401);
    });
  });

  describe('PUT /api/profile', () => {
    let token;
    let userId;

    beforeEach(async () => {
      // Crear usuario y obtener token
      const registerResponse = await request(app)
        .post('/api/register')
        .send({
          nombres: 'Update',
          apellidos: 'Profile',
          email: 'update@example.com',
          cedula: '1234567890',
          telefono: '0987654321',
          password: 'password123',
          rol: 'estudiante'
        });

      token = registerResponse.body.token;
      userId = registerResponse.body.user.id;
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        nombres: 'Updated',
        apellidos: 'Name',
        telefono: '0999999999'
      };

      const response = await request(app)
        .put('/api/profile')
        .set('Cookie', `token=${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(userId);
      expect(response.body.nombres).toBe(updateData.nombres);
      expect(response.body.apellidos).toBe(updateData.apellidos);
      expect(response.body.telefono).toBe(updateData.telefono);
    });
  });

  describe('POST /api/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/logout')
        .expect(200);

      expect(response.status).toBe(200);
    });
  });
});