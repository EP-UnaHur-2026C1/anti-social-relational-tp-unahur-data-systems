const express = require('express');
const router = express.Router();
const comentarioController = require('../controllers/comentarioController');

// Rutas para los comentarios
router.post('/', comentarioController.create);
router.get('/post/:postId', comentarioController.getByPost);

module.exports = router;