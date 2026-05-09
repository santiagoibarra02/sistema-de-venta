1. Servidor web y ciclo Request-Response
Un servidor web es un software que espera peticiones de clientes para entregarles recursos. El ciclo comienza cuando el cliente envía una Request (solicitud de datos o acciones) y termina cuando el servidor procesa el pedido y devuelve una Response con un código de estado y el contenido solicitado.

2. Express vs. Node.js puro
Node.js es el entorno de ejecución, mientras que Express es un framework que facilita la creación de servidores sobre él. Usamos Express porque simplifica enormemente el manejo de rutas, peticiones y lógica intermedia (middleware), ahorrando escribir cientos de líneas de código manual que Node requeriría por sí solo.

3. JWT vs. Sesiones en el servidor
La sesión tradicional guarda un archivo en el servidor y le da un ID al usuario; el servidor debe "recordar" a cada cliente. El JWT es un token firmado que contiene toda la información necesaria y se guarda en el cliente; el servidor no guarda nada, solo valida la firma del token al recibirlo.

4. Ventajas de los Procedimientos Almacenados
Su principal ventaja es el rendimiento, ya que el código SQL se ejecuta directamente dentro de la base de datos sin viajar por la red. Además, mejora la seguridad al centralizar la lógica y reducir la exposición a inyecciones SQL, permitiendo ejecutar procesos complejos con una sola instrucción desde Node.js.

5. Importancia de las Transacciones
Son vitales para asegurar que un grupo de operaciones se complete con éxito o falle totalmente, evitando datos corruptos. Un ROLLBACK salva la integridad cuando, por ejemplo, falla el abono en una transferencia: si el dinero salió de la cuenta A pero no entró a la B, el sistema deshace el primer paso automáticamente.

6. Triggers (Disparadores)
Un trigger es un bloque de código que se ejecuta automáticamente ante un evento (INSERT, UPDATE o DELETE) en una tabla. Se suelen implementar para auditoría; por ejemplo, un disparador AFTER UPDATE que registra en una tabla secundaria qué usuario cambió un dato y en qué fecha exacta ocurrió.