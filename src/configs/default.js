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
    dateStrings: true
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
    typeOfCode: {
      CONFIRM_ACCOUNT: 'CONFIRM_ACCOUNT',
      RESET_PASSWORD: 'RESET_PASSWORD',
    },
  },
  multerImagePost: {
    destination: function (req, file, cb) {
      cb(null, 'public/images/post');
    },
    filename: function (req, file, cb) {
      const extension = file.mimetype.split('/')[1];
      cb(null, file.fieldname + '-' + Date.now() + '.' + extension);
    }
  },
  toPdfOption: {
    format: 'A4',
    border: {
      "top": "1in",            // default is 0, units: mm, cm, in, px
      "right": "0.5in",
      "bottom": "1in",
      "left": "0.5in"
    },
  }
};
