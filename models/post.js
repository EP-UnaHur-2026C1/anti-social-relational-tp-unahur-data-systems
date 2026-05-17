'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      Post.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'autor', onDelete: 'CASCADE' });
      Post.hasMany(models.PostImage, { foreignKey: 'postId', as: 'imagenes', onDelete: 'CASCADE' });
      Post.hasMany(models.Comentario, { foreignKey: 'postId', as: 'comentarios', onDelete: 'CASCADE' });
      
      // Relación Muchos a Muchos con Etiqueta
      Post.belongsToMany(models.Etiqueta, { through: 'Post_Tags', foreignKey: 'postId', as: 'etiquetas' });
    }
  }
  Post.init({
    descripcion: { type: DataTypes.TEXT, allowNull: false },
    fechaCreacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
  }, { sequelize, modelName: 'Post', tableName: 'Posts' });
  return Post;
};