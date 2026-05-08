const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const db = require('../db/index'); 

router.get('/', (req, res) => {
    res.send('Ruta auth funcionando');
});

// POST - Registro de usuario
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body;

        if (!nombre || !email || !password) {
            return res.status(400).json({ 
                error: "Faltan datos obligatorios: nombre, email o password" 
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // CORRECCIÓN: id_usuario en singular (como en tu tabla) y tabla en minúsculas
        const result = await db.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id_usuario, nombre, email',
            [nombre, email, hashedPassword]
        );

        res.status(201).json(result.rows[0]);

    } catch (error) {
        console.error("DETALLE DEL ERROR:", error.message);
        res.status(500).json({ 
            error: 'Error en el servidor', 
            detalle: error.message 
        });
    }
});

// POST - Login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: "Email y password son requeridos" });
        }

        // CORRECCIÓN: usuarios en minúsculas para coincidir con el registro
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (result.rows.length === 0) {
            return res.status(400).json({ mensaje: 'Usuario no encontrado' });
        }

        const usuario = result.rows[0];

        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) {
            return res.status(400).json({ mensaje: 'Contraseña incorrecta' });
        }

        const token = jwt.sign(
            { id: usuario.id_usuario }, 
            process.env.JWT_SECRET || 'clave_secreta_provisoria', 
            { expiresIn: '2h' }
        );

        res.json({ mensaje: 'Bienvenido', token });

    } catch (error) {
        console.error("ERROR EN LOGIN:", error.message);
        res.status(500).json({ error: 'Error en el login', detalle: error.message });
    }
});

module.exports = router;