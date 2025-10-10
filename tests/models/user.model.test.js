import User from '../../src/models/user.model.js';
import bcrypt from 'bcryptjs';

describe('User Model', () => {
  describe('User Creation', () => {
    it('should create a valid user', async () => {
      const userData = {
        nombres: 'Juan',
        apellidos: 'Pérez',
        email: 'juan.perez@example.com',
        cedula: '1234567890',
        telefono: '0987654321',
        password: 'password123',
        rol: 'estudiante'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser._id).toBeDefined();
      expect(savedUser.nombres).toBe(userData.nombres);
      expect(savedUser.apellidos).toBe(userData.apellidos);
      expect(savedUser.email).toBe(userData.email);
      expect(savedUser.cedula).toBe(userData.cedula);
      expect(savedUser.rol).toBe(userData.rol);
      expect(savedUser.activo).toBe(true);
      expect(savedUser.fechaRegistro).toBeDefined();
    });

    it('should hash password before saving', async () => {
      const userData = {
        nombres: 'María',
        apellidos: 'García',
        email: 'maria.garcia@example.com',
        cedula: '0987654321',
        password: 'password123',
        rol: 'estudiante'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      // Verificar que la contraseña esté hasheada
      expect(savedUser.password).not.toBe(userData.password);
      expect(await bcrypt.compare(userData.password, savedUser.password)).toBe(true);
    });

    it('should set default role to estudiante', async () => {
      const userData = {
        nombres: 'Carlos',
        apellidos: 'López',
        email: 'carlos.lopez@example.com',
        cedula: '1122334455',
        password: 'password123'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      expect(savedUser.rol).toBe('estudiante');
    });

    it('should fail with duplicate email', async () => {
      const userData = {
        nombres: 'Ana',
        apellidos: 'Martínez',
        email: 'ana.martinez@example.com',
        cedula: '5566778899',
        password: 'password123',
        rol: 'estudiante'
      };

      // Crear primer usuario
      await new User(userData).save();

      // Intentar crear segundo usuario con mismo email
      const duplicateUser = new User({
        ...userData,
        cedula: '9988776655' // Diferente cédula
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });

    it('should fail with duplicate cedula', async () => {
      const userData = {
        nombres: 'Luis',
        apellidos: 'Rodríguez',
        email: 'luis.rodriguez@example.com',
        cedula: '4433221100',
        password: 'password123',
        rol: 'estudiante'
      };

      // Crear primer usuario
      await new User(userData).save();

      // Intentar crear segundo usuario con misma cédula
      const duplicateUser = new User({
        ...userData,
        email: 'luis2.rodriguez@example.com' // Diferente email
      });

      await expect(duplicateUser.save()).rejects.toThrow();
    });
  });

  describe('Password Comparison', () => {
    it('should compare passwords correctly', async () => {
      const userData = {
        nombres: 'Test',
        apellidos: 'User',
        email: 'test@example.com',
        cedula: '1234567890',
        password: 'testpassword',
        rol: 'estudiante'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      // Verificar comparación correcta
      expect(await savedUser.comparePassword('testpassword')).toBe(true);
      expect(await savedUser.comparePassword('wrongpassword')).toBe(false);
    });
  });

  describe('toJSON Method', () => {
    it('should exclude password from JSON output', async () => {
      const userData = {
        nombres: 'JSON',
        apellidos: 'Test',
        email: 'json@example.com',
        cedula: '1234567890',
        password: 'password123',
        rol: 'estudiante'
      };

      const user = new User(userData);
      const savedUser = await user.save();

      const jsonOutput = savedUser.toJSON();

      expect(jsonOutput.password).toBeUndefined();
      expect(jsonOutput.nombres).toBe(userData.nombres);
      expect(jsonOutput.email).toBe(userData.email);
    });
  });

  describe('Validation', () => {
    it('should fail with invalid email', async () => {
      const userData = {
        nombres: 'Invalid',
        apellidos: 'Email',
        email: 'invalid-email',
        cedula: '1234567890',
        password: 'password123',
        rol: 'estudiante'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should fail with short password', async () => {
      const userData = {
        nombres: 'Short',
        apellidos: 'Password',
        email: 'short@example.com',
        cedula: '1234567890',
        password: '12345', // Menos de 6 caracteres
        rol: 'estudiante'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });

    it('should fail with invalid role', async () => {
      const userData = {
        nombres: 'Invalid',
        apellidos: 'Role',
        email: 'invalid@example.com',
        cedula: '1234567890',
        password: 'password123',
        rol: 'invalid_role'
      };

      const user = new User(userData);
      await expect(user.save()).rejects.toThrow();
    });
  });
});