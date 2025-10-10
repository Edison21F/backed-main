import app from "./app.js"
import { connectDB } from "./db.js"

connectDB();
const ruta = 4000
app.listen(ruta)
console.log(`app escuchando en el puerto ${ruta}`)