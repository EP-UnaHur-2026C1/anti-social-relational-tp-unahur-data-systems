'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Comentario extends Model {
    static associate(models) {
      Comentario.belongsTo(models.Post, { foreignKey: 'postId', onDelete: 'CASCADE' });
      Comentario.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'autor', onDelete: 'CASCADE' });
    }
  }
  Comentario.init({
    texto: { type: DataTypes.TEXT, allowNull: false },
    fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { sequelize, modelName: 'Comentario', tableName: 'Comentarios' });
  return Comentario;
};