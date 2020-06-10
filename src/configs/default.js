module.exports = {
  app: {
    name: 'Newspaper',
    domain: 'newspaper-hcmus.herokuapp.com',
  },
  mysql: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'newspaper',
    connectionLimit: 50,
  },
  pagination: {
    limit: 6,
  },
  authentication: {
    saltRounds: 10,
    randomString: {
      length: 64,
      characters:
        '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    },
  },
  multerImagePost: {
    destination: function (req, file, cb) {
      cb(null, 'public/images/post')
    },
    filename: function (req, file, cb) {
      const extension = file.mimetype.split('/')[1];
      cb(null, file.fieldname + '-' + Date.now() + '.' + extension)
    }
  }
};
