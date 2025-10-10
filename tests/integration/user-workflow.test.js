import request from 'supertest';
import mongoose from 'mongoose';
import User from '../../src/models/user.model.js';
import Estudiante from '../../src/models/estudiante.model.js';
import Curso from '../../src/models/curso.model.js';
import Periodo from '../../src/models/periodo.model.js';
import Carrito from '../../src/models/carrito.model.js';
import Matricula from '../../src/models/matricula.model.js';
import app from '../../src/app.js';

describe('User Workflow Integration', () => {
  let studentToken;
  let adminToken;
  let studentId;
  let courseId;
  let periodId;

  beforeAll(async () => {
    // Crear usuario administrador para tests
    const adminData = {
      nombres: 'Admin',
      apellidos: 'Test',
      email: 'admin@example.com',
      cedula: '0000000000',
      password: 'admin123',
      rol: 'administrador'
    };

    const admin = new User(adminData);
    await admin.save();

    // Login del admin
    const adminLogin = await request(app)
      .post('/api/login')
      .send({
        email: adminData.email,
        password: adminData.password
      });

    adminToken = adminLogin.body.token;

    // Crear curso de prueba
    const courseData = {
      nombre: 'Curso de Prueba',
      codigo: 'TEST-001',
      descripcion: 'Curso para testing',
      duracionSemanas: 8,
      nivel: 'basico',
      precio: 100.00,
      requisitos: ['Ninguno'],
      objetivos: ['Aprender testing'],
      activo: true,
      cupoMaximo: 20
    };

    const course = new Curso(courseData);
    const savedCourse = await course.save();
    courseId = savedCourse._id;

    // Crear periodo de prueba
    const periodData = {
      cursoId: courseId,
      nombre: 'Periodo Test Enero 2025',
      codigo: 'TEST-001-2025-01',
      fechaInicio: new Date('2025-01-01'),
      fechaFin: new Date('2025-03-01'),
      estado: 'en_curso',
      cuposDisponibles: 20,
      cuposOcupados: 0,
      horario: 'Lunes y Miércoles 10:00-12:00'
    };

    const periodo = new Periodo(periodData);
    const savedPeriodo = await periodo.save();
    periodId = savedPeriodo._id;
  });

  describe('Complete Student Registration and Enrollment Flow', () => {
    it('should complete full student workflow: register -> login -> view courses -> add to cart -> checkout -> enroll', async () => {
      // 1. Registro de estudiante
      const studentData = {
        nombres: 'Estudiante',
        apellidos: 'Prueba',
        email: 'estudiante.prueba@example.com',
        cedula: '1234567890',
        telefono: '0987654321',
        password: 'password123',
        rol: 'estudiante'
      };

      const registerResponse = await request(app)
        .post('/api/register')
        .send(studentData)
        .expect(200);

      expect(registerResponse.body.token).toBeDefined();
      expect(registerResponse.body.user.rol).toBe('estudiante');

      studentToken = registerResponse.body.token;
      studentId = registerResponse.body.user.id;

      // Verificar que se creó el perfil de estudiante automáticamente
      const estudiante = await Estudiante.findOne({ usuarioId: studentId });
      expect(estudiante).toBeTruthy();

      // 2. Login (opcional, ya tenemos token del registro)
      const loginResponse = await request(app)
        .post('/api/login')
        .send({
          email: studentData.email,
          password: studentData.password
        })
        .expect(200);

      expect(loginResponse.body.token).toBeDefined();

      // 3. Ver cursos activos
      const coursesResponse = await request(app)
        .get('/api/cursos/activos')
        .expect(200);

      expect(Array.isArray(coursesResponse.body)).toBe(true);
      expect(coursesResponse.body.length).toBeGreaterThan(0);

      // 4. Ver perfil de estudiante
      const profileResponse = await request(app)
        .get('/api/profile')
        .set('Cookie', `token=${studentToken}`)
        .expect(200);

      expect(profileResponse.body.nombres).toBe(studentData.nombres);
      expect(profileResponse.body.email).toBe(studentData.email);

      // 5. Agregar curso al carrito
      const cartResponse = await request(app)
        .post('/api/carrito/items')
        .set('Cookie', `token=${studentToken}`)
        .send({
          cursoId: courseId,
          periodoId: periodId
        })
        .expect(200);

      expect(cartResponse.body.carrito.items).toHaveLength(1);
      expect(cartResponse.body.carrito.total).toBe(100);

      // 6. Ver carrito
      const viewCartResponse = await request(app)
        .get('/api/carrito')
        .set('Cookie', `token=${studentToken}`)
        .expect(200);

      expect(viewCartResponse.body.items).toHaveLength(1);
      expect(viewCartResponse.body.total).toBe(100);

      // 7. Checkout (procesar matricula)
      const checkoutResponse = await request(app)
        .post('/api/carrito/checkout')
        .set('Cookie', `token=${studentToken}`)
        .send({
          metodoPago: 'efectivo'
        })
        .expect(200);

      expect(checkoutResponse.body.matriculas).toHaveLength(1);
      expect(checkoutResponse.body.matriculas[0].estado).toBe('activa');

      // Verificar que se creó la matricula
      const matricula = await Matricula.findOne({
        estudianteId: studentId,
        periodoId: periodId
      });
      expect(matricula).toBeTruthy();
      expect(matricula.estado).toBe('activa');
      expect(matricula.metodoPago).toBe('efectivo');

      // Verificar que se actualizaron los cupos
      const updatedPeriodo = await Periodo.findById(periodId);
      expect(updatedPeriodo.cuposOcupados).toBe(1);
      expect(updatedPeriodo.cuposDisponibles).toBe(19);

      // Verificar que el carrito se marcó como procesado
      const processedCart = await Carrito.findOne({ usuarioId: studentId });
      expect(processedCart.estado).toBe('procesado');
    });
  });

  describe('Admin Enrollment Flow', () => {
    let newStudentId;

    beforeAll(async () => {
      // Crear un estudiante para que el admin lo matricule
      const newStudentData = {
        nombres: 'Nuevo',
        apellidos: 'Estudiante',
        email: 'nuevo.estudiante@example.com',
        cedula: '0987654321',
        password: 'password123',
        rol: 'estudiante'
      };

      const newStudent = new User(newStudentData);
      const savedStudent = await newStudent.save();
      newStudentId = savedStudent._id;

      // Crear perfil de estudiante
      const estudiante = new Estudiante({ usuarioId: newStudentId });
      await estudiante.save();
    });

    it('should allow admin to enroll student directly', async () => {
      const enrollmentData = {
        estudianteId: newStudentId,
        periodoId: periodId,
        metodoPago: 'transferencia',
        descuento: 10, // 10% descuento
        observaciones: 'Matriculado por administrador'
      };

      const response = await request(app)
        .post('/api/matriculas/admin/matricular')
        .set('Cookie', `token=${adminToken}`)
        .send(enrollmentData)
        .expect(200);

      expect(response.body.matricula.estado).toBe('activa');
      expect(response.body.matricula.metodoPago).toBe('transferencia');
      expect(response.body.matricula.descuento).toBe(10);
      expect(response.body.matricula.observaciones).toBe(enrollmentData.observaciones);

      // Verificar precios con descuento (100 - 10% = 90)
      expect(response.body.matricula.montoPagado).toBe(90);
      expect(response.body.matricula.montoPendiente).toBe(0);

      // Verificar que se actualizaron los cupos
      const updatedPeriodo = await Periodo.findById(periodId);
      expect(updatedPeriodo.cuposOcupados).toBe(2); // Ya había 1 del test anterior
      expect(updatedPeriodo.cuposDisponibles).toBe(18);
    });

    it('should prevent duplicate enrollment', async () => {
      const duplicateEnrollment = {
        estudianteId: newStudentId,
        periodoId: periodId,
        metodoPago: 'efectivo'
      };

      const response = await request(app)
        .post('/api/matriculas/admin/matricular')
        .set('Cookie', `token=${adminToken}`)
        .send(duplicateEnrollment)
        .expect(400);

      expect(response.body.message).toBe('Student is already enrolled in this period');
    });
  });

  describe('Student Profile Management', () => {
    it('should allow student to update profile and upload documents', async () => {
      // Crear perfil de estudiante con documentos
      const profileData = {
        direccion: 'Av. Test 123',
        fechaNacimiento: '2000-01-01T00:00:00.000Z',
        contactoEmergencia: {
          nombre: 'Madre Test',
          telefono: '0987654321',
          relacion: 'Madre'
        }
      };

      // Simular archivos (en un test real usarías archivos temporales)
      const response = await request(app)
        .post('/api/estudiantes/profile')
        .set('Cookie', `token=${studentToken}`)
        .send(profileData)
        .expect(201);

      expect(response.body.estudiante.direccion).toBe(profileData.direccion);
      expect(response.body.estudiante.contactoEmergencia.nombre).toBe(profileData.contactoEmergencia.nombre);

      // Ver perfil actualizado
      const viewProfileResponse = await request(app)
        .get('/api/estudiantes/profile')
        .set('Cookie', `token=${studentToken}`)
        .expect(200);

      expect(viewProfileResponse.body.direccion).toBe(profileData.direccion);
    });
  });

  describe('Error Handling', () => {
    it('should prevent adding to cart when no spots available', async () => {
      // Llenar el periodo completamente
      await Periodo.findByIdAndUpdate(periodId, {
        cuposDisponibles: 0,
        cuposOcupados: 20
      });

      const response = await request(app)
        .post('/api/carrito/items')
        .set('Cookie', `token=${studentToken}`)
        .send({
          cursoId: courseId,
          periodoId: periodId
        })
        .expect(400);

      expect(response.body.message).toBe('No available spots for this period');
    });

    it('should prevent non-admin from admin enrollment', async () => {
      const enrollmentData = {
        estudianteId: studentId,
        periodoId: periodId,
        metodoPago: 'efectivo'
      };

      const response = await request(app)
        .post('/api/matriculas/admin/matricular')
        .set('Cookie', `token=${studentToken}`) // Usando token de estudiante
        .send(enrollmentData)
        .expect(403);

      expect(response.body.message).toBe('Access denied. Admin required.');
    });
  });
});