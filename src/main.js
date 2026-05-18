require('dotenv').config(); // Lee las variables del .env
const express = require('express');
const path = require('path'); // Para resolver las rutas físicas de los archivos subidos
const db = require('../models'); // Importa Sequelize y los modelos

const comentarioRoutes = require('./routes/comentarioRoutes');

// Importación de Swagger 
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./docs/swaggerSpec');

// Importación de Rutas
const usuarioRoutes = require('./routes/usuarioRoutes');
const postRoutes = require('./routes/postRoutes'); // Enrutador de publicaciones

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales obligatorios
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Multer guarda las imágenes de forma pública y estática
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// =========================================================================
// CORRECCIÓN: Se agrega el middleware de Swagger ANTES del manejador de 404
// =========================================================================
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Conexión de los módulos de rutas
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/posts', postRoutes); // Agregamos el endpoint base para el CRUD de Posts
app.use('/api/comentarios', comentarioRoutes);


// Ruta base de prueba
app.get('/', (req, res) => {
  res.json({
    name: "UnaHur Anti-Social Net API",
    version: "1.0.0",
    status: "Online",
    database: "SQLite (Sequelize) Connected",
    docs: `http://localhost:${PORT}/api-docs`
  });
});

// Manejo de rutas inexistentes (404) - ¡Siempre al final de todo!
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// Inicialización del entorno del servidor de forma segura
async function bootstrap() {
  try {
    // Autentica que el archivo SQLite sea legible y esté listo
    await db.sequelize.authenticate();
    console.log('📦 Conexión a la base de datos SQLite establecida correctamente.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`🐳 Interfaz de Swagger disponible en: http://localhost:${PORT}/api-docs`);
      console.log(`📌 Probá el CRUD de usuarios en: http://localhost:${PORT}/api/usuarios`);
      console.log(`📌 Probá el CRUD de posts en: http://localhost:${PORT}/api/posts`);
    });
  } catch (error) {
    console.error('❌ Error crítico al iniciar el backend:', error);
    process.exit(1);
  }
}

bootstrap();