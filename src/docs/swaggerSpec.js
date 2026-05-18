const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'UnaHur Anti-Social Net API',
      version: '1.0.0',
      description: 'Documentación interactiva de la API para el Trabajo Práctico de Sistemas de Datos - UNaHur.',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de Desarrollo Local',
      },
    ],
    components: {
      schemas: {
        Usuario: {
          type: 'object',
          required: ['nickName'],
          properties: {
            id: { type: 'integer', example: 1 },
            nickName: { type: 'string', example: 'martin_maldonado' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Post: {
          type: 'object',
          required: ['descripcion', 'usuarioId'],
          properties: {
            id: { type: 'integer', example: 10 },
            descripcion: { type: 'string', example: 'Festejando que levantó el backend de Sequelize! 🚀' },
            usuarioId: { type: 'integer', example: 1 },
            fechaCreacion: { type: 'string', format: 'date-time' }
          }
        },
        Comentario: {
          type: 'object',
          required: ['contenido', 'usuarioId', 'postId'],
          properties: {
            id: { type: 'integer', example: 5 },
            contenido: { type: 'string', example: 'Buenísimo el backend, compañero! Te felicito.' },
            usuarioId: { type: 'integer', example: 2 },
            postId: { type: 'integer', example: 10 },
            createdAt: { type: 'string', format: 'date-time' }
          }
        },
        Etiqueta: {
          type: 'object',
          required: ['nombre'],
          properties: {
            id: { type: 'integer', example: 3 },
            nombre: { type: 'string', example: 'unahur' }
          }
        }
      }
    },
    paths: {
      // ==================== ENDPOINTS DE USUARIOS ====================
      '/api/usuarios': {
        get: {
          summary: 'Obtener todos los usuarios',
          tags: ['Usuarios'],
          responses: {
            200: { description: 'Lista de usuarios devuelta con éxito.' }
          }
        },
        post: {
          summary: 'Crear un nuevo usuario',
          tags: ['Usuarios'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['nickName'],
                  properties: { nickName: { type: 'string', example: 'katia_dev' } }
                }
              }
            }
          },
          responses: {
            201: { description: 'Usuario creado correctamente.' },
            400: { description: 'El nickName ya existe o está vacío.' }
          }
        }
      },
      '/api/usuarios/{id}': {
        get: {
          summary: 'Obtener un usuario por ID',
          tags: ['Usuarios'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Usuario encontrado.' },
            404: { description: 'Usuario no encontrado.' }
          }
        }
      },
      '/api/usuarios/seguir': {
        post: {
          summary: 'Seguir a un usuario',
          tags: ['Red Social'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    seguidorId: { type: 'integer', example: 1 },
                    seguidoId: { type: 'integer', example: 2 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Ahora seguís al usuario correctamente.' },
            400: { description: 'No podés seguirte a vos mismo.' }
          }
        }
      },
      '/api/usuarios/dejar-seguir': {
        post: {
          summary: 'Dejar de seguir a un usuario',
          tags: ['Red Social'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    seguidorId: { type: 'integer', example: 1 },
                    seguidoId: { type: 'integer', example: 2 }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Dejaste de seguir al usuario correctamente.' }
          }
        }
      },
      '/api/usuarios/{id}/feed': {
        get: {
          summary: 'Obtener el Feed de un usuario',
          description: 'Devuelve las publicaciones de los usuarios a los que sigue ordenadas cronológicamente.',
          tags: ['Red Social'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Feed cargado correctamente.' }
          }
        }
      },
      // ==================== ENDPOINTS DE POSTS ====================
      '/api/posts': {
        get: {
          summary: 'Obtener todas las publicaciones',
          description: 'Trae los posts con sus autores, imágenes asociadas, etiquetas vinculadas y comentarios filtrados de manera automática según el umbral de meses configurado en el archivo .env.',
          tags: ['Publicaciones'],
          responses: {
            200: { description: 'Lista de publicaciones devuelta con éxito.' }
          }
        },
        post: {
          summary: 'Crear una publicación con imágenes y etiquetas (Multer)',
          description: 'Permite subir archivos usando multipart/form-data e ingresar las etiquetas asociadas en el mismo envío.',
          tags: ['Publicaciones'],
          requestBody: {
            required: true,
            content: {
              'multipart/form-data': {
                schema: {
                  type: 'object',
                  properties: {
                    descripcion: { type: 'string', example: 'Miren este michi en el campus de Hurlingham' },
                    usuarioId: { type: 'integer', example: 1 },
                    imagenes: {
                      type: 'array',
                      items: { type: 'string', format: 'binary' },
                      description: 'Hasta 5 archivos de imagen simultáneos de forma opcional.'
                    },
                    etiquetas: {
                      type: 'string',
                      example: 'unahur, base-de-datos, estudio',
                      description: 'Lista de etiquetas opcionales separadas por comas o en formato JSON array string.'
                    }
                  },
                  required: ['descripcion', 'usuarioId']
                }
              }
            }
          },
          responses: {
            201: { description: 'Post creado con sus imágenes y etiquetas vinculadas con éxito.' },
            400: { description: 'Error en los datos de entrada o descripción vacía.' },
            404: { description: 'El usuario especificado no existe.' }
          }
        }
      },
      '/api/posts/{id}': {
        delete: {
          summary: 'Eliminar una publicación',
          description: 'Elimina el post de forma física. Las referencias en imágenes, comentarios y asociaciones de etiquetas se manejan automáticamente por CASCADE.',
          tags: ['Publicaciones'],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Publicación eliminada correctamente.' },
            404: { description: 'Post no encontrado.' }
          }
        }
      },
      // ==================== ENDPOINTS DE COMENTARIOS ====================
      '/api/comentarios': {
        post: {
          summary: 'Dejar un comentario en un post',
          tags: ['Comentarios'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['contenido', 'usuarioId', 'postId'],
                  properties: {
                    contenido: { type: 'string', example: '¡Muy buen posteo, compañero!' },
                    usuarioId: { type: 'integer', example: 1 },
                    postId: { type: 'integer', example: 10 }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Comentario creado correctamente.' },
            400: { description: 'Datos inválidos o contenido vacío.' },
            404: { description: 'Usuario o Post no encontrado.' }
          }
        }
      },
      '/api/comentarios/post/{postId}': {
        get: {
          summary: 'Obtener comentarios de un post específico',
          description: 'Devuelve de forma aislada los comentarios que cumplen con el filtro de antigüedad configurable mediante variables de entorno (.env).',
          tags: ['Comentarios'],
          parameters: [{ name: 'postId', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            200: { description: 'Comentarios filtrados y cargados correctamente.' },
            404: { description: 'Post no encontrado.' }
          }
        }
      }
    }
  },
  apis: [],
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;