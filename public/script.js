// --- REFERENCIAS A ELEMENTOS ---
const vistaBienvenida = document.getElementById('vista-bienvenida');
const vistaAcceso = document.getElementById('vista-acceso');
const vistaVentas = document.getElementById('vista-ventas');
const boxLogin = document.getElementById('box-login');
const boxRegistro = document.getElementById('box-registro');
const mensaje = document.getElementById('mensaje');

// --- NAVEGACIÓN INICIAL ---

document.getElementById('btn-ir-login').addEventListener('click', () => {
    vistaBienvenida.classList.add('hidden');
    vistaAcceso.classList.remove('hidden');
    boxLogin.classList.remove('hidden');
    boxRegistro.classList.add('hidden');
});

document.getElementById('btn-ir-registro').addEventListener('click', () => {
    vistaBienvenida.classList.add('hidden');
    vistaAcceso.classList.remove('hidden');
    boxRegistro.classList.remove('hidden');
    boxLogin.classList.add('hidden');
});

function volverBienvenida() {
    vistaBienvenida.classList.remove('hidden');
    vistaAcceso.classList.add('hidden');
    boxLogin.classList.add('hidden');
    boxRegistro.classList.add('hidden');
    mensaje.innerText = "";
}

// --- AUTENTICACIÓN ---

function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        // Usuario logueado: mostramos ventas, ocultamos el resto
        vistaBienvenida.classList.add('hidden');
        vistaAcceso.classList.add('hidden');
        vistaVentas.classList.remove('hidden');
        cargarProductos(); 
    } else {
        // Usuario no logueado: mostramos bienvenida, ocultamos ventas
        vistaBienvenida.classList.remove('hidden');
        vistaAcceso.classList.add('hidden');
        vistaVentas.classList.add('hidden');
    }
}

// --- REGISTRO Y LOGIN ---

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
            setTimeout(() => {
                boxRegistro.classList.add('hidden');
                boxLogin.classList.remove('hidden');
            }, 1500);
        } else {
            mensaje.innerText = "Error: " + (data.detalle || data.error);
            mensaje.style.color = "red";
        }
    } catch (err) { mensaje.innerText = "Error de conexión"; }
});

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
            mensaje.innerText = "Error: " + (data.mensaje || "Acceso denegado");
            mensaje.style.color = "red";
        }
    } catch (err) { mensaje.innerText = "Error de conexión"; }
});

document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    checkAuth();
    mensaje.innerText = "Has salido del sistema";
    mensaje.style.color = "black";
});

// --- GESTIÓN DE PRODUCTOS ---

async function cargarProductos() {
    const lista = document.getElementById('lista-productos');
    try {
        const res = await fetch('/api/productos');
        const productos = await res.json();
        lista.innerHTML = ""; 
        productos.forEach(p => {
            const li = document.createElement('li');
            li.style.padding = "10px";
            li.style.borderBottom = "1px solid #ddd";
            li.innerHTML = `<strong>${p.nombre}</strong> - $${p.precio} (Stock: ${p.stock})`;
            lista.appendChild(li);
        });
    } catch (err) { console.error("Error al cargar productos", err); }
}

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
        if (res.ok) {
            e.target.reset();
            cargarProductos();
        }
    } catch (err) { console.error(err); }
});

document.getElementById('btn-cargar-productos').addEventListener('click', cargarProductos);

// INICIO
checkAuth();