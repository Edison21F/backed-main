import mongoose from "mongoose";
import { cifrarDatos, descifrarDatos } from '../libs/encrypDates.js';

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        trim: true
    },
    emailHash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    password: { 
        type: String, 
        required: true 
    }
}, {
    timestamps: true
});

// Encriptar datos antes de guardar
userSchema.pre('save', async function(next) {
    try {
        // Cifrar username si fue modificado o es nuevo y NO está ya cifrado
        if ((this.isModified('username') || this.isNew) && !this.username.includes('U2FsdGVk')) {
            this.username = cifrarDatos(this.username);
        }
        
        // Cifrar email si fue modificado o es nuevo y NO está ya cifrado
        if ((this.isModified('email') || this.isNew) && !this.email.includes('U2FsdGVk')) {
            this.email = cifrarDatos(this.email);
        }
        
        // NO cifrar el password - bcrypt ya lo protege
        
        next();
    } catch (error) {
        console.error('Error en pre-save hook:', error);
        next(error);
    }
});

// Descifrar datos al convertir a JSON
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    
    try {
        // Descifrar username
        if (user.username) {
            user.username = descifrarDatos(user.username);
        }
        
        // Descifrar email
        if (user.email) {
            user.email = descifrarDatos(user.email);
        }
        
        // Eliminar campos sensibles
        delete user.password;
        delete user.emailHash;
        
    } catch (error) {
        console.error('Error al descifrar datos del usuario:', error);
    }
    
    return user;
};

export default mongoose.model("User", userSchema); 