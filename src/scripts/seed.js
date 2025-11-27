import mongoose from 'mongoose';
import { connectDB } from '../db.js';
import User from '../models/user.model.js';
import Docente from '../models/docente.model.js';
import Estudiante from '../models/estudiante.model.js';
import Curso from '../models/curso.model.js';
import Periodo from '../models/periodo.model.js';
import Modulo from '../models/modulo.model.js';
import Clase from '../models/clase.model.js';
import Matricula from '../models/matricula.model.js';

// Helper functions
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const getRandomElement = (arr) => arr[Math.floor(Math.random() * arr.length)];

const firstNames = ['Juan', 'Maria', 'Carlos', 'Ana', 'Pedro', 'Sofia', 'Luis', 'Elena', 'Diego', 'Lucia', 'Miguel', 'Valentina', 'Jose', 'Camila', 'David', 'Isabella', 'Jorge', 'Daniela', 'Andres', 'Mariana'];
const lastNames = ['Garcia', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Perez', 'Sanchez', 'Ramirez', 'Torres', 'Flores', 'Rivera', 'Gomez', 'Diaz', 'Cruz', 'Reyes', 'Morales', 'Gutierrez', 'Ortiz', 'Castillo'];

const generateName = () => ({
    nombres: getRandomElement(firstNames) + ' ' + getRandomElement(firstNames),
    apellidos: getRandomElement(lastNames) + ' ' + getRandomElement(lastNames)
});

const generateCedula = () => {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.floor(Math.random() * 90 + 10);
    return `${timestamp}${random}`;
};

const seed = async () => {
    try {
        console.log('🌱 Iniciando seed...');
        await connectDB();

        console.log('🗑️ Limpiando base de datos...');

        try { await Docente.collection.dropIndexes(); } catch (e) { console.log('No indexes to drop for Docente'); }
        try { await User.collection.dropIndexes(); } catch (e) { console.log('No indexes to drop for User'); }
        try { await Modulo.collection.dropIndexes(); } catch (e) { console.log('No indexes to drop for Modulo'); }
        try { await Curso.collection.dropIndexes(); } catch (e) { console.log('No indexes to drop for Curso'); }
        try { await Periodo.collection.dropIndexes(); } catch (e) { console.log('No indexes to drop for Periodo'); }
        try { await Clase.collection.dropIndexes(); } catch (e) { console.log('No indexes to drop for Clase'); }
        try { await Matricula.collection.dropIndexes(); } catch (e) { console.log('No indexes to drop for Matricula'); }
        try { await Estudiante.collection.dropIndexes(); } catch (e) { console.log('No indexes to drop for Estudiante'); }

        await Matricula.deleteMany({});
        await Clase.deleteMany({});
        await Modulo.deleteMany({});
        await Periodo.deleteMany({});
        await Curso.deleteMany({});
        await Estudiante.deleteMany({});
        await Docente.deleteMany({});
        await User.deleteMany({});
        console.log('✅ Base de datos limpiada');

        console.log('👥 Creando usuarios...');

        // 1. Admin
        try {
            const admin = await User.create({
                nombres: 'Admin',
                apellidos: 'Sistema',
                email: 'admin@barberia.com',
                cedula: '0000000000',
                password: 'admin123', // Will be hashed by pre-save hook
                rol: 'administrador',
                telefono: '0999999999'
            });
            console.log('✅ Admin creado');
        } catch (error) {
            console.log('Admin creation error (might already exist):', error.message);
        }

        // 2. Docentes (5)
        const docentes = [];
        for (let i = 0; i < 5; i++) {
            const { nombres, apellidos } = generateName();
            const user = await User.create({
                nombres,
                apellidos,
                email: `docente${i + 1}@barberia.com`,
                cedula: generateCedula(),
                password: 'password123',
                rol: 'docente',
                telefono: `09${getRandomInt(10000000, 99999999)}`
            });

            const docenteProfile = await Docente.create({
                usuarioId: user._id,
                especialidad: getRandomElement(['Cortes Clásicos', 'Diseño de Barba', 'Color']),
                añosExperiencia: getRandomInt(2, 15),
                certificaciones: [
                    { nombre: 'Master Barber', institucion: 'Barber Academy', fechaObtencion: new Date('2020-01-01') }
                ],
                horarioDisponible: [
                    { diaSemana: 'Lunes', horaInicio: '08:00', horaFin: '17:00' },
                    { diaSemana: 'Martes', horaInicio: '08:00', horaFin: '17:00' },
                    { diaSemana: 'Miércoles', horaInicio: '08:00', horaFin: '17:00' },
                    { diaSemana: 'Jueves', horaInicio: '08:00', horaFin: '17:00' },
                    { diaSemana: 'Viernes', horaInicio: '08:00', horaFin: '17:00' }
                ]
            });
            docentes.push({ user, profile: docenteProfile });
        }
        console.log('✅ 5 Docentes creados');

        // 3. Estudiantes (50)
        const estudiantes = [];
        for (let i = 0; i < 50; i++) {
            const { nombres, apellidos } = generateName();
            const user = await User.create({
                nombres,
                apellidos,
                email: `estudiante${i + 1}@barberia.com`,
                cedula: generateCedula(),
                password: 'password123',
                rol: 'estudiante',
                telefono: `09${getRandomInt(10000000, 99999999)}`
            });

            const estudianteProfile = await Estudiante.create({
                usuarioId: user._id,
                direccion: 'Av. Siempre Viva 123',
                fechaNacimiento: new Date(getRandomInt(1990, 2005), getRandomInt(0, 11), getRandomInt(1, 28)),
                contactoEmergencia: {
                    nombre: 'Contacto Emergencia',
                    telefono: '0999999999',
                    relacion: 'Padre/Madre'
                },
                estado: 'activo'
            });
            estudiantes.push({ user, profile: estudianteProfile });
        }
        console.log('✅ 50 Estudiantes creados');

        // 4. Cursos
        const cursosData = [
            { nombre: 'Barbería Básica', codigo: 'BAR-001', nivel: 'basico', precio: 150, duracion: 4 },
            { nombre: 'Corte y Estilo Avanzado', codigo: 'BAR-002', nivel: 'avanzado', precio: 250, duracion: 6 },
            { nombre: 'Diseño de Barba y Afeitado', codigo: 'BAR-003', nivel: 'intermedio', precio: 180, duracion: 3 },
            { nombre: 'Colorimetría para Caballeros', codigo: 'BAR-004', nivel: 'avanzado', precio: 300, duracion: 5 },
            { nombre: 'Gestión de Barbería', codigo: 'BAR-005', nivel: 'intermedio', precio: 200, duracion: 4 }
        ];

        const cursos = [];
        for (const c of cursosData) {
            const curso = await Curso.create({
                nombre: c.nombre,
                codigo: c.codigo,
                descripcion: `Aprende todo sobre ${c.nombre} con los mejores profesionales.`,
                duracionSemanas: c.duracion,
                nivel: c.nivel,
                precio: c.precio,
                cupoMaximo: 20,
                imagen: '/uploads/cursos/estudiar-barberia.jpg',
                requisitos: ['Ninguno', 'Ganas de aprender'],
                objetivos: ['Dominar técnicas', 'Conocer herramientas', 'Atención al cliente']
            });
            cursos.push(curso);

            // Modulos para el curso
            for (let m = 1; m <= 3; m++) {
                await Modulo.create({
                    cursoId: curso._id,
                    nombre: `Módulo ${m}: Fundamentos de ${c.nombre}`,
                    numeroModulo: m,
                    descripcion: `Contenido del módulo ${m}`,
                    duracionHoras: 10,
                    orden: m,
                    temas: [
                        { nombre: 'Tema 1', duracion: 2, contenido: 'Intro' },
                        { nombre: 'Tema 2', duracion: 3, contenido: 'Práctica' }
                    ]
                });
            }

            // Periodos para el curso
            const estadosPeriodo = ['planificado', 'en_curso', 'finalizado'];
            for (let p = 0; p < 3; p++) {
                const fechaInicio = new Date();
                fechaInicio.setMonth(fechaInicio.getMonth() + (p - 1) * 2); // Spread out periods
                const fechaFin = new Date(fechaInicio);
                fechaFin.setMonth(fechaFin.getMonth() + 2);

                const periodo = await Periodo.create({
                    cursoId: curso._id,
                    nombre: `Periodo ${p + 1} - 2025`,
                    codigo: `${c.codigo}-P${p + 1}`,
                    fechaInicio,
                    fechaFin,
                    estado: estadosPeriodo[p],
                    cuposDisponibles: 20,
                    horario: 'Lunes a Viernes 14:00 - 17:00',
                    docentesPrincipales: [getRandomElement(docentes).profile._id]
                });

                // Clases para el periodo (solo unas pocas de ejemplo)
                if (estadosPeriodo[p] === 'en_curso') {
                    const modulo = await Modulo.findOne({ cursoId: curso._id, numeroModulo: 1 });
                    if (modulo) {
                        for (let k = 0; k < 5; k++) {
                            const fechaClase = new Date(fechaInicio);
                            fechaClase.setDate(fechaClase.getDate() + k);
                            await Clase.create({
                                periodoId: periodo._id,
                                moduloId: modulo._id,
                                docenteId: getRandomElement(docentes).user._id,
                                titulo: `Clase ${k + 1}`,
                                descripcion: 'Clase práctica',
                                fecha: fechaClase,
                                horaInicio: '14:00',
                                horaFin: '17:00',
                                duracion: 3,
                                ubicacion: 'Aula 1',
                                modalidad: 'presencial'
                            });
                        }
                    }
                }

                // Matriculas (solo para periodos abiertos o en curso)
                if (estadosPeriodo[p] !== 'planificado') {
                    const numEstudiantes = getRandomInt(5, 15);
                    for (let e = 0; e < numEstudiantes; e++) {
                        const estudiante = getRandomElement(estudiantes);
                        // Check if already enrolled
                        const existing = await Matricula.findOne({ estudianteId: estudiante.profile._id, periodoId: periodo._id });
                        if (!existing) {
                            await Matricula.create({
                                estudianteId: estudiante.profile._id,
                                periodoId: periodo._id,
                                cursoId: curso._id,
                                metodoPago: getRandomElement(['efectivo', 'transferencia']),
                                montoPagado: c.precio,
                                estado: 'activa',
                                documentos: [{
                                    tipo: 'cedula',
                                    url: '/uploads/docs/cedula.pdf'
                                }]
                            });

                            // Update cupos
                            periodo.cuposDisponibles -= 1;
                            periodo.cuposOcupados += 1;
                            await periodo.save();
                        }
                    }
                }
            }
        }
        console.log('✅ Cursos, Módulos, Periodos, Clases y Matrículas creados');

        console.log('✨ Seed completado exitosamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error en seed:', JSON.stringify(error, null, 2));
        if (error.keyValue) {
            console.error('Duplicate Key:', error.keyValue);
        }
        process.exit(1);
    }
};

seed();
