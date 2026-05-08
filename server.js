require('dotenv').config();
require('./db');

const express = require('express');
const app = express();

// 1. PRIMERO LOS MIDDLEWARES
app.use(express.json());
app.use(express.static('public'));

// 2. LUEGO IMPORTAS LAS RUTAS (Aquí es donde estaba el error)
const authRoutes = require('./routes/auth'); // Asegúrate de que esta línea esté ARRIBA de app.use
const recursoRoutes = require('./routes/recurso');

// 3. POR ÚLTIMO USAS LAS RUTAS
app.use('/api/auth', authRoutes);
app.use('/api/recurso', recursoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
app.use('/api/productos', require('./routes/productos'));