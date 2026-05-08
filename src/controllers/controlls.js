const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const db = require('../db/index'); 

// REGISTRO
exports.register = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        if (!nombre || !email || !password) return res.status(400).json({ error: "Faltan datos" });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const result = await db.query(
            'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id_usuario, nombre, email',
            [nombre, email, hashedPassword]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (result.rows.length === 0) return res.status(400).json({ mensaje: 'Usuario no encontrado' });

        const usuario = result.rows[0];
        const validPassword = await bcrypt.compare(password, usuario.password);
        if (!validPassword) return res.status(400).json({ mensaje: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: usuario.id_usuario }, process.env.JWT_SECRET || 'clave', { expiresIn: '2h' });
        res.json({ mensaje: 'Bienvenido', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PRODUCTOS
exports.getProductos = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM productos ORDER BY id_producto ASC');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CREAR PRODUCTO
exports.crearProducto = async (req, res) => {
    try {
        const { nombre, precio, stock } = req.body;
        const result = await db.query(
            'INSERT INTO productos (nombre, precio, stock) VALUES ($1, $2, $3) RETURNING *',
            [nombre, precio, stock]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// VENTA
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
            await db.query('INSERT INTO Detalle_Venta (id_venta, id_producto, cantidad, subtotal) VALUES ($1, $2, $3, $4)', [id_venta, item.id_producto, item.cantidad, item.subtotal]);
            await db.query('UPDATE productos SET stock = stock - $1 WHERE id_producto = $2', [item.cantidad, item.id_producto]);
        }
        await db.query('COMMIT');
        res.status(201).json({ mensaje: 'Venta realizada', id_venta });
    } catch (error) {
        await db.query('ROLLBACK');
        res.status(500).json({ error: error.message });
    }
};