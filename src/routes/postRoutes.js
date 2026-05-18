const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const upload = require('../middlewares/uploadMiddleware');

// Rutas expuestas
router.get('/', postController.getAll);
router.post('/', upload.array('imagenes', 5), postController.create);
router.delete('/:id', postController.delete);

module.exports = router;