'use strict';
const { Comentario, Usuario, Post } = require('../../models');
const { Op } = require('sequelize');

module.exports = {
  // 1. Crear un comentario en una publicación
  async create(req, res) {
    try {
      const { contenido, usuarioId, postId } = req.body;

      if (!contenido || contenido.trim() === "") {
        return res.status(400).json({ error: "El contenido del comentario no puede estar vacío." });
      }

      // Validar que existan tanto el usuario como el post (Integridad referencial)
      const usuario = await Usuario.findByPk(usuarioId);
      const post = await Post.findByPk(postId);

      if (!usuario) {
        return res.status(404).json({ error: "El usuario que intenta comentar no existe." });
      }
      if (!post) {
        return res.status(404).json({ error: "La publicación que querés comentar no existe." });
      }

      // MODIFICADO: Se mapea "contenido" (lo que manda el frontend/Swagger) hacia la columna "texto" del modelo
      const nuevoComentario = await Comentario.create({
        texto: contenido.trim(),
        usuarioId,
        postId
      });

      return res.status(201).json(nuevoComentario);
    } catch (error) {
      return res.status(500).json({ error: "Error al crear el comentario: " + error.message });
    }
  },

  // 2. Obtener comentarios de un Post aplicando el FILTRO TEMPORAL del .env
  async getByPost(req, res) {
    try {
      const { postId } = req.params;

      // 1. Leer el límite de meses desde el archivo .env (si no existe, por defecto usamos 6)
      const mesesLimite = parseInt(process.env.LIMITE_MESES_COMENTARIOS) || 6;

      // 2. Calcular la fecha límite restando los meses a la fecha actual
      const fechaLimite = new Date();
      fechaLimite.setMonth(fechaLimite.getMonth() - mesesLimite);

      // 3. Buscar los comentarios que pertenezcan al post Y cuya fecha de creación sea mayor o igual a la límite
      const comentarios = await Comentario.findAll({
        where: {
          postId,
          createdAt: {
            [Op.gte]: fechaLimite // "createdAt >= fechaLimite"
          }
        },
        include: {
          model: Usuario,
          as: 'autor', // Recordá verificar que coincida con el alias en las relaciones del modelo
          attributes: ['id', 'nickName']
        },
        order: [['createdAt', 'DESC']] // Los más recientes primero
      });

      return res.status(200).json({
        configLimiteMeses: mesesLimite,
        fechaFiltroAplicada: fechaLimite,
        comentarios
      });
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener los comentarios: " + error.message });
    }
  }
};