'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      Usuario.hasMany(models.Post, { foreignKey: 'usuarioId', as: 'posts', onDelete: 'CASCADE' });
      Usuario.hasMany(models.Comentario, { foreignKey: 'usuarioId', as: 'comentarios', onDelete: 'CASCADE' });
      
      // Relación Seguidos y Seguidores (Muchos a Muchos Autorreferencial)
      Usuario.belongsToMany(models.Usuario, { 
        through: 'Seguidores', 
        as: 'Seguidos', 
        foreignKey: 'seguidorId', 
        otherKey: 'seguidoId' 
      });
      Usuario.belongsToMany(models.Usuario, { 
        through: 'Seguidores', 
        as: 'Seguidores', 
        foreignKey: 'seguidoId', 
        otherKey: 'seguidorId' 
      });
    }
  }
  Usuario.init({
    nickName: { type: DataTypes.STRING, allowNull: false, unique: true }
  }, { sequelize, modelName: 'Usuario', tableName: 'Usuarios' });
  return Usuario;
};