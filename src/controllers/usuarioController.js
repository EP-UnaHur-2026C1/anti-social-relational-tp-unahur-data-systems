'use strict';
const { Usuario, Post, PostImage } = require('../../models');

module.exports = {
  // 1. Obtener todos los usuarios
  async getAll(req, res) {
    try {
      const usuarios = await Usuario.findAll();
      return res.status(200).json(usuarios);
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener los usuarios: " + error.message });
    }
  },

  // 2. Obtener un usuario por ID
  async getById(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }
      return res.status(200).json(usuario);
    } catch (error) {
      return res.status(500).json({ error: "Error al obtener el usuario: " + error.message });
    }
  },

  // 3. Crear un nuevo usuario (Validando unicidad de nickName)
  async create(req, res) {
    try {
      const { nickName } = req.body || {};

      if (!nickName || nickName.trim() === "") {
        return res.status(400).json({ error: "El campo nickName es obligatorio" });
      }

      // Validación de integridad referencial/esquema manual antes de insertar
      const existeUsuario = await Usuario.findOne({ where: { nickName: nickName.trim() } });
      if (existeUsuario) {
        return res.status(400).json({ error: `El nickName '${nickName}' ya se encuentra registrado` });
      }

      const nuevoUsuario = await Usuario.create({ nickName: nickName.trim() });
      return res.status(201).json(nuevoUsuario);
    } catch (error) {
      return res.status(500).json({ error: "Error al crear el usuario: " + error.message });
    }
  },

  // 4. Actualizar un usuario
  async update(req, res) {
    try {
      const { id } = req.params;
      const { nickName } = req.body || {};

      if (!nickName || nickName.trim() === "") {
        return res.status(400).json({ error: "El campo nickName no puede estar vacío" });
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      // Verificar si el nuevo nickName ya lo tiene OTRO usuario
      if (nickName.trim() !== usuario.nickName) {
        const existeNick = await Usuario.findOne({ where: { nickName: nickName.trim() } });
        if (existeNick) {
          return res.status(400).json({ error: `El nickName '${nickName}' ya está siendo usado por otro usuario` });
        }
      }

      usuario.nickName = nickName.trim();
      await usuario.save();

      return res.status(200).json(usuario);
    } catch (error) {
      return res.status(500).json({ error: "Error al actualizar el usuario: " + error.message });
    }
  },

  // 5. Eliminar un usuario (Al borrarlo, Sequelize aplicará ON DELETE CASCADE a sus posts por la migración)
  async delete(req, res) {
    try {
      const { id } = req.params;
      const usuario = await Usuario.findByPk(id);
      
      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado" });
      }

      await usuario.destroy();
      return res.status(200).json({ message: `Usuario '${usuario.nickName}' eliminado correctamente.` });
    } catch (error) {
      return res.status(500).json({ error: "Error al eliminar el usuario: " + error.message });
    }
  },

  // ==========================================
  // FUNCIONALIDADES DE RED SOCIAL (NUEVO)
  // ==========================================

  // 6. Seguir a un usuario
  async seguirUsuario(req, res) {
    try {
      const { seguidorId, seguidoId } = req.body || {};

      if (parseInt(seguidorId) === parseInt(seguidoId)) {
        return res.status(400).json({ error: "No podés seguirte a vos mismo." });
      }

      const seguidor = await Usuario.findByPk(seguidorId);
      const seguido = await Usuario.findByPk(seguidoId);

      if (!seguidor || !seguido) {
        return res.status(404).json({ error: "Usuario seguidor o seguido no encontrado." });
      }

      // addUsuariosSeguidos es el método mágico que genera el alias 'usuariosSeguidos'
      await seguidor.addUsuariosSeguidos(seguido);

      return res.status(200).json({ message: `Ahora seguís a '${seguido.nickName}' correctamente.` });
    } catch (error) {
      return res.status(500).json({ error: "Error al seguir usuario: " + error.message });
    }
  },

  // 7. Dejar de seguir a un usuario
  async dejarDeSeguirUsuario(req, res) {
    try {
      const { seguidorId, seguidoId } = req.body || {};

      const seguidor = await Usuario.findByPk(seguidorId);
      const seguido = await Usuario.findByPk(seguidoId);

      if (!seguidor || !seguido) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      // removeUsuariosSeguidos rompe la fila correspondiente en la tabla 'Seguidores'
      await seguidor.removeUsuariosSeguidos(seguido);

      return res.status(200).json({ message: `Dejaste de seguir a '${seguido.nickName}'.` });
    } catch (error) {
      return res.status(500).json({ error: "Error al dejar de seguir usuario: " + error.message });
    }
  },

  // 8. Obtener el Feed personalizado (Publicaciones de los usuarios seguidos)
  async getFeed(req, res) {
    try {
      const { id } = req.params; // ID del usuario que consulta su pantalla de inicio

      const usuario = await Usuario.findByPk(id, {
        include: {
          model: Usuario,
          as: 'usuariosSeguidos',
          attributes: ['id']
        }
      });

      if (!usuario) {
        return res.status(404).json({ error: "Usuario no encontrado." });
      }

      // Extraer los IDs del array de seguidos
      const idsSeguidos = usuario.usuariosSeguidos.map(u => u.id);

      // Si no sigue a nadie, devolvemos un array vacío sin necesidad de consultar Posts
      if (idsSeguidos.length === 0) {
        return res.status(200).json([]);
      }

      // Traer los posts de las personas seguidas
      const feed = await Post.findAll({
        where: {
          usuarioId: idsSeguidos // Genera automáticamente un "WHERE usuarioId IN (...)"
        },
        include: [
          { model: Usuario, as: 'autor', attributes: ['id', 'nickName'] },
          { model: PostImage, as: 'imagenes', attributes: ['id', 'urlImagen'] }
        ],
        order: [['fechaCreacion', 'DESC']] // Listado ordenado cronológicamente (más recientes primero)
      });

      return res.status(200).json(feed);
    } catch (error) {
      return res.status(500).json({ error: "Error al cargar el feed de publicaciones: " + error.message });
    }
  }
};