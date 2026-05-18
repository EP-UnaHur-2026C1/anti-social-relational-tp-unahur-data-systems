const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');

// ==========================================
// Mapeo del CRUD Básico de Usuarios
// ==========================================
router.get('/', usuarioController.getAll);
router.get('/:id', usuarioController.getById);
router.post('/', usuarioController.create);
router.put('/:id', usuarioController.update);
router.delete('/:id', usuarioController.delete);

// ==========================================
// Funcionalidades de Red Social 
// ==========================================

// Seguir a un usuario (Recibe seguidorId y seguidoId en el body)
router.post('/seguir', usuarioController.seguirUsuario);

// Dejar de seguir a un usuario (Recibe seguidorId y seguidoId en el body)
router.post('/dejar-seguir', usuarioController.dejarDeSeguirUsuario);

// Obtener el Feed personalizado de un usuario por su ID
router.get('/:id/feed', usuarioController.getFeed);

module.exports = router;