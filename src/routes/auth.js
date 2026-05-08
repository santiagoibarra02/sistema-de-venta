const express = require('express');
const router = express.Router();

// Importamos el controlador donde movimos la lógica de registro y login
// Recuerda que en tu captura el archivo se llama 'controlls.js'
const authController = require('../controllers/controlls.js');

// --- RUTAS ---

// Ruta de prueba para verificar que el archivo carga bien
router.get('/', (req, res) => {
    res.send('Ruta de autenticación funcionando correctamente');
});

// POST - Registro de usuario
// Ahora la lógica vive en authController.register
router.post('/register', authController.register);

// POST - Login
// Ahora la lógica vive en authController.login
router.post('/login', authController.login);

module.exports = router;