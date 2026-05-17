require('dotenv').config();

module.exports = {
  development: {
    dialect: "sqlite",
    storage: "./database.sqlite" // Aquí se va a crear el archivo físico
  },
  test: {
    dialect: "sqlite",
    storage: ":memory:" // Corre en memoria temporal para pruebas
  },
  production: {
    // Si en producción el día de mañana usan otra cosa (como MySQL o Postgres), 
    // se maneja transparente por variable de entorno sin romper el desarrollo local
    use_env_variable: "DATABASE_URL_PROD",
    dialect: "mysql"
  }
};

