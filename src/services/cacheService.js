const NodeCache = require('node-cache');

// Crear instancia de caché en memoria con TTL (Time To Live) configurable
// Por defecto: 10 minutos (600 segundos)
const cacheInstance = new NodeCache({ 
  stdTTL: parseInt(process.env.CACHE_TTL) || 600,
  checkperiod: 120 // Verificar expiración cada 2 minutos
});

/**
 * Obtener un valor del caché
 * @param {string} key - Clave del caché
 * @returns {any} Valor almacenado o undefined si expiró
 */
const get = (key) => {
  return cacheInstance.get(key);
};

/**
 * Guardar un valor en el caché
 * @param {string} key - Clave del caché
 * @param {any} value - Valor a almacenar
 * @param {number} ttl - Tiempo de vida en segundos (opcional, usa default si no se especifica)
 */
const set = (key, value, ttl = null) => {
  if (ttl) {
    cacheInstance.set(key, value, ttl);
  } else {
    cacheInstance.set(key, value);
  }
};

/**
 * Eliminar una clave del caché
 * @param {string} key - Clave del caché
 */
const del = (key) => {
  cacheInstance.del(key);
};

/**
 * Limpiar todo el caché
 */
const flush = () => {
  cacheInstance.flushAll();
};

/**
 * Obtener estadísticas del caché (para debugging)
 */
const getStats = () => {
  return cacheInstance.getStats();
};

module.exports = {
  get,
  set,
  del,
  flush,
  getStats
};
