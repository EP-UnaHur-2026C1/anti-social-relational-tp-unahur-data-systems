'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    static associate(models) {
      // Relación con el Usuario creador (autor)
      Post.belongsTo(models.Usuario, { foreignKey: 'usuarioId', as: 'autor', onDelete: 'CASCADE' });
      
      // Relación con las imágenes asociadas
      Post.hasMany(models.PostImage, { foreignKey: 'postId', as: 'imagenes', onDelete: 'CASCADE' });
      
      // Relación con los comentarios recibidos
      Post.hasMany(models.Comentario, { foreignKey: 'postId', as: 'comentarios', onDelete: 'CASCADE' });
      
      // Relación Muchos a Muchos con Etiquetas mediante la tabla intermedia Post_Tags
      Post.belongsToMany(models.Etiqueta, { 
        through: 'Post_Tags', 
        foreignKey: 'postId', 
        otherKey: 'etiquetaId',
        as: 'etiquetas' 
      });
    }
  }

  Post.init({
    descripcion: { 
      type: DataTypes.TEXT, 
      allowNull: false 
    },
    fechaCreacion: { 
      type: DataTypes.DATE, 
      defaultValue: DataTypes.NOW 
    }
  }, { 
    sequelize, 
    modelName: 'Post', 
    tableName: 'Posts' 
  });

  return Post;
};
