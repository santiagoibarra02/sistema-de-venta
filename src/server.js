require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();

// 1. MIDDLEWARES
app.use(express.json());

// 2. RUTA ESTÁTICA
// Al estar en /src, usamos '..' para salir y encontrar la carpeta /public
app.use(express.static(path.join(__dirname, '..', 'public')));

// 3. CONEXIÓN A DB
// Ya estás en /src, así que solo entras a la carpeta /db
require('./db/index'); 

// 4. RUTAS
// Ya estás en /src, así que solo entras a la carpeta /routes
const authRoutes = require('./routes/auth');
const productoRoutes = require('./routes/productos');
const recursoRoutes = require('./routes/recurso');

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/recurso', recursoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});