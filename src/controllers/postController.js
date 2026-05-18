'use strict';
const { Post, PostImage, Usuario, Etiqueta, Comentario } = require('../../models');
const { Op } = require('sequelize');

module.exports = {
  // 1. Crear una publicación con imágenes y etiquetas opcionales
  async create(req, res) {
    try {
      let { descripcion, usuarioId, etiquetas } = req.body;

      if (!descripcion || descripcion.trim() === "") {
        return res.status(400).json({ error: "La descripción del post es obligatoria." });
      }

      // Validar integridad referencial: ¿Existe el usuario que publica?
      const usuario = await Usuario.findByPk(usuarioId);
      if (!usuario) {
        return res.status(404).json({ error: "El usuario especificado no existe." });
      }

      // Crear el Post base
      const nuevoPost = await Post.create({
        descripcion: descripcion.trim(),
        usuarioId
      });

      // --- LOGICA DE IMÁGENES (MULTER) ---
      if (req.files && req.files.length > 0) {
        const registrosImagenes = req.files.map(file => ({
          urlImagen: `/uploads/${file.filename}`,
          postId: nuevoPost.id
        }));
        await PostImage.bulkCreate(registrosImagenes);
      }

      // --- LÓGICA DE ETIQUETAS (TAGS) ---
      if (etiquetas) {
        // Manejar el formato por si viene como String desde form-data de Swagger/Postman
        if (typeof etiquetas === 'string') {
          try {
            // Intentamos parsear si viene como JSON array string: '["estudio", "unahur"]'
            etiquetas = JSON.parse(etiquetas);
          } catch (e) {
            // Si no es JSON válido, asumimos lista separada por comas: "estudio, unahur"
            etiquetas = etiquetas.split(',').map(tag => tag.trim());
          }
        }

        if (Array.isArray(etiquetas) && etiquetas.length > 0) {
          const instanciasEtiquetas = [];

          for (const nombreTag of etiquetas) {
            if (nombreTag && nombreTag.trim() !== "") {
              // findOrCreate busca la etiqueta o la crea si no existe para evitar duplicados
              const [etiquetaInstancia] = await Etiqueta.findOrCreate({
                where: { nombre: nombreTag.trim().toLowerCase() } // Almacenamos en minúsculas por convención
              });
              instanciasEtiquetas.push(etiquetaInstancia);
            }
          }

          // Método asociativo Muchos a Muchos de Sequelize para insertar en la tabla intermedia
          await nuevoPost.setEtiquetas(instanciasEtiquetas);
        }
      }

      // Traer el post recién creado con todas sus relaciones mapeadas para la respuesta del cliente
      const postCompleto = await Post.findByPk(nuevoPost.id, {
        include: [
          { model: PostImage, as: 'imagenes', attributes: ['id', 'urlImagen'] },
          { model: Etiqueta, as: 'etiquetas', attributes: ['id', 'nombre'], through: { attributes: [] } }
        ]
      });

      return res.status(201).json(postCompleto);
    } catch (error) {
      return res.status(500).json({ error: "Error al crear la publicación: " + error.message });
    }
  },

  // 2. Obtener todas las publicaciones filtrando comentarios antiguos dinámicamente (.env)
  async getAll(req, res) {
    try {
      // Configuración del filtro temporal dinámico mediante variables de entorno
      const mesesLimite = parseInt(process.env.LIMITE_MESES_COMENTARIOS) || 6;
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() - mesesLimite);

      const posts = await Post.findAll({
        include: [
          { model: Usuario, as: 'autor', attributes: ['id', 'nickName'] },
          { model: PostImage, as: 'imagenes', attributes: ['id', 'urlImagen'] },
          { model: Etiqueta, as: 'etiquetas', attributes: ['id', 'nombre'], through: { attributes: [] } },
          
          // Inyección relacional de comentarios con restricción de fecha estricta
          {
            model: Comentario,
            as: 'comentarios',
            where: {
              createdAt: {
                [Op.gte]: fechaLimite // Solo trae comentarios donde createdAt >= fechaLimite
              }
            },
            required: false, // LEFT OUTER JOIN: permite que el Post aparezca aunque no tenga comentarios
            include: [
              { model: Usuario, as: 'autor', attributes: ['id', 'nickName'] }
            ]
          }
        ],
        order: [
          ['createdAt', 'DESC'], // CORREGIDO: Se cambió 'fechaCreacion' por la columna estándar 'createdAt'
          [{ model: Comentario, as: 'comentarios' }, 'createdAt', 'DESC'] // Ordena los comentarios internos por fecha más reciente
        ]
      });

      return res.status(200).json(posts);
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener publicaciones: " + error.message });
    }
  },

  // 3. Eliminar una publicación (Borrado físico y cascada relacional)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const post = await Post.findByPk(id);

      if (!post) {
        return res.status(404).json({ error: "Publicación no encontrada." });
      }

      await post.destroy();
      return res.status(200).json({ message: "Publicación eliminada correctamente." });
    } catch (error) {
      return res.status(500).json({ error: "Error al eliminar la publicación: " + error.message });
    }
  }
};