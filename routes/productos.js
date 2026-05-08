const express = require('express');
const router = express.Router();
const db = require('../db/index');

// POST - Crear un nuevo producto
router.post('/', async (req, res) => {
    try {
        const { nombre, precio, stock } = req.body;

        // Validación básica
        if (!nombre || !precio || !stock) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        const result = await db.query(
            'INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3) RETURNING *',
            [nombre, precio, stock]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Error al crear producto:", error.message);
        res.status(500).json({ error: "Error en el servidor", detalle: error.message });
    }
});

// GET - Listar todos los productos (útil para ver qué agregamos)
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM productos ORDER BY id_producto DESC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;