import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    nombres: {
        type: String,
        required: true,
        trim: true
    },
    apellidos: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    cedula: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    telefono: {
        type: String,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    rol: {
        type: String,
        enum: ['estudiante', 'docente', 'administrador'],
        default: 'estudiante'
    },
    avatar: {
        type: String,
        trim: true
    },
    activo: {
        type: Boolean,
        default: true
    },
    fechaRegistro: {
        type: Date,
        default: Date.now
    },
    ultimoAcceso: {
        type: Date,
        default: Date.now
    }
});

// Hashear contraseña antes de guardar
userSchema.pre('save', async function(next) {
    try {
        // Hashear password si fue modificado o es nuevo
        if (this.isModified('password') || this.isNew) {
            const salt = await bcrypt.genSalt(10);
            this.password = await bcrypt.hash(this.password, salt);
        }

        next();
    } catch (error) {
        console.error('Error en pre-save hook:', error);
        next(error);
    }
});

// Método para comparar contraseña
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Método para convertir a JSON sin campos sensibles
userSchema.methods.toJSON = function() {
    const user = this.toObject();

    // Eliminar campos sensibles
    delete user.password;

    return user;
};

export default mongoose.model("User", userSchema); 