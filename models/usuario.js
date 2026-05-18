'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      // Relaciones básicas de un usuario
      Usuario.hasMany(models.Post, { foreignKey: 'usuarioId', as: 'posts', onDelete: 'CASCADE' });
      Usuario.hasMany(models.Comentario, { foreignKey: 'usuarioId', as: 'comentarios', onDelete: 'CASCADE' });
      
      // RELACIÓN RED SOCIAL: Alias modificados para evitar colisiones con el nombre de la tabla intermedia
      
      // Usuarios a los que ESTE usuario sigue (Mis seguidos)
      // Método mágico generado: usuario.getUsuariosSeguidos()
      Usuario.belongsToMany(models.Usuario, { 
        through: 'Seguidores', 
        as: 'usuariosSeguidos', 
        foreignKey: 'seguidorId', 
        otherKey: 'seguidoId' 
      });

      // Usuarios que siguen a ESTE usuario (Mis seguidores)
      // Método mágico generado: usuario.getUsuariosSeguidores()
      Usuario.belongsToMany(models.Usuario, { 
        through: 'Seguidores', 
        as: 'usuariosSeguidores', 
        foreignKey: 'seguidoId', 
        otherKey: 'seguidorId' 
      });
    }
  }
  
  Usuario.init({
    nickName: { 
      type: DataTypes.STRING, 
      allowNull: false, 
      unique: true 
    }
  }, { 
    sequelize, 
    modelName: 'Usuario', 
    tableName: 'Usuarios' 
  });
  
  return Usuario;
};




