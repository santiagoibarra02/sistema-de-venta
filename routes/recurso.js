const express = require('express');
const router = express.Router();
const db = require('../db');


// GET - obtener productos
router.get('/', async (req, res) => {

    try {

        const resultado = await db.query(
            'SELECT * FROM productos ORDER BY id'
        );

        res.json(resultado.rows);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error del servidor'
        });

    }

});


// POST - crear producto
router.post('/', async (req, res) => {

    try {

        const { nombre, precio, stock } = req.body;

        const resultado = await db.query(
            `INSERT INTO productos(nombre, precio, stock)
             VALUES($1, $2, $3)
             RETURNING *`,
            [nombre, precio, stock]
        );

        res.status(201).json(resultado.rows[0]);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al crear producto'
        });

    }

});


// PUT - actualizar producto
router.put('/:id', async (req, res) => {

    try {

        const { id } = req.params;
        const { nombre, precio, stock } = req.body;

        const resultado = await db.query(
            `UPDATE productos
             SET nombre=$1, precio=$2, stock=$3
             WHERE id=$4
             RETURNING *`,
            [nombre, precio, stock, id]
        );

        res.json(resultado.rows[0]);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al actualizar'
        });

    }

});


// DELETE - eliminar producto
router.delete('/:id', async (req, res) => {

    try {

        const { id } = req.params;

        await db.query(
            'DELETE FROM productos WHERE id=$1',
            [id]
        );

        res.json({
            mensaje: 'Producto eliminado'
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            mensaje: 'Error al eliminar'
        });

    }

});


module.exports = router;