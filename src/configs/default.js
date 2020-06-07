module.exports = {
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 8889,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'newspaper',
    connectionLimit: 50,
  },
  pagination: {
    limit: 6,
  },
  authentication: {
    saltRounds: 10,
  },
};
