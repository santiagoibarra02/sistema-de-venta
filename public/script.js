const vistaAcceso = document.getElementById('vista-acceso');
const vistaVentas = document.getElementById('vista-ventas');
const mensaje = document.getElementById('mensaje');

// Verifica si el usuario ya está logueado al cargar
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        vistaAcceso.classList.add('hidden');
        vistaVentas.classList.remove('hidden');
    } else {
        vistaAcceso.classList.remove('hidden');
        vistaVentas.classList.add('hidden');
    }
}

// --- REGISTRO ---
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('reg-nombre').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, email, password })
        });
        const data = await res.json();
        
        if (res.ok) {
            mensaje.innerText = "¡Registro exitoso! Ya puedes ingresar.";
            mensaje.style.color = "green";
            e.target.reset();
        } else {
            mensaje.innerText = "Error: " + (data.detalle || data.error);
            mensaje.style.color = "red";
        }
    } catch (err) { 
        mensaje.innerText = "Error al conectar con el servidor"; 
    }
});

// --- LOGIN ---
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {
            localStorage.setItem('token', data.token);
            mensaje.innerText = "Ingresando...";
            mensaje.style.color = "blue";
            setTimeout(() => {
                mensaje.innerText = "";
                checkAuth(); 
            }, 1000);
        } else {
            mensaje.innerText = "Error: " + data.mensaje;
            mensaje.style.color = "red";
        }
    } catch (err) { 
        mensaje.innerText = "Error al conectar con el servidor"; 
    }
});

// --- CERRAR SESIÓN ---
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    checkAuth();
    mensaje.innerText = "Has salido del sistema";
    mensaje.style.color = "black";
});

// Inicializar
checkAuth();
// --- AGREGAR PRODUCTO ---
document.getElementById('producto-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nombre = document.getElementById('prod-nombre').value;
    const precio = document.getElementById('prod-precio').value;
    const stock = document.getElementById('prod-stock').value;

    try {
        const res = await fetch('/api/productos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, precio, stock })
        });
        const data = await res.json();

        if (res.ok) {
            mensaje.innerText = "¡Producto guardado!";
            mensaje.style.color = "green";
            e.target.reset();
            cargarProductos(); // Refrescar la lista automáticamente
        } else {
            mensaje.innerText = "Error: " + data.detalle;
            mensaje.style.color = "red";
        }
    } catch (err) {
        mensaje.innerText = "Error de conexión al guardar producto";
    }
});

// --- CARGAR LISTA DE PRODUCTOS ---
async function cargarProductos() {
    const lista = document.getElementById('lista-productos');
    try {
        const res = await fetch('/api/productos');
        const productos = await res.json();

        lista.innerHTML = ""; // Limpiar lista
        productos.forEach(p => {
            const li = document.createElement('li');
            li.style.padding = "10px";
            li.style.borderBottom = "1px solid #ddd";
            li.innerHTML = `<strong>${p.nombre}</strong> - $${p.precio} (Stock: ${p.stock})`;
            lista.appendChild(li);
        });
    } catch (err) {
        console.error("Error al cargar productos", err);
    }
}

// Escuchar el botón de actualizar lista
document.getElementById('btn-cargar-productos').addEventListener('click', cargarProductos);

// Modificar checkAuth para que cargue productos si hay sesión activa
function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        vistaAcceso.classList.add('hidden');
        vistaVentas.classList.remove('hidden');
        cargarProductos(); // <--- Cargar lista al entrar
    } else {
        vistaAcceso.classList.remove('hidden');
        vistaVentas.classList.add('hidden');
    }
}