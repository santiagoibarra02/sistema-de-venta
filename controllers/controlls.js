const db = require('../db/index'); 

// GET - Obtener todos los productos
const getProductos = async (req, res) => {
    try {
        // Usamos id_producto que es como lo definiste en tu CREATE TABLE
        const result = await db.query('SELECT * FROM Productos ORDER BY id_producto ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

// GET - Obtener un producto por ID
const getProductoById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM Productos WHERE id_producto = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
};

// POST - Crear venta con TRANSACCIÓN y ROLLBACK (Requisito del TP)
const crearVenta = async (req, res) => {
    const { id_cliente, total, detalles } = req.body; 
    // detalles debe ser un array: [{ id_producto, cantidad, subtotal }, ...]

    try {
        // Iniciamos la transacción obligatoria
        await db.query('BEGIN');

        // 1. Insertar la venta principal en la tabla Ventas
        const ventaRes = await db.query(
            'INSERT INTO Ventas (id_cliente, fecha, total) VALUES ($1, NOW(), $2) RETURNING id_venta',
            [id_cliente, total]
        );
        const id_venta = ventaRes.rows[0].id_venta;

        // 2. Recorrer los detalles e insertar uno por uno
        for (let item of detalles) {
            // Insertar en Detalle_Venta
            await db.query(
                'INSERT INTO Detalle_Venta (id_venta, id_producto, cantidad, subtotal) VALUES ($1, $2, $3, $4)',
                [id_venta, item.id_producto, item.cantidad, item.subtotal]
            );
            
            // Actualizar el stock manualmente (ya que no usas triggers)
            await db.query(
                'UPDATE Productos SET stock = stock - $1 WHERE id_producto = $2',
                [item.cantidad, item.id_producto]
            );
        }

        // Si todo fue bien, confirmamos los cambios en la base de datos
        await db.query('COMMIT');
        res.status(201).json({ 
            mensaje: 'Venta registrada con éxito', 
            id_venta: id_venta 
        });

    } catch (error) {
        // SI ALGO FALLA, EL ROLLBACK CANCELA TODO LO ANTERIOR
        await db.query('ROLLBACK');
        console.error('Error detectado, se ejecutó ROLLBACK:', error);
        res.status(500).json({ 
            error: 'Error al procesar la venta. Se realizó un rollback para proteger los datos.',
            detalle: error.message 
        });
    }
};

module.exports = {
    getProductos,
    getProductoById,
    crearVenta
};