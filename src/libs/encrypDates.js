import CryptoJS from 'crypto-js';
import dotenv from 'dotenv';

dotenv.config();

const claveSecreta = process.env.ENCRYPTION_KEY || 'cifrarDatos';

// Función original de cifrado (con salt aleatorio)
export function cifrarDatos(datos) {
    try {
        const cifrado = CryptoJS.AES.encrypt(JSON.stringify(datos), claveSecreta).toString();
        return cifrado;
    } catch (error) {
        console.error('Error al cifrar datos:', error.message);
        throw error;
    }
}

// Función original de descifrado
export function descifrarDatos(cifrado) {
    try {
        const bytes = CryptoJS.AES.decrypt(cifrado, claveSecreta);
        const decryptedString = bytes.toString(CryptoJS.enc.Utf8);
        try {
            return JSON.parse(decryptedString);
        } catch (parseError) {
            // Si no es JSON válido, asumir que es texto plano (datos legacy no encriptados)
            console.warn('Datos descifrados no son JSON válido, tratando como texto plano:', decryptedString);
            return decryptedString;
        }
    } catch (error) {
        console.error('Error al descifrar datos:', error.message);
        // Si falla el descifrado, devolver el cifrado original
        return cifrado;
    }
}

// NUEVA FUNCIÓN: Hash determinista para búsquedas
// Siempre produce el mismo resultado para el mismo texto
export function hashParaBusqueda(texto) {
    try {
        // Normalizar el texto (trim y lowercase)
        const textoNormalizado = texto.toString().toLowerCase().trim();
        
        // Crear hash determinista usando HMAC-SHA256
        const hash = CryptoJS.HmacSHA256(textoNormalizado, claveSecreta).toString();
        
        return hash;
    } catch (error) {
        console.error('Error al crear hash para búsqueda:', error.message);
        throw error;
    }
}