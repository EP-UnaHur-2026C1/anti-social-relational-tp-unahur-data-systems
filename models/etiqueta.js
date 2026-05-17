'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Etiqueta extends Model {
    static associate(models) {
      Etiqueta.belongsToMany(models.Post, { through: 'Post_Tags', foreignKey: 'etiquetaId', as: 'posts' });
    }
  }
  Etiqueta.init({
    nombre: { type: DataTypes.STRING, allowNull: false, unique: true }
  }, { sequelize, modelName: 'Etiqueta', tableName: 'Etiquetas' });
  return Etiqueta;
};