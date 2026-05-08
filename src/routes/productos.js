const express = require('express');
const router = express.Router();
// Importamos el controlador (fíjate en la doble 'l' y 's' de tu archivo)
const productsController = require('../controllers/controlls.js');

// GET - Listar todos los productos
router.get('/', productsController.getProductos);

// POST - Crear un nuevo producto
router.post('/', productsController.crearProducto);

// POST - Crear venta (con la transacción que ya tenías)
router.post('/venta', productsController.crearVenta);

module.exports = router;