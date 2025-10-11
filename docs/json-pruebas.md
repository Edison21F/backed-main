# Documentación de JSON para Pruebas

Esta documentación contiene ejemplos de payloads JSON para probar los endpoints de la API. Cada sección corresponde a un módulo, con los endpoints que requieren validación de esquemas.

## Auth

### POST /auth/register
```json
{
  "nombres": "Juan",
  "apellidos": "Pérez",
  "email": "juan@example.com",
  "cedula": "1234567890",
  "telefono": "0991234567",
  "password": "password123",
  "rol": "estudiante",
  "avatar": "https://example.com/avatar.jpg"
}
```

### POST /auth/login
```json
{
  "email": "juan@example.com",
  "password": "password123"
}
```

## Carrito

### POST /carrito/items
```json
{
  "cursoId": "60d5ecb74b24c72b8c8b4567",
  "periodoId": "60d5ecb74b24c72b8c8b4568"
}
```

### POST /carrito/checkout
```json
{
  "metodoPago": "efectivo"
}
```

## Clase

### POST /clase
```json
{
  "periodoId": "60d5ecb74b24c72b8c8b4567",
  "moduloId": "60d5ecb74b24c72b8c8b4568",
  "docenteId": "60d5ecb74b24c72b8c8b4569",
  "titulo": "Introducción a los cortes clásicos",
  "descripcion": "Clase básica sobre técnicas de corte",
  "fecha": "2023-10-01T10:00:00.000Z",
  "horaInicio": "10:00",
  "horaFin": "12:00",
  "ubicacion": "Salón 1",
  "modalidad": "presencial",
  "enlaceVirtual": "https://meet.google.com/abc",
  "materialesClase": ["Tijeras", "Peine"],
  "observaciones": "Traer uniforme"
}
```

### PUT /clase/:id
```json
{
  "titulo": "Introducción actualizada",
  "estado": "finalizada",
  "asistencia": [
    {
      "estudianteId": "60d5ecb74b24c72b8c8b4570",
      "presente": true,
      "observaciones": "Llegó tarde"
    }
  ]
}
```

## Curso

### POST /curso
```json
{
  "nombre": "Cortes Clásicos Avanzados",
  "codigo": "CCA001",
  "descripcion": "Curso avanzado de técnicas de corte",
  "duracionSemanas": 8,
  "nivel": "avanzado",
  "precio": 150.00,
  "requisitos": ["Curso básico completado"],
  "objetivos": ["Dominar técnicas avanzadas"],
  "imagen": "https://example.com/curso.jpg",
  "activo": true,
  "cupoMaximo": 20
}
```

### PUT /curso/:id
```json
{
  "nombre": "Cortes Clásicos Avanzados - Actualizado",
  "precio": 160.00,
  "activo": false
}
```

## Docente

### POST /docente/profile
```json
{
  "especialidad": "Cortes Clásicos",
  "añosExperiencia": 5,
  "certificaciones": [
    {
      "nombre": "Certificación Nacional",
      "institucion": "Instituto de Barbería",
      "fechaObtencion": "2020-05-15T00:00:00.000Z"
    }
  ],
  "horarioDisponible": [
    {
      "diaSemana": "Lunes",
      "horaInicio": "09:00",
      "horaFin": "17:00"
    }
  ],
  "activo": true,
  "calificacionPromedio": 4.5
}
```

### PUT /docente/profile
```json
{
  "especialidad": "Diseño de Barba",
  "añosExperiencia": 6,
  "activo": false
}
```

## Estudiante

### POST /estudiante/profile
```json
{
  "direccion": "Calle Principal 123",
  "fechaNacimiento": "1995-03-15T00:00:00.000Z",
  "contactoEmergencia": {
    "nombre": "María Pérez",
    "telefono": "0998765432",
    "relacion": "Madre"
  },
  "cursoActual": "60d5ecb74b24c72b8c8b4567",
  "periodoActual": "60d5ecb74b24c72b8c8b4568",
  "estado": "activo",
  "fechaMatricula": "2023-09-01T00:00:00.000Z",
  "historialCursos": [
    {
      "cursoId": "60d5ecb74b24c72b8c8b4569",
      "periodoId": "60d5ecb74b24c72b8c8b4570",
      "fechaInicio": "2023-01-01T00:00:00.000Z",
      "fechaFin": "2023-03-01T00:00:00.000Z",
      "estado": "completado"
    }
  ]
}
```

### PUT /estudiante/profile
```json
{
  "direccion": "Nueva Calle 456",
  "estado": "graduado"
}
```

## Matricula

### POST /matricula
```json
{
  "estudianteId": "60d5ecb74b24c72b8c8b4570",
  "periodoId": "60d5ecb74b24c72b8c8b4568",
  "metodoPago": "transferencia",
  "montoPagado": 150.00,
  "descuento": 10,
  "observaciones": "Pago completo",
  "documentos": [
    {
      "tipo": "cedula",
      "url": "https://example.com/cedula.pdf"
    }
  ],
  "historialPagos": [
    {
      "monto": 150.00,
      "metodoPago": "transferencia",
      "comprobante": "https://example.com/comprobante.pdf"
    }
  ]
}
```

### PUT /matricula/:id
```json
{
  "estado": "completada",
  "montoPendiente": 0,
  "observaciones": "Matrícula completada exitosamente"
}
```

## Modulo

### POST /modulo
```json
{
  "cursoId": "60d5ecb74b24c72b8c8b4567",
  "nombre": "Técnicas Básicas de Corte",
  "numeroModulo": 1,
  "descripcion": "Aprender las bases del corte de cabello",
  "duracionHoras": 4,
  "objetivos": ["Entender herramientas básicas", "Practicar cortes simples"],
  "temas": [
    {
      "nombre": "Herramientas",
      "duracion": 1,
      "contenido": "Descripción de tijeras y peines"
    }
  ],
  "materialesNecesarios": ["Tijeras", "Peine", "Espejo"],
  "orden": 1
}
```

### PUT /modulo/:id
```json
{
  "nombre": "Técnicas Básicas de Corte - Actualizado",
  "duracionHoras": 5,
  "activo": true
}
```

## Notificacion

### POST /notificacion
```json
{
  "tipo": "clase",
  "destinatarios": [
    {
      "usuarioId": "60d5ecb74b24c72b8c8b4570",
      "telefono": "0991234567"
    }
  ],
  "mensaje": "Recordatorio: Clase mañana a las 10:00",
  "claseId": "60d5ecb74b24c72b8c8b4569",
  "periodoId": "60d5ecb74b24c72b8c8b4568",
  "fechaProgramada": "2023-10-01T08:00:00.000Z"
}
```

### PUT /notificacion/:id
```json
{
  "estado": "completado",
  "intentos": 1,
  "errorLog": []
}
```

## Periodo

### POST /periodo
```json
{
  "cursoId": "60d5ecb74b24c72b8c8b4567",
  "nombre": "Periodo Octubre 2023",
  "codigo": "OCT2023",
  "fechaInicio": "2023-10-01T00:00:00.000Z",
  "fechaFin": "2023-10-31T23:59:59.000Z",
  "cuposDisponibles": 20,
  "docentesPrincipales": ["60d5ecb74b24c72b8c8b4569"],
  "horario": "Lunes a Viernes 9:00-17:00",
  "observaciones": "Periodo intensivo"
}
```

### PUT /periodo/:id
```json
{
  "nombre": "Periodo Octubre 2023 - Actualizado",
  "estado": "en_curso",
  "cuposDisponibles": 15
}