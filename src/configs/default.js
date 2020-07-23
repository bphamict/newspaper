module.exports = {
  app: {
    name: 'Newspaper',
    domain: 'newspaper-hcmus.herokuapp.com',
  },
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3308,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'newspaper',
    connectionLimit: 50,
  },
  pagination: {
    limit: 5,
  },
  authentication: {
    saltRounds: 10,
    randomString: {
      length: 64,
      characters:
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    },
    typeOfCode: {
      CONFIRM_ACCOUNT: 'CONFIRM_ACCOUNT',
      RESET_PASSWORD: 'RESET_PASSWORD',
    },
  },
};
