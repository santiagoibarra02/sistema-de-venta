const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const db = require('../db/index'); 

// --- LÓGICA DE USUARIOS (AUTH) ---

exports.register = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        if (!nombre || !email || !password) {
            return res.status(400).json({ error: "Faltan datos obligatorios" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id_usuario, nombre, email',
            [nombre, email, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error en el servidor', detalle: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
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
        res.status(500).json({ error: 'Error en el login', detalle: error.message });
    }
};

// --- LÓGICA DE PRODUCTOS ---

exports.getProductos = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM Productos ORDER BY id_producto ASC');
        res.status(200).json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener productos' });
    }
};

exports.getProductoById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM Productos WHERE id_producto = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ mensaje: 'Producto no encontrado' });
        }
        res.status(200).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener el producto' });
    }
};

// --- LÓGICA DE VENTAS (CON TRANSACCIÓN) ---

exports.crearVenta = async (req, res) => {
    const { id_cliente, total, detalles } = req.body; 
    try {
        await db.query('BEGIN');

        const ventaRes = await db.query(
            'INSERT INTO Ventas (id_cliente, fecha, total) VALUES ($1, NOW(), $2) RETURNING id_venta',
            [id_cliente, total]
        );
        const id_venta = ventaRes.rows[0].id_venta;

        for (let item of detalles) {
            await db.query(
                'INSERT INTO Detalle_Venta (id_venta, id_producto, cantidad, subtotal) VALUES ($1, $2, $3, $4)',
                [id_venta, item.id_producto, item.cantidad, item.subtotal]
            );
            
            await db.query(
                'UPDATE Productos SET stock = stock - $1 WHERE id_producto = $2',
                [item.cantidad, item.id_producto]
            );
        }

        await db.query('COMMIT');
        res.status(201).json({ mensaje: 'Venta registrada con éxito', id_venta });

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('ROLLBACK ejecutado:', error.message);
        res.status(500).json({ error: 'Error al procesar la venta', detalle: error.message });
    }
}; 
// --- AGREGAR NUEVO PRODUCTO ---
exports.crearProducto = async (req, res) => {
    try {
        const { nombre, precio, stock } = req.body;

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
};